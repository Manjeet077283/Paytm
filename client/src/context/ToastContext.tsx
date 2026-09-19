import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = `TOAST_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const success = useCallback((msg: string) => showToast('success', msg), [showToast]);
  const error = useCallback((msg: string) => showToast('error', msg), [showToast]);
  const warning = useCallback((msg: string) => showToast('warning', msg), [showToast]);
  const info = useCallback((msg: string) => showToast('info', msg), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-3">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isError = toast.type === 'error';
            const isSuccess = toast.type === 'success';
            const isWarning = toast.type === 'warning';

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto flex items-start space-x-3 p-3.5 rounded-2xl shadow-xl border text-xs font-medium backdrop-blur-md ${
                  isError
                    ? 'bg-rose-50/95 text-rose-950 border-rose-200'
                    : isSuccess
                    ? 'bg-emerald-50/95 text-emerald-950 border-emerald-200'
                    : isWarning
                    ? 'bg-amber-50/95 text-amber-950 border-amber-200'
                    : 'bg-blue-50/95 text-blue-950 border-blue-200'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isError && <XCircle className="w-4 h-4 text-rose-600" />}
                  {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {isWarning && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                  {!isError && !isSuccess && !isWarning && <Info className="w-4 h-4 text-[#00BAF2]" />}
                </div>

                <div className="flex-grow pr-1 leading-relaxed">
                  <p className="font-semibold">{toast.message}</p>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-black/5 transition-colors"
                  aria-label="Dismiss toast"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};
