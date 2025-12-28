'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

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

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1 bg-messenger-dark">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-200 mb-6"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-messenger bg-clip-text text-transparent mb-4">
              Privacy Policy
            </h1>
            <p className="text-white/60 text-sm">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>

          <Card className="space-y-8">
            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="text-white/80 leading-relaxed">
                Welcome to Messenger Wrapped. We are committed to protecting your privacy and ensuring the security of your personal data. This Privacy Policy explains how we handle your information when you use our application.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">2. Data Processing</h2>
              <div className="space-y-4 text-white/80 leading-relaxed">
                <p>
                  <strong className="text-white">Local Processing Only:</strong> All data processing in Messenger Wrapped occurs entirely within your web browser on your device. We do not collect, store, or transmit any of your Messenger data to external servers.
                </p>
                <p>
                  <strong className="text-white">No Data Collection:</strong> We do not collect, store, or have access to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your messages or chat content</li>
                  <li>Media files (photos, videos, audio)</li>
                  <li>Personal information from your Messenger data</li>
                  <li>Any analytics or usage data tied to your identity</li>
                </ul>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">3. How It Works</h2>
              <div className="space-y-4 text-white/80 leading-relaxed">
                <p>
                  When you upload your Messenger data:
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Files are read directly in your browser using client-side JavaScript</li>
                  <li>All processing happens locally on your device</li>
                  <li>No data is sent over the network</li>
                  <li>No data is stored on any server</li>
                  <li>You can close the browser tab and all data is cleared from memory</li>
                </ol>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Services</h2>
              <p className="text-white/80 leading-relaxed">
                Messenger Wrapped does not use third-party analytics, tracking services, or advertising networks. The application runs entirely client-side without external dependencies that would access your data.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">5. Browser Storage</h2>
              <p className="text-white/80 leading-relaxed">
                We may use browser localStorage or sessionStorage to temporarily store your processed data for the duration of your session. This data remains on your device and is cleared when you close your browser or clear your browser data.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
              <div className="space-y-4 text-white/80 leading-relaxed">
                <p>You have complete control over your data:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You choose what data to upload</li>
                  <li>You can close the application at any time</li>
                  <li>You can clear your browser data to remove any stored information</li>
                  <li>No account or registration is required</li>
                </ul>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">7. Security</h2>
              <p className="text-white/80 leading-relaxed">
                Since all processing occurs locally in your browser, your data never leaves your device. This provides the highest level of privacy and security. However, you should always ensure you are using a secure, up-to-date browser and only upload data from trusted sources.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">8. Changes to This Policy</h2>
              <p className="text-white/80 leading-relaxed">
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">9. Contact</h2>
              <p className="text-white/80 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us through our{' '}
                <a
                  href="https://github.com/matthewapuya/messenger-wrapped"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-messenger-blue hover:text-blue-400 underline"
                >
                  GitHub repository
                </a>
                .
              </p>
            </motion.section>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}

