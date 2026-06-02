export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <button onClick={onClose} className="float-right text-gray-400">✕</button>
        {children}
      </div>
    </div>
  );
}
