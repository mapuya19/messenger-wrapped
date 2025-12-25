'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface ChatTimelineSlideProps {
  chatHistory: Array<{ date: string; messageCount: number; participantCount: number }>;
}

export function ChatTimelineSlide({ chatHistory }: ChatTimelineSlideProps) {
  const chartData = chatHistory.map(item => ({
    date: new Date(item.date + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    messages: item.messageCount,
  }));

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl md:text-4xl font-bold text-white mb-8 text-center"
      >
        Chat Activity Over Time
      </motion.h2>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-4xl h-64 md:h-80"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="date"
              stroke="#ffffff60"
              tick={{ fill: '#ffffff80', fontSize: 12 }}
            />
            <YAxis
              stroke="#ffffff60"
              tick={{ fill: '#ffffff80', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 22, 40, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Line
              type="monotone"
              dataKey="messages"
              stroke="#0084FF"
              strokeWidth={3}
              dot={{ fill: '#0084FF', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

