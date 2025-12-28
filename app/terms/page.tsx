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

export default function TermsOfUsePage() {
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
              Terms of Use
            </h1>
            <p className="text-white/60 text-sm">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>

          <Card className="space-y-8">
            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-white/80 leading-relaxed">
                By accessing and using Messenger Wrapped, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
              <p className="text-white/80 leading-relaxed">
                Messenger Wrapped is a web application that allows you to analyze your Facebook Messenger chat history locally in your browser. The service processes your data entirely on your device and does not transmit any information to external servers.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Responsibilities</h2>
              <div className="space-y-4 text-white/80 leading-relaxed">
                <p>You agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Only upload data that you own or have permission to use</li>
                  <li>Use the service in compliance with all applicable laws and regulations</li>
                  <li>Not use the service for any illegal or unauthorized purpose</li>
                  <li>Not attempt to gain unauthorized access to any part of the service</li>
                  <li>Maintain the confidentiality of any data you process</li>
                </ul>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">4. Data Ownership</h2>
              <p className="text-white/80 leading-relaxed">
                You retain full ownership of all data you upload to Messenger Wrapped. We do not claim any ownership rights over your data. All processing is performed locally on your device, and we do not store, copy, or access your data on any server.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">5. Service Availability</h2>
              <p className="text-white/80 leading-relaxed">
                Messenger Wrapped is provided &quot;as is&quot; and &quot;as available.&quot; We do not guarantee that the service will be available at all times, uninterrupted, or error-free. The service may be subject to limitations, delays, and other problems inherent in the use of the internet and electronic communications.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
              <p className="text-white/80 leading-relaxed">
                To the fullest extent permitted by law, Messenger Wrapped and its developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the service.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">7. Disclaimer of Warranties</h2>
              <p className="text-white/80 leading-relaxed">
                The service is provided without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the service will meet your requirements or that the operation of the service will be uninterrupted or error-free.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">8. Intellectual Property</h2>
              <p className="text-white/80 leading-relaxed">
                The Messenger Wrapped application, including its design, code, and documentation, is protected by copyright and other intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of the service without explicit permission, except as permitted by the license under which the software is distributed.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">9. Privacy</h2>
              <p className="text-white/80 leading-relaxed">
                Your use of Messenger Wrapped is also governed by our{' '}
                <Link
                  href="/privacy"
                  className="text-messenger-blue hover:text-blue-400 underline"
                >
                  Privacy Policy
                </Link>
                . Please review our Privacy Policy to understand our practices regarding data handling.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">10. Modifications to Terms</h2>
              <p className="text-white/80 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any material changes by updating the &quot;Last updated&quot; date at the top of this page. Your continued use of the service after such modifications constitutes acceptance of the updated terms.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">11. Termination</h2>
              <p className="text-white/80 leading-relaxed">
                We reserve the right to terminate or suspend access to the service immediately, without prior notice or liability, for any reason, including if you breach the Terms of Use. Upon termination, your right to use the service will cease immediately.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">12. Governing Law</h2>
              <p className="text-white/80 leading-relaxed">
                These Terms of Use shall be governed by and construed in accordance with applicable laws, without regard to its conflict of law provisions.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-4">13. Contact Information</h2>
              <p className="text-white/80 leading-relaxed">
                If you have any questions about these Terms of Use, please contact us through our{' '}
                <a
                  href="https://github.com/mapuya19/messenger-wrapped"
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

