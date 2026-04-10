import React, { useState, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Toast Context - Global notification management
 */
const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

/**
 * Toast Item Component
 */
const ToastItem = ({ id, type = 'info', title, message, action, onClose, duration = 5000 }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const colors = {
    success: 'border-emerald-500/50 bg-emerald-500/10',
    error: 'border-red-500/50 bg-red-500/10',
    warning: 'border-amber-500/50 bg-amber-500/10',
    info: 'border-blue-500/50 bg-blue-500/10',
  };

  const textColors = {
    success: 'text-emerald-400',
    error: 'text-red-400',
    warning: 'text-amber-400',
    info: 'text-blue-400',
  };

  React.useEffect(() => {
    if (duration <= 0) return;

    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: 400 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 400 }}
      transition={{ duration: 0.3 }}
      className={`relative w-96 max-w-[calc(100vw-2rem)] p-4 border rounded-lg backdrop-blur-sm ${colors[type]}`}
    >
      {/* Progress Bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-1 origin-left ${
          type === 'success'
            ? 'bg-emerald-500'
            : type === 'error'
            ? 'bg-red-500'
            : type === 'warning'
            ? 'bg-amber-500'
            : 'bg-blue-500'
        }`}
        style={{ borderRadius: '0 0 0.5rem 0' }}
      />

      <div className="flex gap-3 items-start">
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-grow min-w-0">
          {title && <h4 className="font-semibold text-white mb-1">{title}</h4>}
          {message && <p className={`text-sm ${textColors[type]}`}>{message}</p>}
          {action && (
            <div className="mt-2 flex gap-2">
              {action}
            </div>
          )}
        </div>
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 text-slate-400 hover:text-white transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

ToastItem.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  title: PropTypes.string,
  message: PropTypes.string,
  action: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number,
};

/**
 * Toast Container - Displays all active toasts
 */
const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem {...toast} onClose={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.array.isRequired,
  onRemove: PropTypes.func.isRequired,
};

/**
 * Toast Provider - Wraps app to provide toast functionality
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({
    title,
    message,
    type = 'info',
    duration = 5000,
    action,
  }) => {
    const id = `${Date.now()}-${Math.random()}`;

    setToasts((prev) => [
      ...prev,
      {
        id,
        title,
        message,
        type,
        duration,
        action,
      },
    ]);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = {
    addToast,
    removeToast,
    success: (title, message, duration, action) =>
      addToast({ title, message, type: 'success', duration, action }),
    error: (title, message, duration, action) =>
      addToast({ title, message, type: 'error', duration, action }),
    warning: (title, message, duration, action) =>
      addToast({ title, message, type: 'warning', duration, action }),
    info: (title, message, duration, action) =>
      addToast({ title, message, type: 'info', duration, action }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ToastItem;
