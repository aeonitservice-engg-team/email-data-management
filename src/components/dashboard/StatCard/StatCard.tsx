'use client';

import React from 'react';
import { cn, formatNumber } from '@/lib/utils';
import styles from './StatCard.module.css';

/**
 * StatCard component props
 */
interface StatCardProps {
  /** Title of the stat */
  title: string;
  /** Value to display */
  value: number;
  /** Icon to display */
  icon: React.ReactNode;
  /** Change percentage */
  change?: number;
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
}

/**
 * StatCard component
 * 
 * Displays a statistic with icon, value, and optional change indicator.
 */
function StatCard({ title, value, icon, change, variant = 'primary' }: StatCardProps) {
  return (
    <div className={styles.card}>
      <div className={cn(styles.iconWrapper, styles[variant])}>
        {icon}
      </div>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.value}>{formatNumber(value)}</p>
        {change !== undefined && (
          <p className={cn(styles.change, change >= 0 ? styles.positive : styles.negative)}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
          </p>
        )}
      </div>
    </div>
  );
}

export default StatCard;
