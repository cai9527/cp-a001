import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}

export default function Modal({ open, title, onClose, children, width = 'max-w-2xl' }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-dark-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${width} mx-4 max-h-[90vh] flex flex-col animate-slide-up`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-100 flex-shrink-0">
          <h3 className="text-base font-semibold text-dark-600">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-dark-400 hover:text-dark-600 hover:bg-dark-50 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
