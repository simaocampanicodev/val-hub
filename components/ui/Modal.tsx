import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from './Button';
import { useGame } from '../../context/GameContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'info'
}) => {
  const { themeMode } = useGame();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const variantColors = {
    danger: 'border-red-500/30',
    warning: 'border-red-500/30',
    info: 'border-blue-500/30'
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen min-w-full bg-black/60 backdrop-blur-xl p-4"
      onClick={onClose}
    >
      <div
        className={`
          relative max-w-md w-full max-h-[90vh] overflow-auto rounded-[2rem] border shadow-[0_0_50px_rgba(0,0,0,0.5)]
          ${themeMode === 'dark' ? 'bg-[#0a0505]/90 border-white/5 backdrop-blur-2xl' : 'bg-white/90 border-zinc-200 backdrop-blur-2xl'}
          ${variantColors[variant]}
          animate-in zoom-in-95 duration-300
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 pointer-events-none rounded-[2rem] border-[1px] border-white/[0.05] mix-blend-overlay"></div>
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <h3 className={`text-xl font-display font-bold mb-3 ${themeMode === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
            {title}
          </h3>
          <p className={`text-sm mb-6 ${themeMode === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
            {message}
          </p>

          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={onClose}>
              {cancelText}
            </Button>
            <Button
              variant={variant === 'danger' ? 'danger' : 'primary'}
              onClick={handleConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
