import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { isSupabaseConfigured } from './lib/supabase';
import {
  type AppUser,
  getCurrentSession,
  sessionToUser,
  signInWithGoogle as signInWithGoogleApi,
  signOut as signOutApi,
  subscribeToAuthChanges,
} from './lib/auth';
import {
  deleteFollow,
  deleteLike,
  deleteSavedPost,
  fetchFollowing,
  fetchLikedPosts,
  fetchSavedPosts,
  insertFollow,
  insertLike,
  insertSavedPost,
} from './lib/community-db';
import {
  loadLocalFollowing,
  loadLocalLiked,
  loadLocalSaved,
  saveLocalFollowing,
  saveLocalLiked,
  saveLocalSaved,
} from './lib/local-social';
import { loadLocalSunsets, saveLocalSunsets } from './lib/local-sunsets';
import {
  fetchSunsets,
  insertSunset,
  updateSunsetRow,
} from './lib/sunsets-db';
import { uploadSunsetImage } from './lib/storage';

export interface Sunset {
  id: string;
  /** Either a `data:` URL (during upload) or a remote https URL once synced. */
  imageUrl: string;
  place: string;
  time?: string;
  note?: string;
  createdAt: number;
  /** True while the image is being uploaded / row inserted. */
  syncing?: boolean;
  /** Set if the sync failed; the row stays local-only. */
  syncError?: string;
}

export interface Draft {
  imageUrl?: string;
  place?: string;
  time?: string;
  note?: string;
}

interface SunsetState {
  // Auth
  user: AppUser | null;
  authConfigured: boolean;
  authLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;

  // Sunsets
  sunsets: Sunset[];
  sunsetsLoading: boolean;
  draft: Draft;
  setDraft: (patch: Partial<Draft>) => void;
  resetDraft: () => void;
  addSunset: (
    data: Omit<Sunset, 'id' | 'createdAt' | 'syncing' | 'syncError'>,
  ) => Sunset;
  updateSunset: (
    id: string,
    patch: Partial<Omit<Sunset, 'id' | 'createdAt'>>,
  ) => void;
  getById: (id: string) => Sunset | undefined;

  // Community social state
  following: Set<string>;
  toggleFollow: (userId: string) => void;
  isFollowing: (userId: string) => boolean;

  saved: Set<string>;
  toggleSaved: (postId: string) => void;
  isSaved: (postId: string) => boolean;

  liked: Set<string>;
  toggleLike: (postId: string) => void;
  isLiked: (postId: string) => boolean;
}

const Ctx = createContext<SunsetState | null>(null);

export function SunsetProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(isSupabaseConfigured);
  const [sunsets, setSunsets] = useState<Sunset[]>(() => loadLocalSunsets());
  const [sunsetsLoading, setSunsetsLoading] = useState<boolean>(false);
  const [draft, setDraftState] = useState<Draft>({});
  const [following, setFollowing] = useState<Set<string>>(() =>
    loadLocalFollowing(),
  );
  const [saved, setSaved] = useState<Set<string>>(() => loadLocalSaved());
  const [liked, setLiked] = useState<Set<string>>(() => loadLocalLiked());

  // Bootstrap auth + session
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }
    let cancelled = false;
    getCurrentSession()
      .then((s) => {
        if (cancelled) return;
        setUser(sessionToUser(s));
        setAuthLoading(false);
      })
      .catch(() => setAuthLoading(false));
    const unsub = subscribeToAuthChanges((session) => {
      setUser(sessionToUser(session));
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  // Hydrate sunsets from Supabase when signed in
  useEffect(() => {
    if (!isSupabaseConfigured || !user) return;
    setSunsetsLoading(true);
    fetchSunsets(user.id)
      .then((rows) => setSunsets(rows))
      .catch((err) => console.error('[sunsets] fetch failed', err))
      .finally(() => setSunsetsLoading(false));
  }, [user]);

  // Hydrate social state from Supabase when signed in
  useEffect(() => {
    if (!isSupabaseConfigured || !user) return;
    Promise.all([
      fetchFollowing(user.id),
      fetchSavedPosts(user.id),
      fetchLikedPosts(user.id),
    ])
      .then(([f, s, l]) => {
        setFollowing(f);
        setSaved(s);
        setLiked(l);
      })
      .catch((err) => console.error('[social] fetch failed', err));
  }, [user]);

  // Persist sunsets locally when not cloud-backed
  useEffect(() => {
    if (user && isSupabaseConfigured) return;
    saveLocalSunsets(sunsets);
  }, [sunsets, user]);

  // Persist social state locally when not cloud-backed
  useEffect(() => {
    if (user && isSupabaseConfigured) return;
    saveLocalFollowing(following);
  }, [following, user]);

  useEffect(() => {
    if (user && isSupabaseConfigured) return;
    saveLocalSaved(saved);
  }, [saved, user]);

  useEffect(() => {
    if (user && isSupabaseConfigured) return;
    saveLocalLiked(liked);
  }, [liked, user]);

  const setDraft = useCallback((patch: Partial<Draft>) => {
    setDraftState((d) => ({ ...d, ...patch }));
  }, []);

  const resetDraft = useCallback(() => setDraftState({}), []);

  const addSunset = useCallback(
    (data: Omit<Sunset, 'id' | 'createdAt' | 'syncing' | 'syncError'>): Sunset => {
      const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const createdAt = Date.now();
      const optimistic: Sunset = {
        id,
        createdAt,
        imageUrl: data.imageUrl,
        place: data.place,
        time: data.time,
        note: data.note,
        syncing: !!user && isSupabaseConfigured,
      };
      setSunsets((list) => [optimistic, ...list]);
      setDraftState({});

      if (user && isSupabaseConfigured) {
        (async () => {
          try {
            const remoteUrl = await uploadSunsetImage(
              data.imageUrl,
              user.id,
              id,
            );
            const synced: Sunset = {
              ...optimistic,
              imageUrl: remoteUrl,
              syncing: false,
            };
            await insertSunset(user.id, synced);
            setSunsets((list) =>
              list.map((s) => (s.id === id ? synced : s)),
            );
          } catch (err) {
            console.error('[sunsets] sync failed', err);
            setSunsets((list) =>
              list.map((s) =>
                s.id === id
                  ? { ...s, syncing: false, syncError: String(err) }
                  : s,
              ),
            );
          }
        })();
      }

      return optimistic;
    },
    [user],
  );

  const updateSunset = useCallback(
    (
      id: string,
      patch: Partial<Omit<Sunset, 'id' | 'createdAt'>>,
    ) => {
      setSunsets((list) =>
        list.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      );
      if (user && isSupabaseConfigured) {
        const dbPatch = {
          place: patch.place,
          time: patch.time,
          note: patch.note,
          imageUrl: patch.imageUrl,
        };
        updateSunsetRow(id, dbPatch).catch((err) =>
          console.error('[sunsets] update failed', err),
        );
      }
    },
    [user],
  );

  const getById = useCallback(
    (id: string) => sunsets.find((s) => s.id === id),
    [sunsets],
  );

  const toggleFollow = useCallback(
    (followedUser: string) => {
      setFollowing((prev) => {
        const next = new Set(prev);
        const wasFollowing = next.has(followedUser);
        wasFollowing ? next.delete(followedUser) : next.add(followedUser);

        if (user && isSupabaseConfigured) {
          const sync = wasFollowing
            ? deleteFollow(user.id, followedUser)
            : insertFollow(user.id, followedUser);
          sync.catch((err) => console.error('[follows] sync failed', err));
        }

        return next;
      });
    },
    [user],
  );

  const isFollowing = useCallback(
    (followedUser: string) => following.has(followedUser),
    [following],
  );

  const toggleSaved = useCallback(
    (postId: string) => {
      setSaved((prev) => {
        const next = new Set(prev);
        const wasSaved = next.has(postId);
        wasSaved ? next.delete(postId) : next.add(postId);

        if (user && isSupabaseConfigured) {
          const sync = wasSaved
            ? deleteSavedPost(user.id, postId)
            : insertSavedPost(user.id, postId);
          sync.catch((err) => console.error('[saved] sync failed', err));
        }

        return next;
      });
    },
    [user],
  );

  const isSaved = useCallback((postId: string) => saved.has(postId), [saved]);

  const toggleLike = useCallback(
    (postId: string) => {
      setLiked((prev) => {
        const next = new Set(prev);
        const wasLiked = next.has(postId);
        wasLiked ? next.delete(postId) : next.add(postId);

        if (user && isSupabaseConfigured) {
          const sync = wasLiked
            ? deleteLike(user.id, postId)
            : insertLike(user.id, postId);
          sync.catch((err) => console.error('[likes] sync failed', err));
        }

        return next;
      });
    },
    [user],
  );

  const isLiked = useCallback((postId: string) => liked.has(postId), [liked]);

  const signInWithGoogle = useCallback(async () => {
    await signInWithGoogleApi();
  }, []);

  const signOut = useCallback(async () => {
    await signOutApi();
    setUser(null);
    setSunsets(loadLocalSunsets());
    setFollowing(loadLocalFollowing());
    setSaved(loadLocalSaved());
    setLiked(loadLocalLiked());
  }, []);

  const value = useMemo(
    () => ({
      user,
      authConfigured: isSupabaseConfigured,
      authLoading,
      signInWithGoogle,
      signOut,

      sunsets,
      sunsetsLoading,
      draft,
      setDraft,
      resetDraft,
      addSunset,
      updateSunset,
      getById,

      following,
      toggleFollow,
      isFollowing,

      saved,
      toggleSaved,
      isSaved,

      liked,
      toggleLike,
      isLiked,
    }),
    [
      user,
      authLoading,
      signInWithGoogle,
      signOut,
      sunsets,
      sunsetsLoading,
      draft,
      setDraft,
      resetDraft,
      addSunset,
      updateSunset,
      getById,
      following,
      toggleFollow,
      isFollowing,
      saved,
      toggleSaved,
      isSaved,
      liked,
      toggleLike,
      isLiked,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSunset(): SunsetState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSunset must be inside SunsetProvider');
  return v;
}
