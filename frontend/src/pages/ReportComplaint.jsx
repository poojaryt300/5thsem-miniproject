import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Wrench,
  Building,
  DoorOpen,
  Cpu,
  AlertTriangle,
  FileText,
  Upload,
  CheckCircle2,
  X,
  ArrowLeft,
  Sparkles,
  QrCode,
  Image as ImageIcon
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import QRScannerModal from '../components/QRScannerModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const PROBLEM_TYPES = [
  'Fans not working',
  'Lights not working',
  'Computers and PCs not working',
  'Projectors not working',
  'AC problems',
  'Wi-Fi and network problems',
  'Electrical switches and sockets',
  'Plumbing / Water leak',
  'Furniture / Desk damage',
  'Other Campus Equipment Fault'
];

const EQUIPMENT_TYPES = ['Fan', 'Light', 'PC', 'Projector', 'AC', 'Wi-Fi', 'Switch', 'Other'];

export const ReportComplaint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);

  // Form State
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [problemType, setProblemType] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState('');

  // Read URL query params (e.g., from QR scan: ?building=...&roomId=...&roomNumber=...)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const bldg = searchParams.get('building');
    const rId = searchParams.get('roomId');

    if (bldg) setSelectedBuilding(bldg);
    if (rId) setSelectedRoomId(rId);
  }, [location.search]);

  // Fetch initial buildings and rooms
  useEffect(() => {
    api.get('/rooms/buildings')
      .then(res => setBuildings(res.data.buildings || []))
      .catch(err => console.error(err));

    api.get('/rooms')
      .then(res => setRooms(res.data.rooms || []))
      .catch(err => console.error(err));
  }, []);

  // When room changes, fetch equipment inside this room
  useEffect(() => {
    if (selectedRoomId) {
      api.get(`/equipment?room_id=${selectedRoomId}`)
        .then(res => {
          setEquipmentList(res.data.equipment || []);
          setSelectedEquipmentId('');
        })
        .catch(err => console.error(err));
    } else {
      setEquipmentList([]);
      setSelectedEquipmentId('');
    }
  }, [selectedRoomId]);

  // Filtered rooms based on selected building
  const filteredRooms = selectedBuilding
    ? rooms.filter(r => r.building === selectedBuilding)
    : rooms;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedRoomId) {
      setError('Please select a classroom or room.');
      return;
    }
    if (!problemType) {
      setError('Please select the problem type.');
      return;
    }
    if (!description.trim()) {
      setError('Please describe the problem.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('room_id', selectedRoomId);
      if (selectedEquipmentId) formData.append('equipment_id', selectedEquipmentId);
      formData.append('problem_type', problemType);
      formData.append('priority', priority);
      formData.append('description', description.trim());
      if (photo) formData.append('photo', photo);

      const res = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setSuccessData(res.data);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} showSidebarToggle={true} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
          openQRScanner={() => setScannerOpen(true)}
        />

        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                </button>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                  <Wrench className="w-6 h-6 text-indigo-600" />
                  Report a Campus Problem
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Submit an equipment breakdown or classroom maintenance request for immediate dispatch.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <QrCode className="w-4 h-4" /> Scan Room Door QR
              </button>
            </div>

            {/* Success Card */}
            {successData ? (
              <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl shadow-emerald-500/5 text-center space-y-5 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Complaint Logged Successfully!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Your complaint ticket has been routed to the maintenance coordination team.
                  </p>
                  <div className="inline-block mt-3 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-sm font-bold">
                    Ticket #{successData.complaint_code}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                  <button
                    onClick={() => navigate(`/complaints/${successData.complaint_id}`)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Track Complaint Timeline
                  </button>
                  <button
                    onClick={() => {
                      setSuccessData(null);
                      setDescription('');
                      setPhoto(null);
                      setPhotoPreview(null);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    Submit Another Report
                  </button>
                </div>
              </div>
            ) : (
              /* Report Form */
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Location Group */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-indigo-600" /> Select Campus Building *
                      </label>
                      <select
                        value={selectedBuilding}
                        onChange={(e) => {
                          setSelectedBuilding(e.target.value);
                          setSelectedRoomId('');
                        }}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                        required
                      >
                        <option value="">-- Choose Building --</option>
                        {buildings.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <DoorOpen className="w-3.5 h-3.5 text-indigo-600" /> Select Classroom or Staff Room *
                      </label>
                      <select
                        value={selectedRoomId}
                        onChange={(e) => setSelectedRoomId(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                        required
                      >
                        <option value="">-- Choose Room --</option>
                        {filteredRooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.room_number} ({r.room_type})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Equipment & Problem Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-indigo-600" /> Equipment / Asset in Room (Optional)
                      </label>
                      <select
                        value={selectedEquipmentId}
                        onChange={(e) => setSelectedEquipmentId(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                      >
                        <option value="">-- Specific Equipment (or General Room) --</option>
                        {equipmentList.map((eq) => (
                          <option key={eq.id} value={eq.id}>
                            {eq.equipment_name} ({eq.equipment_type})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-indigo-600" /> Problem Category *
                      </label>
                      <select
                        value={problemType}
                        onChange={(e) => setProblemType(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                        required
                      >
                        <option value="">-- Select Problem Type --</option>
                        {PROBLEM_TYPES.map((pt) => (
                          <option key={pt} value={pt}>
                            {pt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Priority Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Priority Level *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { level: 'Low', desc: 'Cosmetic or minor issue', color: 'hover:border-slate-400 peer-checked:border-slate-600 peer-checked:bg-slate-50' },
                        { level: 'Medium', desc: 'Routine repair', color: 'hover:border-sky-400 peer-checked:border-sky-600 peer-checked:bg-sky-50' },
                        { level: 'High', desc: 'Disrupting lectures/lab', color: 'hover:border-amber-400 peer-checked:border-amber-600 peer-checked:bg-amber-50' },
                        { level: 'Urgent', desc: 'Safety hazard or exam emergency', color: 'hover:border-rose-400 peer-checked:border-rose-600 peer-checked:bg-rose-50' }
                      ].map((p) => (
                        <label key={p.level} className="relative cursor-pointer">
                          <input
                            type="radio"
                            name="priority"
                            value={p.level}
                            checked={priority === p.level}
                            onChange={(e) => setPriority(e.target.value)}
                            className="sr-only peer"
                          />
                          <div className={`p-3 rounded-xl border border-slate-200 transition-all ${p.color}`}>
                            <div className="font-bold text-xs text-slate-800">{p.level}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{p.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" /> Detailed Problem Description *
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please specify exact location (e.g. 2nd row near window, switch sparked, error code on display)..."
                      className="w-full p-3.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
                      required
                    ></textarea>
                  </div>

                  {/* Photo Upload with Live Preview */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-600" /> Upload Problem Photo (Optional)
                    </label>

                    {photoPreview ? (
                      <div className="relative inline-block rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                        <img src={photoPreview} alt="Preview" className="h-44 w-auto object-cover" />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white shadow transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition-all group">
                        <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors mb-2" />
                        <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600">
                          Click to upload an image of the equipment fault
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {loading ? (
                        <span>Submitting Problem Report...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Submit Complaint Ticket
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>

      <QRScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
    </div>
  );
};

export default ReportComplaint;
