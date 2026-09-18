import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  description,
  action,
}) => {
  return (
    <div
      className={`bg-slate-900/70 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-6 shadow-xl transition-all ${className}`}
    >
      {(title || action) && (
        <div className="flex items-start justify-between pb-4 mb-4 border-b border-slate-800/60">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-100">{title}</h3>}
            {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
