'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useChatData } from '@/contexts/ChatDataContext';
import { UploadSelector } from '@/components/upload/UploadSelector';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { generateMockWrappedData } from '@/lib/utils/mock-data';
import { useRouter } from 'next/navigation';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};


function HomeContent() {
  const { state, dispatch } = useChatData();
  const [isLoadingMock, setIsLoadingMock] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if running on localhost
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      setIsLocalhost(hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1');
    }
  }, []);

  const handleLoadMockData = async () => {
    try {
      setIsLoadingMock(true);
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const wrappedData = await generateMockWrappedData();
      
      dispatch({ 
        type: 'SET_DATA', 
        payload: { 
          data: wrappedData, 
          chatName: wrappedData.chatName 
        } 
      });
      
      router.push('/wrapped');
    } catch (error) {
      console.error('Error loading mock data:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load mock data',
      });
    } finally {
      setIsLoadingMock(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="text-center mb-12 space-y-4"
        variants={itemVariants}
      >
        <motion.h1 
          className="text-5xl md:text-7xl font-bold bg-gradient-messenger bg-clip-text text-transparent"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Messenger Wrapped
        </motion.h1>
        <motion.p 
          className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Explore your Facebook Messenger chat history, inspired by Spotify Wrapped
        </motion.p>
      </motion.div>

      <div className="max-w-4xl mx-auto mb-12">
        <Card delay={0.2}>
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div>
              <motion.h2 
                className="text-2xl font-bold text-white mb-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                How to Get Started
              </motion.h2>
              <motion.div 
                className="space-y-4 text-white/80"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <h3 className="font-semibold text-white mb-2">1. Download Your Messenger Data</h3>
                  <div className="space-y-3 text-sm">
                    <p>
                      Visit{' '}
                      <a 
                        href="https://accountscenter.facebook.com/info_and_permissions/dyi" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-messenger-blue hover:text-blue-400 underline"
                      >
                        Facebook&apos;s Download Your Information page
                      </a>
                      {' '}to request your data.
                    </p>
                    <div className="space-y-2 ml-4">
                      <p className="font-medium text-white">Follow these steps:</p>
                      <ol className="list-decimal list-inside space-y-1.5 ml-2">
                        <li>Click <strong>&quot;Create Export&quot;</strong></li>
                        <li>Select <strong>&quot;Facebook Profile&quot;</strong></li>
                        <li>Choose <strong>&quot;Export to device&quot;</strong></li>
                        <li>Click <strong>&quot;Customize information&quot;</strong> and <strong>only select &quot;Messages&quot;</strong></li>
                        <li>Set <strong>Date range</strong> to <strong>&quot;Last year&quot;</strong></li>
                        <li>Set <strong>Format</strong> to <strong>&quot;JSON&quot;</strong> (HTML works too)</li>
                        <li>Set <strong>Media quality</strong> to <strong>&quot;Medium&quot;</strong></li>
                        <li>Click <strong>&quot;Create Export&quot;</strong> and wait for Facebook to prepare your data</li>
                        <li>Download the zip file when ready</li>
                      </ol>
                    </div>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <h3 className="font-semibold text-white mb-2">2. Upload Your Data</h3>
                  <p className="text-sm">
                    Upload the zip file you downloaded from Facebook. Your data is processed entirely locally in your browser.
                  </p>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <h3 className="font-semibold text-white mb-2">3. Explore Your Wrapped</h3>
                  <p className="text-sm">
                    View your chat statistics, top contributors, most reacted content, and more!
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </Card>
      </div>

      <motion.div 
        className="max-w-4xl mx-auto mb-8"
        variants={itemVariants}
      >
        <UploadSelector />
      </motion.div>

      {isLocalhost && (
        <>
          <motion.div 
            className="max-w-4xl mx-auto mb-8"
            variants={itemVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <motion.div 
                  className="w-full border-t border-white/20"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                />
              </div>
              <div className="relative flex justify-center text-sm">
                <motion.span 
                  className="px-4 bg-messenger-dark text-white/60"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  OR
                </motion.span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="max-w-4xl mx-auto mb-8"
            variants={itemVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-blue-500/10 border-blue-500/50" hover={true}>
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <h2 className="text-2xl font-bold text-white">🧪 Test with Mock Data</h2>
                <p className="text-white/80 text-sm">
                  Want to try out Messenger Wrapped without downloading your data? Click the button below to load sample data and explore all the features!
                </p>
                <Button
                  onClick={handleLoadMockData}
                  disabled={isLoadingMock || state.isLoading}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  {isLoadingMock ? 'Loading Mock Data...' : '🚀 Load Mock Data'}
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        </>
      )}

      <Modal
        isOpen={!!state.error}
        onClose={() => dispatch({ type: 'SET_ERROR', payload: null })}
        title="⚠️ Error"
        variant="error"
      >
        <p>{state.error}</p>
      </Modal>
    </motion.div>
  );
}

export default function Home() {
  return (
    <main className="flex-1 bg-messenger-dark">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <HomeContent />
      </div>
    </main>
  );
}

