import { useEffect, useRef, useState } from 'react';
import { UploadSimple, X, ImageSquare } from '@phosphor-icons/react';

const MAX_SIZE_MB = 5;
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;

export default function ImageUpload({ files = [], onChange, maxFiles = 5 }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const addFiles = (incoming) => {
    setError('');
    const list = Array.from(incoming || []);
    const accepted = [];
    const rejected = [];

    for (const f of list) {
      if (!f.type.startsWith('image/')) {
        rejected.push(`${f.name} không phải ảnh`);
        continue;
      }
      if (f.size > MAX_SIZE) {
        rejected.push(`${f.name} vượt quá ${MAX_SIZE_MB}MB`);
        continue;
      }
      accepted.push(f);
    }

    const next = [...files, ...accepted].slice(0, maxFiles);
    const overflow = files.length + accepted.length - maxFiles;
    if (overflow > 0) rejected.push(`Tối đa ${maxFiles} ảnh`);

    if (rejected.length) setError(rejected.join(' · '));
    if (next.length !== files.length) onChange(next);
  };

  const removeAt = (idx) => {
    const next = files.filter((_, i) => i !== idx);
    onChange(next);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const canAdd = files.length < maxFiles;

  return (
    <div className="space-y-3">
      {canAdd && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`w-full flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-xl border-2 border-dashed ${
            dragOver
              ? 'border-accent bg-accent-light/40'
              : 'border-gray-300 hover:border-teal-400 bg-white'
          }`}
        >
          <span className="w-10 h-10 rounded-full bg-bg-subtle text-gray-500 flex items-center justify-center">
            <UploadSimple size={20} weight="light" />
          </span>
          <span className="text-sm text-gray-700">
            Kéo thả ảnh vào đây hoặc <span className="text-accent font-medium">click để chọn</span>
          </span>
          <span className="text-xs text-gray-500">
            Tối đa {maxFiles} ảnh · mỗi ảnh ≤ {MAX_SIZE_MB}MB · JPG, PNG, WebP
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {error && (
        <p className="text-xs text-status-lost bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((src, idx) => (
            <div
              key={src}
              className="relative aspect-square bg-bg-subtle rounded-lg overflow-hidden border border-gray-200/70"
            >
              <img
                src={src}
                alt={`Ảnh ${idx + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
                aria-label="Xóa ảnh"
              >
                <X size={12} weight="bold" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px]">
                  <ImageSquare size={10} weight="light" />
                  Ảnh bìa
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
