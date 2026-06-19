import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const TrustScoreGauge = ({ score, title = "Trust Score", className = '' }) => {
  // Score out of 100
  const normalizedScore = Math.min(100, Math.max(0, score));
  const data = [
    { name: 'Score', value: normalizedScore },
    { name: 'Remaining', value: 100 - normalizedScore }
  ];

  let color = '#ef4444'; // Red for low score (<50)
  if (normalizedScore >= 80) color = '#10b981'; // Green for high score (>=80)
  else if (normalizedScore >= 50) color = '#f59e0b'; // Amber for medium score (50-79)

  return (
    <div className={`glass-panel p-6 rounded-2xl flex flex-col items-center justify-center ${className}`}>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</h3>
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={45}
              outerRadius={60}
              dataKey="value"
              stroke="none"
              isAnimationActive={true}
            >
              <Cell fill={color} />
              <Cell fill="#e2e8f0" className="dark:fill-slate-700" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center mb-6">
          <span className="text-3xl font-bold text-gray-900 dark:text-white mt-8">{normalizedScore}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">/ 100</span>
        </div>
      </div>
    </div>
  );
};

export default TrustScoreGauge;
