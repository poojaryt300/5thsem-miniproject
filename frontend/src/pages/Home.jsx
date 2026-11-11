import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Shield,
  GraduationCap,
  Briefcase,
  Hammer,
  QrCode,
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone,
  Cpu,
  Zap,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (email, password, role) => {
    try {
      await login(email, password);
      navigate(`/dashboard/${role}`);
    } catch (err) {
      console.error('Quick login failed:', err);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-navy-900 via-indigo-700 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-navy-900 to-indigo-700 bg-clip-text text-transparent">
                Campus TechCare
              </span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Smart Campus Maintenance
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={`/dashboard/${user.role}`}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:text-indigo-600 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white via-indigo-50/30 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> Smart Campus Infrastructure 2026
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Instant Campus <br />
              <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Maintenance & Tech Care
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              A comprehensive system for students, faculty, administrators, and technicians. Report faulty fans, lights, PCs, projectors, ACs, and Wi-Fi access points with classroom QR codes and live repair tracking.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                to={user ? `/dashboard/${user.role}` : '/login'}
                className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 flex items-center gap-2"
              >
                <Activity className="w-4 h-4" /> Open Maintenance Portal
              </Link>
              <Link
                to="/report"
                className="px-6 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-800 hover:border-indigo-500 font-bold text-sm shadow-sm transition-all hover:scale-105 flex items-center gap-2"
              >
                <QrCode className="w-4 h-4 text-indigo-600" /> Report an Issue Now
              </Link>
            </div>
          </div>

          {/* Quick Demo Login Cards - One-Click Role Previews */}
          <div className="mt-16 pt-8 border-t border-slate-200/80">
            <div className="text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Quick Presentation Login • Select Any Role
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Admin Card */}
              <button
                onClick={() => handleQuickDemo('admin@campus.edu', 'Admin@123', 'admin')}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-rose-400 hover:shadow-xl transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-rose-600 text-sm">Admin Dashboard</h3>
                <p className="text-xs text-slate-500 mt-1 mb-3">Assign techs, manage rooms, inspect analytics & complaints.</p>
                <span className="inline-flex items-center text-xs font-bold text-rose-600 gap-1 group-hover:translate-x-1 transition-transform">
                  Login as Admin <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>

              {/* Student Card */}
              <button
                onClick={() => handleQuickDemo('student@campus.edu', 'Student@123', 'student')}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-xl transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 text-sm">Student Dashboard</h3>
                <p className="text-xs text-slate-500 mt-1 mb-3">Scan classroom QR, report issues, track live status.</p>
                <span className="inline-flex items-center text-xs font-bold text-emerald-600 gap-1 group-hover:translate-x-1 transition-transform">
                  Login as Student <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>

              {/* Staff Card */}
              <button
                onClick={() => handleQuickDemo('staff@campus.edu', 'Staff@123', 'staff')}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-xl transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 text-sm">Staff Dashboard</h3>
                <p className="text-xs text-slate-500 mt-1 mb-3">Report staff room equipment faults & track repair progress.</p>
                <span className="inline-flex items-center text-xs font-bold text-blue-600 gap-1 group-hover:translate-x-1 transition-transform">
                  Login as Staff <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>

              {/* Technician Card */}
              <button
                onClick={() => handleQuickDemo('tech.electric@campus.edu', 'Tech@123', 'technician')}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-xl transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Hammer className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-amber-600 text-sm">Technician Portal</h3>
                <p className="text-xs text-slate-500 mt-1 mb-3">Start work, write repair notes, resolve maintenance orders.</p>
                <span className="inline-flex items-center text-xs font-bold text-amber-600 gap-1 group-hover:translate-x-1 transition-transform">
                  Login as Tech <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Engineered for Modern Educational Institutions
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              End-to-end transparency connecting report dispatch with field resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Classroom QR Scanning</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Scan room door QR codes to immediately prefill building and room numbers without having to manually search through lists.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Visual 4-Stage Timeline</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Watch status progression in real-time: Submitted → Assigned → In Progress → Resolved, with full technician repair logs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Equipment Inventory Health</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Monitor recurring failures across ACs, PCs, projectors, and fans with automated status updates when repairs are verified.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-900 text-slate-400 border-t border-slate-800 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Campus TechCare • Smart Campus Maintenance Management System</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Built with React.js, Tailwind CSS, Node.js, Express & MySQL.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
