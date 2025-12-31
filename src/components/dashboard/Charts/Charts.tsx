'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui';
import styles from './Charts.module.css';

/**
 * Chart colors
 */
const COLORS = {
  primary: '#3b82f6',
  secondary: '#6366f1',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning];

/**
 * Bar Chart component props
 */
interface EmailsBarChartProps {
  data: Array<{ name: string; emails: number }>;
  title: string;
}

/**
 * Emails Bar Chart component
 */
export function EmailsBarChart({ data, title }: EmailsBarChartProps) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Bar dataKey="emails" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Pie Chart component props
 */
interface BrandPieChartProps {
  data: Array<{ name: string; value: number }>;
  title: string;
}

/**
 * Brand Pie Chart component
 */
export function BrandPieChart({ data, title }: BrandPieChartProps) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Line Chart component props
 */
interface TrendLineChartProps {
  data: Array<{ name: string; emails: number }>;
  title: string;
}

/**
 * Trend Line Chart component
 */
export function TrendLineChart({ data, title }: TrendLineChartProps) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="emails"
                stroke={COLORS.primary}
                strokeWidth={2}
                dot={{ fill: COLORS.primary, strokeWidth: 2 }}
                activeDot={{ r: 6, fill: COLORS.primary }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
