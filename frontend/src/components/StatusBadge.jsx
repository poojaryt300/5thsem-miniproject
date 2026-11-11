import React from 'react';

export const StatusBadge = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'Submitted':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10';
      case 'Assigned':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10';
      case 'In Progress':
        return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/10';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10';
      case 'Closed':
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 ring-gray-500/10';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ring-1 ${getStyles()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
      {status || 'Unknown'}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const getStyles = () => {
    switch (priority) {
      case 'Low':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'Medium':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'High':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-medium';
      case 'Urgent':
        return 'bg-rose-50 text-rose-700 border-rose-300 font-bold animate-pulse';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs rounded-md border font-medium ${getStyles()}`}
    >
      {priority || 'Medium'}
    </span>
  );
};

export default StatusBadge;
