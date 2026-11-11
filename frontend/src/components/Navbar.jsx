import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Shield,
  GraduationCap,
  Briefcase,
  Hammer,
  CheckCheck,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const Navbar = ({ toggleSidebar, showSidebarToggle = false }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-rose-500" />;
      case 'technician':
        return <Hammer className="w-3.5 h-3.5 text-amber-500" />;
      case 'staff':
        return <Briefcase className="w-3.5 h-3.5 text-blue-500" />;
      case 'student':
      default:
        return <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'technician':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'staff':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'student':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            {showSidebarToggle && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
                aria-label="Toggle navigation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo.jpg"
                alt="Unifix Logo"
                className="w-10 h-10 rounded-xl object-cover shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform border border-indigo-200/50"
              />
              <div className="leading-tight">
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-navy-900 to-indigo-700 bg-clip-text text-transparent">
                  Unifix
                </span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Campus Tech Care
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Notifications & User Profile */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Role badge */}
                <span
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getRoleBadgeStyle(
                    user.role
                  )}`}
                >
                  {getRoleIcon(user.role)}
                  {user.role}
                </span>

                {/* Notifications Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-[10px] font-bold text-white items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-800">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                          >
                            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => {
                                if (!item.is_read) markAsRead(item.id);
                                if (item.complaint_id) {
                                  setShowNotifications(false);
                                  navigate(`/complaints/${item.complaint_id}`);
                                }
                              }}
                              className={`p-3.5 text-xs cursor-pointer transition-colors hover:bg-slate-50 flex items-start gap-3 ${
                                !item.is_read ? 'bg-indigo-50/40 font-medium' : 'text-slate-600'
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                  !item.is_read ? 'bg-indigo-600 ring-2 ring-indigo-200' : 'bg-transparent'
                                }`}
                              />
                              <div className="flex-1">
                                <p className="text-slate-800 leading-snug">{item.message}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200/60"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 hidden md:block max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-1.5 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <span className="mt-1 inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {user.role} • {user.department || 'General'}
                        </span>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile & Settings
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left font-semibold border-t border-slate-100 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
