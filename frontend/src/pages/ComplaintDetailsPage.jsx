import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Wrench,
  ArrowLeft,
  Building,
  DoorOpen,
  Calendar,
  User,
  Phone,
  Mail,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  Hammer,
  Image as ImageIcon
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge, { PriorityBadge } from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import Modal from '../components/Modal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Admin Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Status Update Modal (for Tech or Admin)
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [repairNotes, setRepairNotes] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
        setNewStatus(res.data.complaint.status);
        setRepairNotes(res.data.complaint.repair_notes || '');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const openAssignModal = async () => {
    try {
      const res = await api.get('/technicians');
      setTechnicians(res.data.technicians || []);
      setAssignModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignTechnician = async (e) => {
    e.preventDefault();
    if (!selectedTechId) return;
    setAssignLoading(true);
    try {
      await api.put(`/complaints/${id}/assign`, {
        technician_id: selectedTechId,
        note: assignNote
      });
      setAssignModalOpen(false);
      setAssignNote('');
      fetchComplaintDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign technician');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      await api.put(`/complaints/${id}/status`, {
        status: newStatus,
        repair_notes: repairNotes
      });
      setStatusModalOpen(false);
      fetchComplaintDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md shadow-sm">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Complaint Not Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">{error || 'This complaint record is unavailable or unauthorized.'}</p>
          <Link
            to={`/dashboard/${user?.role || 'student'}`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} showSidebarToggle={true} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Top Navigation & Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Ticket #{complaint.complaint_code}
                  </h1>
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} />
                </div>
              </div>

              {/* Action Buttons for Admins & Technicians */}
              <div className="flex items-center gap-2">
                {user.role === 'admin' && (
                  <button
                    onClick={openAssignModal}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Hammer className="w-4 h-4" />
                    {complaint.technician_id ? 'Reassign Technician' : 'Assign Technician'}
                  </button>
                )}

                {(user.role === 'admin' || user.role === 'technician') && (
                  <button
                    onClick={() => setStatusModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Update Status & Notes
                  </button>
                )}
              </div>
            </div>

            {/* Visual Timeline Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" /> Maintenance Progress Timeline
              </h2>
              <Timeline
                status={complaint.status}
                history={complaint.history}
                technicianName={complaint.technician_name}
                repairNotes={complaint.repair_notes}
                resolvedAt={complaint.resolved_at}
              />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left 2 Cols: Problem Details & Photo */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Problem Overview: {complaint.problem_type}
                  </h3>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {complaint.description}
                  </div>

                  {complaint.photo_url && (
                    <div className="pt-2">
                      <h4 className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-600" /> Uploaded Problem Image:
                      </h4>
                      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-w-md">
                        <img
                          src={complaint.photo_url}
                          alt="Fault proof"
                          className="w-full h-auto object-cover max-h-72"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Col: Location & Reporter Meta */}
              <div className="space-y-6">
                {/* Location Information */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Location & Equipment
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <Building className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-slate-500 text-[10px]">Campus Building</div>
                        <div className="font-bold text-slate-800">{complaint.building}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <DoorOpen className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-slate-500 text-[10px]">Room Number & Type</div>
                        <div className="font-bold text-slate-800">
                          {complaint.room_number} ({complaint.room_type})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Wrench className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-slate-500 text-[10px]">Target Asset / Equipment</div>
                        <div className="font-bold text-slate-800">
                          {complaint.equipment_name || 'General Room Fixture'}
                          {complaint.equipment_type && ` • ${complaint.equipment_type}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-slate-500 text-[10px]">Reported Timestamp</div>
                        <div className="font-semibold text-slate-700">
                          {new Date(complaint.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reporter Information */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Reported By
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-600" /> {complaint.reporter_name}
                    </div>
                    <div className="text-slate-500 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {complaint.reporter_email}
                    </div>
                    {complaint.reporter_phone && (
                      <div className="text-slate-500 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {complaint.reporter_phone}
                      </div>
                    )}
                    <div className="pt-1">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {complaint.reporter_role} • {complaint.reporter_department}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Admin Assign Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Technician to Complaint"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAssignTechnician} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Technician *</label>
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white"
              required
            >
              <option value="">-- Choose Available Technician --</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.specialization}) - [{t.status}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Assignment Note (Optional)</label>
            <textarea
              rows={3}
              value={assignNote}
              onChange={(e) => setAssignNote(e.target.value)}
              placeholder="e.g. Please bring replacement capacitor or examine breaker panel..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={assignLoading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow transition-all"
          >
            {assignLoading ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </form>
      </Modal>

      {/* Status & Repair Notes Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Complaint Status & Notes"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Complaint Status *</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white"
              required
            >
              <option value="Submitted">Submitted (Pending)</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Technician Repair Notes</label>
            <textarea
              rows={4}
              value={repairNotes}
              onChange={(e) => setRepairNotes(e.target.value)}
              placeholder="Describe actions taken, replaced parts, testing results, or safety verification..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={updateLoading}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition-all"
          >
            {updateLoading ? 'Saving Changes...' : 'Save Status Update'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ComplaintDetailsPage;
