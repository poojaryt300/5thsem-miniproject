import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  QrCode,
  Users,
  Wrench,
  DoorOpen,
  Cpu,
  BarChart3,
  UserCheck,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, closeSidebar, openQRScanner }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const getLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { to: '/dashboard/admin', label: 'Overview & Stats', icon: LayoutDashboard },
          { to: '/dashboard/admin?tab=complaints', label: 'All Complaints', icon: ClipboardList },
          { to: '/dashboard/admin?tab=technicians', label: 'Technicians', icon: UserCheck },
          { to: '/dashboard/admin?tab=rooms', label: 'Rooms & QR Codes', icon: DoorOpen },
          { to: '/dashboard/admin?tab=equipment', label: 'Equipment Inventory', icon: Cpu },
          { to: '/dashboard/admin?tab=users', label: 'User Directory', icon: Users },
          { to: '/dashboard/admin?tab=analytics', label: 'Analytics & Reports', icon: BarChart3 }
        ];
      case 'technician':
        return [
          { to: '/dashboard/technician', label: 'Assigned Work Orders', icon: Wrench },
          { to: '/dashboard/technician?filter=in-progress', label: 'In Progress Tasks', icon: ClipboardList },
          { to: '/dashboard/technician?filter=resolved', label: 'Completed Repairs', icon: CheckCircle }
        ];
      case 'staff':
        return [
          { to: '/dashboard/staff', label: 'Staff Dashboard', icon: LayoutDashboard },
          { to: '/report', label: 'Report a Problem', icon: PlusCircle, highlight: true },
          { to: '/dashboard/staff?tab=my-complaints', label: 'My Department Tickets', icon: ClipboardList }
        ];
      case 'student':
      default:
        return [
          { to: '/dashboard/student', label: 'Student Dashboard', icon: LayoutDashboard },
          { to: '/report', label: 'Report a Problem', icon: PlusCircle, highlight: true },
          { to: '/dashboard/student?tab=my-complaints', label: 'My Complaints', icon: ClipboardList }
        ];
    }
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full py-5 px-4 justify-between">
          <div className="space-y-6">
            {/* Quick Action Button for student/staff */}
            {(role === 'student' || role === 'staff') && (
              <div className="space-y-2">
                <NavLink
                  to="/report"
                  onClick={closeSidebar}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
                >
                  <PlusCircle className="w-5 h-5" />
                  Report a Problem
                </NavLink>

                {openQRScanner && (
                  <button
                    onClick={() => {
                      closeSidebar();
                      openQRScanner();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
                  >
                    <QrCode className="w-4 h-4 text-indigo-400" />
                    Scan Room QR Code
                  </button>
                )}
              </div>
            )}

            {/* Navigation links */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                {role === 'admin' ? 'Administration' : 'Menu Navigation'}
              </div>
              <nav className="space-y-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Bottom user status widget */}
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs">
            <div className="font-semibold text-slate-200 truncate">{user.name}</div>
            <div className="text-slate-400 text-[11px] truncate">{user.department || 'Campus Member'}</div>
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Connected
              </span>
              <span className="font-mono text-slate-400">v1.0.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
