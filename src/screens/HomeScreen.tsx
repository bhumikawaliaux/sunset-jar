import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import JarSVG from '../components/JarSVG';
import BottomNav from '../components/BottomNav';
import { useSunset } from '../SunsetContext';
import { DEFAULT_PALETTE } from '../palettes';

export function HomeScreen() {
  const navigate = useNavigate();
  const { sunsets, setDraft, resetDraft } = useSunset();
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickPhoto = () => {
    resetDraft();
    fileRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDraft({ imageUrl: reader.result as string });
      navigate('/memory');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col min-h-0 relative"
    >
      <div className="flex-1 overflow-y-auto pb-20">
        <header className="flex items-center px-5 pt-safe pt-5 pb-1">
          <h1 className="text-[22px] font-bold text-amber leading-none tracking-tight">
            Sunset Jar
          </h1>
        </header>

        <p className="px-5 pb-4 text-fog text-[13px] font-medium">
          {sunsets.length === 0
            ? 'No sunsets yet — go catch your first one'
            : `${sunsets.length} sunset${sunsets.length === 1 ? '' : 's'}, safely kept.`}
        </p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />

        <div className="grid grid-cols-2 gap-3 px-4 mt-1">
          {sunsets.map((s) => (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
              onClick={() => navigate(`/sunset/${s.id}`)}
              className="rounded-2xl bg-transparent p-3 flex flex-col items-center h-[220px]"
            >
              <div className="flex items-center justify-center" style={{ height: 160 }}>
                <JarSVG size="sm" imageSrc={s.imageUrl} palette={DEFAULT_PALETTE} />
              </div>
              <div className="mt-2 w-full text-center" style={{ height: 32 }}>
                <span className="block text-ghost text-[13px] font-semibold truncate leading-none">
                  {s.place}
                </span>
                <span className="block text-fog text-[11px] mt-1 truncate font-medium leading-none">
                  {s.time || ' '}
                </span>
              </div>
            </motion.button>
          ))}

          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={onPickPhoto}
            className="group rounded-2xl flex flex-col items-center p-3 h-[220px] bg-transparent"
          >
            <div className="flex items-center justify-center" style={{ height: 160 }}>
              <JarSVG size="sm" showPlusIcon hideContents palette={DEFAULT_PALETTE} />
            </div>
            <div className="mt-2 w-full text-center" style={{ height: 32 }}>
              <span className="block text-amber text-[13px] font-semibold leading-none">
                Pour a new sunset
              </span>
              <span className="block text-[11px] mt-1 leading-none">&nbsp;</span>
            </div>
          </motion.button>
        </div>
      </div>

      <BottomNav active="home" />
    </motion.div>
  );
}

export default HomeScreen;
