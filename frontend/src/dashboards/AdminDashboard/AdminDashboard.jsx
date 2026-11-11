import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Users,
  DoorOpen,
  Cpu,
  BarChart3,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Printer,
  QrCode,
  Eye,
  Hammer,
  UserCheck,
  Check,
  ChevronRight,
  TrendingUp,
  ExternalLink,
  ShieldAlert,
  Calendar,
  Building
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge, { PriorityBadge } from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import QRCodeModal from '../../components/QRCodeModal';
import Timeline from '../../components/Timeline';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    highPriority: 0,
    urgent: 0,
    totalTechnicians: 0,
    availableTechnicians: 0,
    totalRooms: 0,
    totalEquipment: 0,
    avgResolutionHours: 0,
    overdueComplaints: 0
  });

  // Complaints State & Filters
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [buildingFilter, setBuildingFilter] = useState('All');
  const [equipmentTypeFilter, setEquipmentTypeFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Auxiliary Lists
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Analytics Chart State
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [equipmentStats, setEquipmentStats] = useState([]);
  const [buildingStats, setBuildingStats] = useState([]);

  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [qrModalRoom, setQrModalRoom] = useState(null);

  // Form Modals (Tech, Room, Equipment)
  const [techModalOpen, setTechModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState(null);
  const [techFormData, setTechFormData] = useState({ name: '', email: '', phone: '', specialization: 'Electrical', status: 'available' });

  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({ building: '', room_number: '', room_type: 'classroom' });

  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [equipmentFormData, setEquipmentFormData] = useState({ room_id: '', equipment_type: 'Fan', equipment_name: '', status: 'operational' });

  // Quick Action in Complaint Modals
  const [assignTechId, setAssignTechId] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [updateStatusVal, setUpdateStatusVal] = useState('In Progress');
  const [repairNotesVal, setRepairNotesVal] = useState('');

  // 1. Fetch Dynamic Stats
  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats', {
        params: { startDate: startDate || undefined, endDate: endDate || undefined }
      });
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  // 2. Fetch Complaints
  const fetchComplaints = async () => {
    try {
      setComplaintsLoading(true);
      const res = await api.get('/complaints', {
        params: {
          status: statusFilter,
          priority: priorityFilter,
          building: buildingFilter,
          equipment_type: equipmentTypeFilter,
          search: searchTerm,
          startDate: startDate || undefined,
          endDate: endDate || undefined
        }
      });
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setComplaintsLoading(false);
    }
  };

  // 3. Fetch Technicians
  const fetchTechnicians = async () => {
    try {
      const res = await api.get('/technicians');
      if (res.data.success) setTechnicians(res.data.technicians || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Fetch Rooms & Buildings
  const fetchRooms = async () => {
    try {
      const [roomsRes, bldgsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/rooms/buildings')
      ]);
      if (roomsRes.data.success) setRooms(roomsRes.data.rooms || []);
      if (bldgsRes.data.success) setBuildings(bldgsRes.data.buildings || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Fetch Equipment
  const fetchEquipment = async () => {
    try {
      const res = await api.get('/equipment');
      if (res.data.success) setEquipmentList(res.data.equipment || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) setUsersList(res.data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Fetch Analytics Data
  const fetchAnalytics = async () => {
    try {
      const [monthlyRes, equipRes, roomRes] = await Promise.all([
        api.get('/dashboard/monthly'),
        api.get('/dashboard/equipment', { params: { startDate: startDate || undefined, endDate: endDate || undefined } }),
        api.get('/dashboard/rooms', { params: { startDate: startDate || undefined, endDate: endDate || undefined } })
      ]);

      if (monthlyRes.data.success) setMonthlyStats(monthlyRes.data.monthly || []);
      if (equipRes.data.success) setEquipmentStats(equipRes.data.equipmentStats || []);
      if (roomRes.data.success) setBuildingStats(roomRes.data.buildingStats || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchComplaints();
    fetchTechnicians();
    fetchRooms();
    fetchEquipment();
    fetchUsers();
    fetchAnalytics();
  }, [startDate, endDate]);

  useEffect(() => {
    if (activeTab === 'complaints') {
      fetchComplaints();
    }
  }, [statusFilter, priorityFilter, buildingFilter, equipmentTypeFilter, activeTab]);

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // Assign Technician Action
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !assignTechId) return;
    try {
      await api.put(`/complaints/${selectedComplaint.id}/assign`, {
        technician_id: assignTechId,
        note: assignNote
      });
      setAssignModalOpen(false);
      setAssignNote('');
      fetchComplaints();
      fetchStats();
      fetchTechnicians();
    } catch (err) {
      alert(err.response?.data?.message || 'Assignment failed');
    }
  };

  // Status Update Action
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await api.put(`/complaints/${selectedComplaint.id}/status`, {
        status: updateStatusVal,
        repair_notes: repairNotesVal
      });
      setStatusModalOpen(false);
      fetchComplaints();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  // Technician Save (Add/Edit)
  const handleTechSave = async (e) => {
    e.preventDefault();
    try {
      if (editingTech) {
        await api.put(`/technicians/${editingTech.id}`, techFormData);
      } else {
        await api.post('/technicians', techFormData);
      }
      setTechModalOpen(false);
      setEditingTech(null);
      fetchTechnicians();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Technician action failed');
    }
  };

  // Delete Technician
  const handleTechDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this technician?')) return;
    try {
      await api.delete(`/technicians/${id}`);
      fetchTechnicians();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete technician failed');
    }
  };

  // Room Save (Add/Edit)
  const handleRoomSave = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom.id}`, roomFormData);
      } else {
        await api.post('/rooms', roomFormData);
      }
      setRoomModalOpen(false);
      setEditingRoom(null);
      fetchRooms();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Room action failed');
    }
  };

  // Delete Room
  const handleRoomDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room? Associated equipment and complaints will be affected.')) return;
    try {
      await api.delete(`/rooms/${id}`);
      fetchRooms();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete room failed');
    }
  };

  // Equipment Save (Add/Edit)
  const handleEquipmentSave = async (e) => {
    e.preventDefault();
    try {
      if (editingEquipment) {
        await api.put(`/equipment/${editingEquipment.id}`, equipmentFormData);
      } else {
        await api.post('/equipment', equipmentFormData);
      }
      setEquipmentModalOpen(false);
      setEditingEquipment(null);
      fetchEquipment();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Equipment action failed');
    }
  };

  // Delete Equipment
  const handleEquipmentDelete = async (id) => {
    if (!window.confirm('Delete this equipment asset from inventory?')) return;
    try {
      await api.delete(`/equipment/${id}`);
      fetchEquipment();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete equipment failed');
    }
  };

  // Delete User
  const handleUserDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Status Distribution Data for Pie Chart
  const statusPieData = [
    { name: 'Pending Review', value: stats.pending, color: '#f59e0b' },
    { name: 'Assigned', value: stats.assigned, color: '#3b82f6' },
    { name: 'In Progress', value: stats.inProgress, color: '#8b5cf6' },
    { name: 'Resolved', value: stats.resolved, color: '#10b981' }
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} showSidebarToggle={true} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Admin Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Institutional Maintenance Operations
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Admin Control Center
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic campus maintenance management powered by live MySQL records.
              </p>
            </div>

            {/* Date Range Filter for Executive Reporting */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm text-xs">
              <Calendar className="w-4 h-4 text-slate-400 ml-1" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-0 bg-transparent text-slate-700 text-xs focus:ring-0 p-1"
                placeholder="From"
              />
              <span className="text-slate-300">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-0 bg-transparent text-slate-700 text-xs focus:ring-0 p-1"
                placeholder="To"
              />
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex border-b border-slate-200 overflow-x-auto space-x-1 sm:space-x-4 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Executive Overview', icon: TrendingUp },
              { id: 'complaints', label: `All Complaints (${stats.total})`, icon: Wrench },
              { id: 'technicians', label: `Technicians (${stats.totalTechnicians})`, icon: UserCheck },
              { id: 'rooms', label: `Rooms & QR (${stats.totalRooms})`, icon: DoorOpen },
              { id: 'equipment', label: `Equipment (${stats.totalEquipment})`, icon: Cpu },
              { id: 'users', label: 'User Directory', icon: Users },
              { id: 'analytics', label: 'Analytics & Recharts', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-3 px-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Overdue Alert Notification */}
          {stats.overdueComplaints > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between text-xs text-amber-800 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span>
                  <strong className="font-bold">{stats.overdueComplaints} Ticket(s)</strong> are currently overdue (&gt; 48 hours without technician assignment or resolution).
                </span>
              </div>
              <button
                onClick={() => {
                  setStatusFilter('Submitted');
                  handleTabChange('complaints');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
              >
                Inspect Overdue
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {/* ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Dynamic KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Tickets</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
                  <span className="text-[10px] text-slate-400">All recorded</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                  <span className="text-[11px] font-semibold text-amber-600 uppercase">Pending Review</span>
                  <div className="text-2xl font-black text-amber-600 mt-1">{stats.pending}</div>
                  <span className="text-[10px] text-amber-500">Awaiting allocation</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                  <span className="text-[11px] font-semibold text-blue-600 uppercase">Assigned</span>
                  <div className="text-2xl font-black text-blue-600 mt-1">{stats.assigned}</div>
                  <span className="text-[10px] text-blue-500">Technician notified</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                  <span className="text-[11px] font-semibold text-purple-600 uppercase">In Progress</span>
                  <div className="text-2xl font-black text-purple-600 mt-1">{stats.inProgress}</div>
                  <span className="text-[10px] text-purple-500">Under repair</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                  <span className="text-[11px] font-semibold text-emerald-600 uppercase">Resolved</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{stats.resolved}</div>
                  <span className="text-[10px] text-emerald-500">Verified working</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                  <span className="text-[11px] font-semibold text-rose-600 uppercase">High / Urgent</span>
                  <div className="text-2xl font-black text-rose-600 mt-1">{stats.highPriority}</div>
                  <span className="text-[10px] text-rose-500">{stats.urgent} Urgent</span>
                </div>
              </div>

              {/* Secondary Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">Technician Staff Workload</span>
                    <div className="text-xl font-black text-slate-900 mt-0.5">
                      {stats.totalTechnicians} Technicians
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold">
                      {stats.availableTechnicians} Available for dispatch
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <UserCheck className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">Equipment Operational Health</span>
                    <div className="text-xl font-black text-slate-900 mt-0.5">
                      {stats.operationalEquipment} / {stats.totalEquipment} Assets
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      Across {stats.totalRooms} Registered Rooms
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Cpu className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">Average Turnaround Time</span>
                    <div className="text-xl font-black text-slate-900 mt-0.5">
                      {stats.avgResolutionHours} Hours
                    </div>
                    <span className="text-xs text-indigo-600 font-semibold">
                      From Submission to Fix
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2 Cols: Monthly Trend Area Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Monthly Ticket Resolution Trajectory</h3>
                      <p className="text-xs text-slate-400">Total reported vs successfully resolved cases</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                      Live MySQL
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyStats}>
                        <defs>
                          <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Area type="monotone" dataKey="total" name="Total Tickets" stroke="#6366f1" fillOpacity={1} fill="url(#totalGrad)" />
                        <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" fillOpacity={1} fill="url(#resGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 1 Col: Status Breakdown Pie Chart */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Current Status Ratio</h3>
                    <p className="text-xs text-slate-400">Distribution of active pipeline</p>
                  </div>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusPieData}
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {statusPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {statusPieData.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                        <span className="text-slate-600 truncate">{d.name}: {d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: ALL COMPLAINTS TABLE */}
          {/* ======================================================== */}
          {activeTab === 'complaints' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
              <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Master Complaint Directory</h2>
                    <p className="text-xs text-slate-500">Filter, inspect, assign technicians, and adjust status values.</p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl self-start">
                    Showing {complaints.length} Records
                  </span>
                </div>

                {/* Filter Controls Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
                  <div className="relative col-span-2 sm:col-span-1">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchComplaints()}
                      placeholder="Search ticket, name..."
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
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
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="All">All Priorities</option>
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>

                  <select
                    value={buildingFilter}
                    onChange={(e) => setBuildingFilter(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="All">All Buildings</option>
                    {buildings.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>

                  <select
                    value={equipmentTypeFilter}
                    onChange={(e) => setEquipmentTypeFilter(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="All">All Equipment</option>
                    {['Fan', 'Light', 'PC', 'Projector', 'AC', 'Wi-Fi', 'Switch', 'Other'].map(eq => (
                      <option key={eq} value={eq}>{eq}</option>
                    ))}
                  </select>

                  <button
                    onClick={fetchComplaints}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Ticket</th>
                      <th className="py-3 px-4">Reported By</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Building & Room</th>
                      <th className="py-3 px-4">Equipment</th>
                      <th className="py-3 px-4">Problem</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Assigned Tech</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {complaintsLoading ? (
                      <tr>
                        <td colSpan="10" className="py-12 text-center text-slate-500">
                          Loading complaints database...
                        </td>
                      </tr>
                    ) : complaints.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="py-12 text-center text-slate-500">
                          No complaints match the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      complaints.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                            {c.complaint_code}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{c.reporter_name}</div>
                            <div className="text-[10px] text-slate-400">{c.reporter_email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {c.reporter_role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{c.room_number}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{c.building}</div>
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
                          <td className="py-3 px-4">
                            <PriorityBadge priority={c.priority} />
                          </td>
                          <td className="py-3 px-4">
                            {c.technician_name ? (
                              <div className="font-medium text-indigo-700">
                                {c.technician_name}
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedComplaint(c);
                                  setAssignTechId('');
                                  setAssignModalOpen(true);
                                }}
                                className="text-[10px] text-amber-600 font-bold bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200"
                              >
                                + Assign Tech
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedComplaint(c);
                                  setAssignTechId(c.technician_id || '');
                                  setAssignModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                                title="Assign Technician"
                              >
                                <Hammer className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedComplaint(c);
                                  setUpdateStatusVal(c.status);
                                  setRepairNotesVal(c.repair_notes || '');
                                  setStatusModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-purple-600 hover:bg-slate-50 transition-colors"
                                title="Change Status"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>

                              <Link
                                to={`/complaints/${c.id}`}
                                className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                title="View Full Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: TECHNICIAN MANAGEMENT */}
          {/* ======================================================== */}
          {activeTab === 'technicians' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Campus Technician Team</h2>
                  <p className="text-xs text-slate-500">Manage technical personnel, assign domains, and balance workload.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingTech(null);
                    setTechFormData({ name: '', email: '', phone: '', specialization: 'Electrical', status: 'available' });
                    setTechModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 self-start shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Technician
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {technicians.map((t) => (
                  <div key={t.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{t.name}</h3>
                          <span className="text-xs text-indigo-600 font-semibold">{t.specialization}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          t.status === 'available'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>Email: <span className="font-medium text-slate-800">{t.email}</span></div>
                      <div>Phone: <span className="font-medium text-slate-800">{t.phone || 'N/A'}</span></div>
                    </div>

                    {/* Workload Indicator */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Active Tasks:</span>
                        <span className="text-indigo-600">{t.active_tasks_count || 0} active</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((t.active_tasks_count || 0) / 5) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Total Solved: {t.completed_tasks_count || 0}</span>
                        <span>Capacity: 5 tasks</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setEditingTech(t);
                          setTechFormData({
                            name: t.name,
                            email: t.email,
                            phone: t.phone || '',
                            specialization: t.specialization,
                            status: t.status
                          });
                          setTechModalOpen(true);
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Profile
                      </button>

                      <button
                        onClick={() => handleTechDelete(t.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: ROOM MANAGEMENT & QR CODE GENERATION */}
          {/* ======================================================== */}
          {activeTab === 'rooms' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Campus Classrooms & Staff Rooms</h2>
                  <p className="text-xs text-slate-500">Create facilities and generate unique maintenance QR door plaques.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingRoom(null);
                    setRoomFormData({ building: '', room_number: '', room_type: 'classroom' });
                    setRoomModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 self-start shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Room
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((r) => (
                  <div key={r.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <DoorOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{r.room_number}</h3>
                          <span className="text-[11px] text-slate-500 capitalize">{r.room_type.replace('_', ' ')}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setQrModalRoom(r)}
                        className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 transition-colors"
                        title="View / Print QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" /> QR Code
                      </button>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{r.building}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>Equipped Assets: <strong className="text-slate-800">{r.equipment_count || 0}</strong></span>
                      <span>Active Tickets: <strong className="text-amber-600">{r.active_complaints_count || 0}</strong></span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          setEditingRoom(r);
                          setRoomFormData({ building: r.building, room_number: r.room_number, room_type: r.room_type });
                          setRoomModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" /> Edit Room
                      </button>

                      <button
                        onClick={() => handleRoomDelete(r.id)}
                        className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: EQUIPMENT INVENTORY */}
          {/* ======================================================== */}
          {activeTab === 'equipment' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Equipment Inventory & Health Status</h2>
                  <p className="text-xs text-slate-500">Track projectors, PCs, AC units, and electrical switches per room.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingEquipment(null);
                    setEquipmentFormData({ room_id: rooms[0]?.id || '', equipment_type: 'Fan', equipment_name: '', status: 'operational' });
                    setEquipmentModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 self-start shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Asset
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-4">Equipment Name</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Room Location</th>
                        <th className="py-3 px-4">Building</th>
                        <th className="py-3 px-4">Condition Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {equipmentList.map((eq) => (
                        <tr key={eq.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {eq.equipment_name}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                              {eq.equipment_type}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {eq.room_number}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {eq.building}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                eq.status === 'operational'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : eq.status === 'needs_maintenance'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {eq.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                setEditingEquipment(eq);
                                setEquipmentFormData({
                                  room_id: eq.room_id,
                                  equipment_type: eq.equipment_type,
                                  equipment_name: eq.equipment_name,
                                  status: eq.status
                                });
                                setEquipmentModalOpen(true);
                              }}
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 mr-1"
                              title="Edit Asset"
                            >
                              <Edit className="w-3.5 h-3.5 inline" />
                            </button>
                            <button
                              onClick={() => handleEquipmentDelete(eq.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-800"
                              title="Delete Asset"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: USER MANAGEMENT */}
          {/* ======================================================== */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
              <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Campus User Registry</h2>
                  <p className="text-xs text-slate-500">Students, faculty staff, technicians, and system administrators.</p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                  {usersList.length} Registered Accounts
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Institutional Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Complaints Filed</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-800">{u.name}</td>
                        <td className="py-3 px-4 text-slate-600">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-100 text-slate-700">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{u.department || 'N/A'}</td>
                        <td className="py-3 px-4 text-slate-500">{u.phone || 'N/A'}</td>
                        <td className="py-3 px-4 font-semibold text-indigo-600">
                          {u.total_complaints_reported || 0}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {u.id !== user.id && (
                            <button
                              onClick={() => handleUserDelete(u.id)}
                              className="text-xs text-rose-600 hover:text-rose-800 font-semibold p-1"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: ANALYTICS & INTERACTIVE RECHARTS */}
          {/* ======================================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-900 to-purple-950 p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">Campus Maintenance Analytics & KPIs</h2>
                  <p className="text-xs text-indigo-200 mt-1">
                    Real-time aggregated breakdown across equipment assets, campus facilities, and resolution cycles.
                  </p>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/15 text-xs font-semibold">
                  Avg Time to Resolution: <strong className="text-emerald-400 font-bold">{stats.avgResolutionHours} hrs</strong>
                </div>
              </div>

              {/* Grid of Recharts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Equipment-Wise Breakdown */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Equipment-Wise Complaint Incidents</h3>
                    <p className="text-xs text-slate-400">Total tickets grouped by appliance/asset category</p>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={equipmentStats}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="equipment_type" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="count" name="Total Reported" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="resolved_count" name="Resolved" fill="#10b981" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Building-Wise Breakdown */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Building-Wise Failure Density</h3>
                    <p className="text-xs text-slate-400">Comparative failure load across campus buildings</p>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={buildingStats} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="building" tick={{ fontSize: 10 }} width={110} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="total_complaints" name="Total Tickets" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                        <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Assign Technician Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Technician to Complaint"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
            Ticket: <strong className="text-slate-800">{selectedComplaint?.complaint_code}</strong> • {selectedComplaint?.problem_type}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Technician *</label>
            <select
              value={assignTechId}
              onChange={(e) => setAssignTechId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white"
              required
            >
              <option value="">-- Choose Technician --</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.specialization}) - [{t.active_tasks_count || 0} active tasks]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Special Instructions (Optional)</label>
            <textarea
              rows={3}
              value={assignNote}
              onChange={(e) => setAssignNote(e.target.value)}
              placeholder="e.g. Inspect power capacitor or bring thermal paste..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow"
          >
            Confirm Assignment
          </button>
        </form>
      </Modal>

      {/* Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Ticket Status"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">New Status</label>
            <select
              value={updateStatusVal}
              onChange={(e) => setUpdateStatusVal(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="Submitted">Submitted</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Maintenance Notes</label>
            <textarea
              rows={3}
              value={repairNotesVal}
              onChange={(e) => setRepairNotesVal(e.target.value)}
              placeholder="Record actions taken..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow"
          >
            Save Status
          </button>
        </form>
      </Modal>

      {/* Technician Add/Edit Modal */}
      <Modal
        isOpen={techModalOpen}
        onClose={() => setTechModalOpen(false)}
        title={editingTech ? 'Edit Technician' : 'Add New Technician'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleTechSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={techFormData.name}
              onChange={(e) => setTechFormData(p => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={techFormData.email}
              onChange={(e) => setTechFormData(p => ({ ...p, email: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={techFormData.phone}
              onChange={(e) => setTechFormData(p => ({ ...p, phone: e.target.value }))}
              placeholder="+91 98765..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Specialization</label>
            <select
              value={techFormData.specialization}
              onChange={(e) => setTechFormData(p => ({ ...p, specialization: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="Electrical">Electrical</option>
              <option value="HVAC & AC">HVAC & AC</option>
              <option value="IT & Computer">IT & Computer</option>
              <option value="Networking">Networking</option>
              <option value="Projector & AV">Projector & AV</option>
              <option value="General Maintenance">General Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              value={techFormData.status}
              onChange={(e) => setTechFormData(p => ({ ...p, status: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow"
          >
            {editingTech ? 'Update Technician' : 'Create Technician'}
          </button>
        </form>
      </Modal>

      {/* Room Add/Edit Modal */}
      <Modal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        title={editingRoom ? 'Edit Room' : 'Add New Classroom / Staff Room'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRoomSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campus Building *</label>
            <input
              type="text"
              required
              value={roomFormData.building}
              onChange={(e) => setRoomFormData(p => ({ ...p, building: e.target.value }))}
              placeholder="e.g. Aryabhata Block (CS & IT)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Room Number / Name *</label>
            <input
              type="text"
              required
              value={roomFormData.room_number}
              onChange={(e) => setRoomFormData(p => ({ ...p, room_number: e.target.value }))}
              placeholder="e.g. Room 204 or Staff Room 102"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Room Type</label>
            <select
              value={roomFormData.room_type}
              onChange={(e) => setRoomFormData(p => ({ ...p, room_type: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="classroom">Classroom</option>
              <option value="staff_room">Staff Room</option>
              <option value="lab">Computer / Science Lab</option>
              <option value="seminar_hall">Seminar Hall</option>
              <option value="other">Other Campus Facility</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow"
          >
            {editingRoom ? 'Update Room' : 'Save Room & Generate QR Code'}
          </button>
        </form>
      </Modal>

      {/* Equipment Add/Edit Modal */}
      <Modal
        isOpen={equipmentModalOpen}
        onClose={() => setEquipmentModalOpen(false)}
        title={editingEquipment ? 'Edit Asset' : 'Add Equipment to Room'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleEquipmentSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Room *</label>
            <select
              value={equipmentFormData.room_id}
              onChange={(e) => setEquipmentFormData(p => ({ ...p, room_id: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              required
            >
              <option value="">-- Choose Room --</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.room_number} ({r.building})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Equipment Type *</label>
            <select
              value={equipmentFormData.equipment_type}
              onChange={(e) => setEquipmentFormData(p => ({ ...p, equipment_type: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              required
            >
              {['Fan', 'Light', 'PC', 'Projector', 'AC', 'Wi-Fi', 'Switch', 'Other'].map(eq => (
                <option key={eq} value={eq}>{eq}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Asset Tag / Name *</label>
            <input
              type="text"
              required
              value={equipmentFormData.equipment_name}
              onChange={(e) => setEquipmentFormData(p => ({ ...p, equipment_name: e.target.value }))}
              placeholder="e.g. BenQ Smart Projector PJ-204"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Operational Status</label>
            <select
              value={equipmentFormData.status}
              onChange={(e) => setEquipmentFormData(p => ({ ...p, status: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="operational">Operational</option>
              <option value="needs_maintenance">Needs Maintenance</option>
              <option value="under_repair">Under Repair</option>
              <option value="replaced">Replaced</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow"
          >
            {editingEquipment ? 'Save Asset Changes' : 'Add Asset to Room'}
          </button>
        </form>
      </Modal>

      {/* QR Code Plaque Modal */}
      <QRCodeModal
        isOpen={!!qrModalRoom}
        onClose={() => setQrModalRoom(null)}
        room={qrModalRoom}
      />
    </div>
  );
};

export default AdminDashboard;
