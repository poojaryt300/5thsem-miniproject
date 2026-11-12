import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wrench, Mail, Lock, LogIn, AlertCircle, Shield, GraduationCap, Briefcase, Hammer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const isExpired = searchParams.get('expired');
  const redirectUrl = searchParams.get('redirect');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate(`/dashboard/${user.role}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <img
            src="/logo.jpg"
            alt="Unifix Logo"
            className="w-16 h-16 rounded-2xl object-cover shadow-lg shadow-indigo-500/25 border-2 border-indigo-200/50 group-hover:scale-105 transition-transform"
          />
        </Link>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Sign In to Unifix
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Campus Tech Care • Instant Maintenance Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          {isExpired && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Session expired. Please log in again.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Institutional Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@campus.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In to Account
                </>
              )}
            </button>
          </form>

          {/* Quick autofill presets */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5">
              Instant Demo Autofill
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin@campus.edu', 'Admin@123')}
                className="p-2 rounded-xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50/40 text-left text-xs transition-colors flex items-center gap-2"
              >
                <Shield className="w-3.5 h-3.5 text-rose-500" />
                <span className="font-semibold text-slate-700">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('student@campus.edu', 'Student@123')}
                className="p-2 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left text-xs transition-colors flex items-center gap-2"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold text-slate-700">Student</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('staff@campus.edu', 'Staff@123')}
                className="p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left text-xs transition-colors flex items-center gap-2"
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-semibold text-slate-700">Staff</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('tech.electric@campus.edu', 'Tech@123')}
                className="p-2 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-left text-xs transition-colors flex items-center gap-2"
              >
                <Hammer className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold text-slate-700">Technician</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
