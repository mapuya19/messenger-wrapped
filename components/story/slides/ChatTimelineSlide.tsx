'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, DotProps } from 'recharts';
import { parseMonthDate, formatMonthDate } from '@/lib/utils/date-utils';
import { slideAnimations, slideStyles } from './shared/slide-constants';

interface ChatTimelineSlideProps {
  chatHistory: Array<{ date: string; messageCount: number; participantCount: number }>;
}

// Custom animated dot component with smooth animation
const AnimatedDot = (props: DotProps & { index: number }) => {
  const { cx, cy, index } = props;
  
  if (cx === undefined || cy === undefined) return null;

  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={4}
      fill="#0084FF"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        delay: 0.3 + (index * 0.03),
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1] // Custom cubic bezier for smooth easing
      }}
    />
  );
};

export function ChatTimelineSlide({ chatHistory }: ChatTimelineSlideProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Parse date string "YYYY-MM" and create proper date objects
  // Ensure data is sorted correctly by date
  const chartData = chatHistory
    .map(item => {
      const dateObj = parseMonthDate(item.date);
      
      return {
        date: item.date, // Keep original format for sorting
        dateValue: dateObj.getTime(), // Numeric value for proper ordering
        dateLabel: formatMonthDate(item.date, { month: 'short', year: 'numeric' }),
        monthLabel: formatMonthDate(item.date, { month: 'short' }),
        messages: item.messageCount,
      };
    })
    .sort((a, b) => a.dateValue - b.dateValue); // Ensure proper chronological order

  // Trigger mount animation
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Custom tick formatter to show month abbreviations
  const formatXAxisTick = (tickItem: string) => {
    return formatMonthDate(tickItem, { month: 'short' });
  };

  // Determine if we should show all ticks or use auto-spacing
  // For 12 months or less, show all; otherwise let Recharts decide
  const shouldShowAllTicks = chartData.length <= 12;

  return (
    <div className={slideStyles.container}>
      <motion.h2
        {...slideAnimations.fadeInUp}
        className={slideStyles.heading}
      >
        Chat Activity Over Time
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-6xl h-48 lg:h-96 relative"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="date"
              stroke="#ffffff60"
              tick={{ fill: '#ffffff80', fontSize: 11 }}
              tickFormatter={formatXAxisTick}
              interval={shouldShowAllTicks ? 0 : 'preserveStartEnd'}
              angle={shouldShowAllTicks ? -45 : 0}
              textAnchor={shouldShowAllTicks ? "end" : "middle"}
              height={shouldShowAllTicks ? 70 : 40}
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
              labelFormatter={(label) => {
                return formatMonthDate(String(label), { month: 'long', year: 'numeric' });
              }}
            />
            <Line
              type="monotone"
              dataKey="messages"
              stroke="#0084FF"
              strokeWidth={3}
              dot={(props) => {
                const { key, index, ...restProps } = props;
                return (
                  <AnimatedDot 
                    key={key}
                    {...restProps}
                    index={index || 0}
                  />
                );
              }}
              activeDot={{ r: 6, fill: '#0084FF' }}
              isAnimationActive={isMounted}
              animationDuration={2000}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}




