import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useSunset } from '../SunsetContext';

const NOTE_MAX = 300;

export function EditScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, updateSunset } = useSunset();
  const sunset = id ? getById(id) : undefined;

  const [place, setPlace] = useState(sunset?.place ?? '');
  const [time, setTime] = useState(sunset?.time ?? '');
  const [note, setNote] = useState(sunset?.note ?? '');

  useEffect(() => {
    if (!sunset) navigate('/', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!sunset) return null;

  const canSave = place.trim().length > 0;
  const isDirty =
    place.trim() !== (sunset.place ?? '') ||
    (time.trim() || undefined) !== sunset.time ||
    (note.trim() || undefined) !== sunset.note;

  const onSave = () => {
    if (!canSave) return;
    updateSunset(sunset.id, {
      place: place.trim(),
      time: time.trim() || undefined,
      note: note.trim() || undefined,
    });
    navigate(`/sunset/${sunset.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col min-h-0 overflow-y-auto px-5 pb-6"
    >
      <header className="pt-safe pt-5 flex items-center justify-between">
        <button
          onClick={() => navigate(`/sunset/${sunset.id}`)}
          className="text-fog text-[15px] font-medium"
        >
          Cancel
        </button>
        <h2 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-bold text-ghost">
          Edit details
        </h2>
        <button
          onClick={onSave}
          disabled={!canSave || !isDirty}
          className="text-[15px] font-semibold"
          style={{
            color: canSave && isDirty ? '#2EC4B6' : '#BBBBBB',
          }}
        >
          Save
        </button>
      </header>

      {/* Tiny image preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-[88px] h-[88px] rounded-2xl overflow-hidden self-start mt-5 mb-1"
        style={{ border: '2px solid #2EC4B6' }}
      >
        <img
          src={sunset.imageUrl}
          alt=""
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Place */}
      <motion.label
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="block mt-5 mb-4"
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
        transition={{ duration: 0.4, delay: 0.22 }}
        className="block mb-4"
      >
        <span className="font-serif text-[14px] font-semibold uppercase tracking-wider text-amber block mb-2">
          when{' '}
          <span className="text-fog text-[11px] font-medium normal-case tracking-normal">
            (optional)
          </span>
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
        transition={{ duration: 0.4, delay: 0.3 }}
        className="block mt-2"
      >
        <span className="font-serif text-[14px] font-semibold uppercase tracking-wider text-amber block mb-2">
          a memory{' '}
          <span className="text-fog text-[11px] font-medium normal-case tracking-normal">
            (optional)
          </span>
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
            className="text-[13px] font-medium"
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
        transition={{ duration: 0.4, delay: 0.4 }}
        whileTap={{ scale: 0.97 }}
        disabled={!canSave || !isDirty}
        onClick={onSave}
        className="mt-6 h-[52px] w-full rounded-full text-[16px] font-semibold tracking-tight"
        style={{
          background: canSave && isDirty ? '#2EC4B6' : '#E5D4BC',
          color: canSave && isDirty ? 'white' : '#8C7A6B',
          boxShadow:
            canSave && isDirty ? '0 8px 24px rgba(46,196,182,0.3)' : 'none',
        }}
      >
        Save changes
      </motion.button>
    </motion.div>
  );
}

export default EditScreen;
