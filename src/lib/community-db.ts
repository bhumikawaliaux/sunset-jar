import { supabase } from './supabase';

export async function fetchFollowing(userId: string): Promise<Set<string>> {
  if (!supabase) return new Set();
  const { data, error } = await supabase
    .from('follows')
    .select('followed_user')
    .eq('follower_id', userId);
  if (error) throw error;
  return new Set(
    (data as { followed_user: string }[] | null)?.map((r) => r.followed_user) ??
      [],
  );
}

export async function fetchSavedPosts(userId: string): Promise<Set<string>> {
  if (!supabase) return new Set();
  const { data, error } = await supabase
    .from('saved_posts')
    .select('post_id')
    .eq('user_id', userId);
  if (error) throw error;
  return new Set(
    (data as { post_id: string }[] | null)?.map((r) => r.post_id) ?? [],
  );
}

export async function fetchLikedPosts(userId: string): Promise<Set<string>> {
  if (!supabase) return new Set();
  const { data, error } = await supabase
    .from('community_likes')
    .select('post_id')
    .eq('user_id', userId);
  if (error) throw error;
  return new Set(
    (data as { post_id: string }[] | null)?.map((r) => r.post_id) ?? [],
  );
}

export async function insertFollow(
  userId: string,
  followedUser: string,
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('follows').insert({
    follower_id: userId,
    followed_user: followedUser,
  });
  if (error) throw error;
}

export async function deleteFollow(
  userId: string,
  followedUser: string,
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', userId)
    .eq('followed_user', followedUser);
  if (error) throw error;
}

export async function insertSavedPost(
  userId: string,
  postId: string,
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('saved_posts').insert({
    user_id: userId,
    post_id: postId,
  });
  if (error) throw error;
}

export async function deleteSavedPost(
  userId: string,
  postId: string,
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('saved_posts')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);
  if (error) throw error;
}

export async function insertLike(
  userId: string,
  postId: string,
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('community_likes').insert({
    user_id: userId,
    post_id: postId,
  });
  if (error) throw error;
}

export async function deleteLike(
  userId: string,
  postId: string,
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('community_likes')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);
  if (error) throw error;
}
