import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, trendLabel, className = '' }) => {
  const isPositive = trend > 0;
  const isNegative = trend < 0;

  return (
    <div className={`glass-panel p-6 rounded-2xl ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
        </div>
        {Icon && (
          <div className="p-3 bg-brand-50 dark:bg-brand-500/10 rounded-xl">
            <Icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          </div>
        )}
      </div>
      {(trend !== undefined || trendLabel) && (
        <div className="mt-4 flex items-center text-sm">
          {trend !== undefined && (
            <span className={`flex items-center font-medium ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : isNegative ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`}>
              {isPositive ? '↑' : isNegative ? '↓' : ''} {Math.abs(trend)}%
            </span>
          )}
          {trendLabel && (
            <span className="text-gray-500 dark:text-gray-400 ml-2">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
