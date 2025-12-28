'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  variant?: 'default' | 'error';
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  variant = 'default'
}: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1]
              }}
              onClick={(e) => e.stopPropagation()}
              className={`
                bg-messenger-dark rounded-xl border shadow-2xl 
                max-w-md w-full max-h-[90vh] overflow-y-auto
                pointer-events-auto
                ${variant === 'error' ? 'border-red-500/50' : 'border-white/10'}
              `}
            >
              <div className="p-6">
                {title && (
                  <div className="flex items-start justify-between mb-4">
                    <h2 className={`text-2xl font-bold ${variant === 'error' ? 'text-red-400' : 'text-white'}`}>
                      {title}
                    </h2>
                    <button
                      onClick={onClose}
                      className="text-white/60 hover:text-white transition-colors text-2xl leading-none"
                      aria-label="Close modal"
                    >
                      ×
                    </button>
                  </div>
                )}
                {!title && (
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={onClose}
                      className="text-white/60 hover:text-white transition-colors text-2xl leading-none"
                      aria-label="Close modal"
                    >
                      ×
                    </button>
                  </div>
                )}
                <div className={variant === 'error' ? 'text-red-300' : 'text-white/80'}>
                  {children}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={onClose}
                    variant={variant === 'error' ? 'primary' : 'secondary'}
                    size="md"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

