import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Hammer,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Search,
  Building,
  DoorOpen,
  Calendar,
  User,
  Play,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Check
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge, { PriorityBadge } from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Timeline from '../../components/Timeline';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Action Modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalType, setModalType] = useState('view'); // 'view' or 'action'
  const [updateStatus, setUpdateStatus] = useState('In Progress');
  const [repairNotes, setRepairNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/technicians/my-tasks', {
        params: {
          status: statusFilter,
          priority: priorityFilter,
          search: searchTerm
        }
      });
      if (res.data.success) {
        setTasks(res.data.tasks || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching technician tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filter = searchParams.get('filter');
    const status = searchParams.get('status');
    if (status) {
      setStatusFilter(status);
    } else if (filter === 'in-progress') {
      setStatusFilter('In Progress');
    } else if (filter === 'resolved') {
      setStatusFilter('Resolved');
    } else if (filter === 'assigned' || filter === 'pending') {
      setStatusFilter('Assigned');
    } else if (!filter && !status) {
      setStatusFilter('All');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter]);

  const handleStartWork = async (taskId) => {
    try {
      await api.put(`/complaints/${taskId}/status`, {
        status: 'In Progress',
        note: `Technician ${user.name} commenced maintenance work.`
      });
      fetchTasks();
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(prev => ({ ...prev, status: 'In Progress' }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start work');
    }
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    setActionLoading(true);
    try {
      await api.put(`/complaints/${selectedTask.id}/status`, {
        status: updateStatus,
        repair_notes: repairNotes
      });

      if (updateStatus === 'Resolved') {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      }

      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} showSidebarToggle={true} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Technician Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-400/20 uppercase tracking-wider flex items-center gap-1.5">
                    <Hammer className="w-3.5 h-3.5" /> Maintenance Technician Portal
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-medium">
                    Specialization: {user?.technician?.specialization || 'Electrical & General Repairs'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Technician {user?.name || 'Engineer'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Accept maintenance dispatches, inspect fault photos, record parts replaced, and certify repairs.
                </p>
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold text-slate-200">
                  Duty Status: <span className="text-emerald-400 uppercase font-bold">On Duty / Active</span>
                </span>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">Total Assigned</span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-600">Pending Start</span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.pending}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-purple-600">In Progress</span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.inProgress}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-600">Completed</span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.resolved}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Assigned Complaints Task List */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Assigned Campus Work Orders</h2>
                <p className="text-xs text-slate-500 mt-0.5">Click 'Start Work' or 'Resolve' to log maintenance progress in real time.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search room, ticket..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44 sm:w-56"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="Assigned">Assigned (Not Started)</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700"
                >
                  <option value="All">All Priorities</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500">
                Loading assigned maintenance orders...
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-800">All caught up! No pending dispatches.</p>
                <p className="text-xs text-slate-400">
                  New campus complaints assigned by administrators will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Work Order</th>
                      <th className="py-3 px-4">Room Location</th>
                      <th className="py-3 px-4">Equipment</th>
                      <th className="py-3 px-4">Problem Summary</th>
                      <th className="py-3 px-4">Reported By</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tasks.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-amber-600">
                          {t.complaint_code}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{t.room_number}</div>
                          <div className="text-[10px] text-slate-400">{t.building}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-700">
                            {t.equipment_name || t.equipment_type || 'General Room'}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-medium text-slate-800 truncate">{t.problem_type}</div>
                          <div className="text-[10px] text-slate-500 truncate">{t.description}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{t.reporter_name}</div>
                          <div className="text-[10px] text-slate-400">{t.reporter_phone || t.reporter_email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <PriorityBadge priority={t.priority} />
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {t.status === 'Assigned' && (
                              <button
                                type="button"
                                onClick={() => handleStartWork(t.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                              >
                                <Play className="w-3 h-3" /> Start Work
                              </button>
                            )}

                            {t.status === 'In Progress' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTask(t);
                                  setUpdateStatus('Resolved');
                                  setRepairNotes(t.repair_notes || '');
                                  setModalType('action');
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                              >
                                <Check className="w-3 h-3" /> Mark Resolved
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTask(t);
                                setUpdateStatus(t.status);
                                setRepairNotes(t.repair_notes || '');
                                setModalType('view');
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Task Execution / Detail Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title={`Work Order #${selectedTask?.complaint_code || ''}`}
        maxWidth="max-w-2xl"
      >
        {selectedTask && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedTask.status} />
                <PriorityBadge priority={selectedTask.priority} />
              </div>
              <Link
                to={`/complaints/${selectedTask.id}`}
                className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
              >
                Open Full Timeline View <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Room & Problem Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 block mb-0.5">Location</span>
                <span className="font-bold text-slate-800 text-sm">
                  {selectedTask.room_number} • {selectedTask.building}
                </span>
                <span className="text-slate-500 block mt-0.5">
                  Asset: {selectedTask.equipment_name || selectedTask.equipment_type || 'General Room Fixture'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Reporter Contact</span>
                <span className="font-bold text-slate-800">{selectedTask.reporter_name}</span>
                <span className="text-slate-500 block mt-0.5">
                  Phone: {selectedTask.reporter_phone || 'N/A'} • {selectedTask.reporter_email}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-1">Issue Description</h4>
              <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                {selectedTask.description}
              </p>
            </div>

            {selectedTask.photo_url && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-600" /> Uploaded Problem Image
                </h4>
                <div className="rounded-xl overflow-hidden border border-slate-200 max-h-56">
                  <img src={selectedTask.photo_url} alt="Problem Photo" className="w-full h-auto object-cover" />
                </div>
              </div>
            )}

            {/* Action Form */}
            <form onSubmit={handleSaveStatus} className="pt-2 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Update Status & Record Repair Action
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Assigned">Assigned (Pending)</option>
                    <option value="In Progress">In Progress (Active Work)</option>
                    <option value="Resolved">Resolved (Completed & Tested)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Repair Notes & Parts Log *
                </label>
                <textarea
                  rows={3}
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  placeholder="e.g. Replaced 3.15uF ceiling fan capacitor. Verified smooth rotation and noise elimination..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 resize-none"
                  required
                ></textarea>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {actionLoading ? 'Saving...' : 'Save & Update Complaint'}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TechnicianDashboard;
