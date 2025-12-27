'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ChatHistoryChartProps {
  chatHistory: Array<{ date: string; messageCount: number; participantCount: number }>;
}

export function ChatHistoryChart({ chatHistory }: ChatHistoryChartProps) {
  const chartData = chatHistory.map(item => ({
    date: new Date(item.date + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    messages: item.messageCount,
    participants: item.participantCount,
  }));

  return (
    <Card className="w-full">
      <h3 className="text-2xl font-bold text-white mb-6">Chat Activity Over Time</h3>
      <div className="w-full h-64 md:h-80">
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
            <Legend
              wrapperStyle={{ color: '#ffffff80' }}
            />
            <Line
              type="monotone"
              dataKey="messages"
              stroke="#0084FF"
              strokeWidth={2}
              dot={{ fill: '#0084FF', r: 3 }}
              name="Messages"
            />
            <Line
              type="monotone"
              dataKey="participants"
              stroke="#9B59B6"
              strokeWidth={2}
              dot={{ fill: '#9B59B6', r: 3 }}
              name="Active Participants"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}


