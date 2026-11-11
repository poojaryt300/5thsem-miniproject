import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  QrCode,
  Search,
  Filter,
  Eye,
  ExternalLink,
  Briefcase,
  Building,
  DoorOpen,
  Cpu,
  Layers
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge, { PriorityBadge } from '../../components/StatusBadge';
import QRScannerModal from '../../components/QRScannerModal';
import Modal from '../../components/Modal';
import Timeline from '../../components/Timeline';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Quick View Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints/my', {
        params: {
          status: statusFilter,
          priority: priorityFilter,
          search: searchTerm
        }
      });
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
      }
    } catch (err) {
      console.error('Error fetching staff complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setStatusFilter(statusParam);
    }
    if (searchParams.get('tab') === 'my-complaints') {
      const el = document.getElementById('my-complaints');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchParams]);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, priorityFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const openQuickView = async (complaintId) => {
    try {
      const res = await api.get(`/complaints/${complaintId}`);
      if (res.data.success) {
        setSelectedComplaint(res.data.complaint);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // KPI Calculations
  const totalComplaints = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'Submitted' || c.status === 'Assigned').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} showSidebarToggle={true} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
          openQRScanner={() => setScannerOpen(true)}
        />

        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/20 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Faculty & Staff Portal
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-medium">
                    Dept: {user?.department || 'Academic Department'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {user?.name || 'Faculty Member'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Manage staff-room air conditioners, laboratory workstations, and departmental seminar equipment tickets.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Link
                  to="/report"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" /> Report Staff Room / Classroom Issue
                </Link>
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" /> Scan Room Door QR
                </button>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">Department Tickets</span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{totalComplaints}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-600">Pending Allocation</span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{pendingCount}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-purple-600">Active Repairs</span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{inProgressCount}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-600">Resolved Requests</span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{resolvedCount}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Department Complaints Table */}
          <div id="my-complaints" className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Submitted Staff & Classroom Tickets</h2>
                <p className="text-xs text-slate-500 mt-0.5">Filter by status or priority to track assigned campus technicians.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search ticket, room..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44 sm:w-56"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </form>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700"
                >
                  <option value="All">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500">
                Loading staff ticket records...
              </div>
            ) : complaints.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No active complaints submitted.</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Report issues in your faculty room, staff offices, or teaching classrooms to notify maintenance.
                </p>
                <Link
                  to="/report"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  <PlusCircle className="w-4 h-4" /> Report Problem
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Ticket ID</th>
                      <th className="py-3 px-4">Staff Room / Hall</th>
                      <th className="py-3 px-4">Equipment</th>
                      <th className="py-3 px-4">Problem</th>
                      <th className="py-3 px-4">Assigned Tech</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {complaints.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">
                          {c.complaint_code}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{c.room_number}</div>
                          <div className="text-[10px] text-slate-400">{c.building}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-700">
                            {c.equipment_name || c.equipment_type || 'General Room'}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-medium text-slate-800 truncate">{c.problem_type}</div>
                          <div className="text-[10px] text-slate-500 truncate">{c.description}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {c.technician_name ? (
                            <div>
                              <div className="font-semibold text-slate-900">{c.technician_name}</div>
                              <div className="text-[10px] text-slate-400">{c.technician_phone || 'Assigned'}</div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <PriorityBadge priority={c.priority} />
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openQuickView(c.id)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                              title="Quick Preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              to={`/complaints/${c.id}`}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Open Tracking Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
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

      {/* Quick View Modal */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title={`Complaint #${selectedComplaint?.complaint_code || ''}`}
        maxWidth="max-w-2xl"
      >
        {selectedComplaint && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedComplaint.status} />
                <PriorityBadge priority={selectedComplaint.priority} />
              </div>
              <Link
                to={`/complaints/${selectedComplaint.id}`}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                Open Full Tracking <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <Timeline
              status={selectedComplaint.status}
              history={selectedComplaint.history}
              technicianName={selectedComplaint.technician_name}
              repairNotes={selectedComplaint.repair_notes}
              resolvedAt={selectedComplaint.resolved_at}
            />

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
              <div className="font-semibold text-slate-800">
                {selectedComplaint.problem_type} • {selectedComplaint.room_number} ({selectedComplaint.building})
              </div>
              <p className="text-slate-600">{selectedComplaint.description}</p>
            </div>
          </div>
        )}
      </Modal>

      <QRScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
    </div>
  );
};

export default StaffDashboard;
