
import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-xl shadow-2xl border backdrop-blur-xl animate-fade-in-up flex items-center gap-4 transition-all ${
              toast.type === 'success' 
                ? 'bg-green-50/95 dark:bg-green-900/90 border-green-200 dark:border-green-700/50 text-green-900 dark:text-green-50' 
                : toast.type === 'error'
                ? 'bg-red-50/95 dark:bg-red-900/90 border-red-200 dark:border-red-700/50 text-red-900 dark:text-red-50'
                : 'bg-white/95 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${
                toast.type === 'success' ? 'bg-green-100 dark:bg-green-800' :
                toast.type === 'error' ? 'bg-red-100 dark:bg-red-800' :
                'bg-slate-100 dark:bg-slate-700'
            }`}>
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '✕'}
              {toast.type === 'info' && 'i'}
            </div>
            <p className="font-semibold text-sm leading-tight">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
