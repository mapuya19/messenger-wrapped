'use client';

import React from 'react';
import { Card } from '../ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
}

export function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <Card>
      <div className="space-y-2">
        {icon && <div className="text-3xl mb-2">{icon}</div>}
        <div className="text-sm md:text-base text-white/60">{title}</div>
        <div className="text-2xl md:text-3xl font-bold bg-gradient-messenger bg-clip-text text-transparent">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {subtitle && (
          <div className="text-xs md:text-sm text-white/50">{subtitle}</div>
        )}
      </div>
    </Card>
  );
}


