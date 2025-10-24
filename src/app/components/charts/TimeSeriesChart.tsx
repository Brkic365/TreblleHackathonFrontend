"use client";

import React from 'react';
import {
  LineChart,
  Line,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface TimeSeriesChartProps {
  data: Array<{ time: string; value: number }>;
  dataKey: string;
  gradientId: string;
  gradientColors: [string, string];
  yAxisFormatter?: (value: number) => string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: 'rgba(20, 20, 30, 0.8)', 
        padding: '5px 10px', 
        border: '1px solid #37354b', 
        borderRadius: '5px' 
      }}>
        <p style={{ color: '#fff' }}>{`${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export function TimeSeriesChart({
  data,
  dataKey,
  gradientId,
  gradientColors,
  yAxisFormatter = (value) => String(value),
}: TimeSeriesChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="5%" stopColor={gradientColors[0]} stopOpacity={1} />
            <stop offset="95%" stopColor={gradientColors[1]} stopOpacity={1} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#37354b"
          horizontal={true}
          vertical={false}
        />
        
        <YAxis
          axisLine={false}
          tickLine={false}
          stroke="#8884d8"
          tickFormatter={yAxisFormatter}
          domain={['dataMin', 'dataMax']}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8884d8', strokeWidth: 1, strokeDasharray: '3 3' }} />

        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={`url(#${gradientId})`}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: gradientColors[1] }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
