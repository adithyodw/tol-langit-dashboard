'use client';

import React from 'react';

interface TagProps {
  children: React.ReactNode;
  variant?: 'low' | 'high' | 'medium' | 'new';
  className?: string;
}

export function Tag({ children, variant = 'low', className = '' }: TagProps) {
  const classes: Record<string, string> = {
    low: 'rp-low',
    high: 'rp-hi',
    medium: 'rp-med',
    new: 'rp-new',
  };

  return (
    <span className={`${classes[variant]} ${className}`} style={{ display: 'inline-block' }}>
      {children}
    </span>
  );
}
