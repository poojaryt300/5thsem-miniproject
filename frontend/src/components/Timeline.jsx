import React from 'react';
import { CheckCircle2, Clock, Wrench, AlertCircle, User, Calendar, FileText } from 'lucide-react';

const STEPS = [
  { key: 'Submitted', label: 'Submitted', icon: Clock, desc: 'Problem reported' },
  { key: 'Assigned', label: 'Assigned', icon: User, desc: 'Technician allocated' },
  { key: 'In Progress', label: 'In Progress', icon: Wrench, desc: 'Repair underway' },
  { key: 'Resolved', label: 'Resolved', icon: CheckCircle2, desc: 'Fixed & verified' }
];

export const Timeline = ({ status, history = [], technicianName, repairNotes, resolvedAt }) => {
  const getStepIndex = (st) => {
    switch (st) {
      case 'Submitted':
        return 0;
      case 'Assigned':
        return 1;
      case 'In Progress':
        return 2;
      case 'Resolved':
      case 'Closed':
        return 3;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(status);

  return (
    <div className="space-y-6">
      {/* Visual Step Progress Bar */}
      <div className="relative">
        <div className="overflow-hidden h-2 mb-6 text-xs flex rounded-full bg-slate-100">
          <div
            style={{ width: `${((currentStep) / (STEPS.length - 1)) * 100}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-500"
          ></div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx <= currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md scale-105'
                      : isCompleted
                      ? 'bg-emerald-500 text-white shadow'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="mt-2 font-semibold text-xs text-slate-800">{step.label}</div>
                <div className="text-[10px] text-slate-500 hidden sm:block">{step.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technician & Repair Note Callout */}
      {(technicianName || repairNotes) && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          {technicianName && (
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span className="font-semibold text-indigo-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" /> Assigned Technician:
              </span>
              <span className="font-medium text-slate-900">{technicianName}</span>
            </div>
          )}
          {repairNotes && (
            <div className="text-sm bg-white p-3 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-indigo-600" /> Technician Repair Notes:
              </div>
              <p className="text-slate-600 whitespace-pre-wrap">{repairNotes}</p>
            </div>
          )}
          {resolvedAt && (
            <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Resolved on {new Date(resolvedAt).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Detailed Chronological Audit Trail */}
      {history && history.length > 0 && (
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Activity Timeline History
          </h4>
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {history.map((item, index) => (
              <div key={item.id || index} className="relative">
                <div className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white"></div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  <span className="font-medium text-slate-700">by {item.updated_by_name} ({item.updated_by_role})</span>
                </div>
                <div className="text-sm font-semibold text-slate-800 mt-0.5">
                  Status: <span className="text-indigo-600">{item.new_status}</span>
                </div>
                {item.note && (
                  <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                    {item.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
