import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
  themeMode: 'dark' | 'light';
}

const ToastItem: React.FC<ToastProps> = ({ toast, onRemove, themeMode }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 4000;
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const colors = {
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]',
    error: 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.1)]',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.1)]',
    info: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-300 shadow-[0_0_20px_rgba(113,113,122,0.1)]'
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-3xl shadow-2xl relative overflow-hidden
        ${colors[toast.type]}
        ${themeMode === 'dark' ? 'bg-[#0a0505]/95 backdrop-blur-2xl' : 'bg-white/95 backdrop-blur-2xl text-zinc-800'}
        transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 translate-x-full scale-95' : 'opacity-100 translate-x-0 scale-100'}
        min-w-[300px] max-w-[400px]
      `}
    >
      <div className="absolute inset-0 pointer-events-none rounded-2xl border-[1px] border-white/[0.05] mix-blend-overlay"></div>
      <div className="flex-shrink-0 z-10">
        {icons[toast.type]}
      </div>
      <div className="flex-1 text-sm font-medium">
        {toast.message}
      </div>
      <button
        onClick={handleRemove}
        className="flex-shrink-0 text-current/60 hover:text-current transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
  themeMode: 'dark' | 'light';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove, themeMode }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={onRemove} themeMode={themeMode} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
