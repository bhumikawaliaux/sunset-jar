import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSunset } from '../SunsetContext';

const NOTE_MAX = 300;

export function MemoryScreen() {
  const navigate = useNavigate();
  const { draft, addSunset } = useSunset();

  const [place, setPlace] = useState(draft.place ?? '');
  const [time, setTime] = useState(draft.time ?? '');
  const [note, setNote] = useState(draft.note ?? '');

  useEffect(() => {
    if (!draft.imageUrl) {
      navigate('/', { replace: true });
    }
    // Only check on mount — after a successful save the draft is reset
    // but we're already on the way to /captured.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSave = place.trim().length > 0;

  const onSave = () => {
    if (!canSave || !draft.imageUrl) return;
    const sunset = addSunset({
      imageUrl: draft.imageUrl,
      place: place.trim(),
      time: time.trim() || undefined,
      note: note.trim() || undefined,
    });
    navigate('/captured', { state: { id: sunset.id, animatePour: true } });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col px-5 pb-6"
    >
      {/* Header */}
      <header className="pt-safe pt-5 flex items-center justify-between">
        <button
          onClick={() => {
            // Cancel — go home and drop the draft
            navigate('/');
          }}
          className="text-fog text-[15px] font-medium"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={!canSave}
          className="text-[15px] font-semibold"
          style={{ color: canSave ? '#2EC4B6' : '#BBBBBB' }}
        >
          Save
        </button>
      </header>

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="font-serif text-[26px] font-semibold text-ghost mt-4 leading-tight tracking-tight"
      >
        A little memory
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="font-sans text-[14px] text-fog mt-1 mb-5"
      >
        write something to remember this golden hour
      </motion.p>

      {/* Tiny image preview */}
      {draft.imageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="w-[88px] h-[88px] rounded-2xl overflow-hidden self-start mb-5"
          style={{ border: '2px solid #2EC4B6' }}
        >
          <img
            src={draft.imageUrl}
            alt="Your sunset"
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}

      {/* Place */}
      <motion.label
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="block mb-4"
      >
        <span className="font-serif text-[14px] font-semibold uppercase tracking-wider text-amber block mb-2">
          where was this?
        </span>
        <input
          type="text"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="Bandra Bandstand, Mumbai"
          className="w-full bg-transparent text-[17px] text-ink font-medium pb-2 amber-underline outline-none placeholder:text-[#BBBBBB]"
        />
      </motion.label>

      {/* Time */}
      <motion.label
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.28 }}
        className="block mb-4"
      >
        <span className="font-serif text-[14px] font-semibold uppercase tracking-wider text-amber block mb-2">
          when <span className="text-fog text-[11px] font-medium normal-case tracking-normal">(optional)</span>
        </span>
        <input
          type="text"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="6:42 PM, May 12"
          className="w-full bg-transparent text-[17px] text-ink font-medium pb-2 amber-underline outline-none placeholder:text-[#BBBBBB]"
        />
      </motion.label>

      {/* Note */}
      <motion.label
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.36 }}
        className="block mt-2"
      >
        <span className="font-serif text-[14px] font-semibold uppercase tracking-wider text-amber block mb-2">
          a memory <span className="text-fog text-[11px] font-medium normal-case tracking-normal">(optional)</span>
        </span>
        <textarea
          value={note}
          maxLength={NOTE_MAX}
          onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
          rows={4}
          placeholder="the air smelled like salt and the sky bled orange…"
          className="w-full bg-[rgba(255,255,255,0.55)] rounded-2xl p-3 text-[15px] text-ink leading-snug outline-none placeholder:text-[#BBBBBB] resize-none"
          style={{ border: '1.5px dashed rgba(46,196,182,0.4)' }}
        />
        <div className="flex justify-end mt-1">
          <span
            className="text-[13px] font-sans"
            style={{ color: note.length >= NOTE_MAX ? '#2EC4B6' : '#8C7A6B' }}
          >
            {note.length}/{NOTE_MAX}
          </span>
        </div>
      </motion.label>

      {/* Save button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        whileTap={{ scale: 0.97 }}
        disabled={!canSave}
        onClick={onSave}
        className="mt-6 h-[52px] w-full rounded-full text-[16px] font-semibold tracking-tight"
        style={{
          background: canSave ? '#2EC4B6' : '#E5D4BC',
          color: canSave ? 'white' : '#8C7A6B',
          boxShadow: canSave ? '0 4px 4px rgba(37,40,43,0.15)' : 'none',
        }}
      >
        Seal the jar
      </motion.button>
    </motion.div>
  );
}

export default MemoryScreen;
