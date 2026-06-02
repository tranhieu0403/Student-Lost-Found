import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle, WarningCircle, Info, X } from '@phosphor-icons/react';

const ToastContext = createContext(null);

const DURATION = 4000;

const STYLES = {
  success: 'bg-white border-green-200 text-gray-900',
  error: 'bg-white border-red-200 text-gray-900',
  info: 'bg-white border-accent/30 text-gray-900',
};

const ICONS = {
  success: { Icon: CheckCircle, className: 'text-green-600' },
  error: { Icon: WarningCircle, className: 'text-red-600' },
  info: { Icon: Info, className: 'text-accent' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((input) => {
    const id = ++idRef.current;
    const toast = typeof input === 'string'
      ? { id, type: 'info', message: input }
      : { id, type: input.type || 'info', message: input.message || '' };
    setToasts((list) => [...list, toast]);
    setTimeout(() => dismiss(id), DURATION);
    return id;
  }, [dismiss]);

  const value = {
    show,
    success: (message) => show({ type: 'success', message }),
    error: (message) => show({ type: 'error', message }),
    info: (message) => show({ type: 'info', message }),
    dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-[calc(100vw-2rem)] w-80 pointer-events-none">
      {toasts.map((t) => {
        const { Icon, className } = ICONS[t.type] || ICONS.info;
        return (
          <div
            key={t.id}
            role="status"
            className={`toast-enter pointer-events-auto flex items-start gap-2.5 border rounded-xl shadow-card px-3 py-2.5 ${STYLES[t.type] || STYLES.info}`}
          >
            <Icon size={18} weight="fill" className={`shrink-0 mt-0.5 ${className}`} />
            <p className="flex-1 text-sm leading-snug">{t.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="shrink-0 p-0.5 text-gray-400 hover:text-gray-600"
              aria-label="Đóng"
            >
              <X size={14} weight="light" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
