import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { QrCode, Camera, AlertCircle, Sparkles, Building, DoorOpen } from 'lucide-react';
import Modal from './Modal';
import api from '../services/api';

export const QRScannerModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [scanError, setScanError] = useState(null);
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'quick'
  const scannerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch available rooms for quick-scan fallback
      api.get('/rooms')
        .then(res => setRooms(res.data.rooms || []))
        .catch(err => console.error('Error fetching rooms:', err));
    }
  }, [isOpen]);

  useEffect(() => {
    let scanner = null;
    if (isOpen && activeTab === 'camera') {
      const timer = setTimeout(() => {
        try {
          scanner = new Html5QrcodeScanner(
            'qr-reader',
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
          );
          scanner.render(onScanSuccess, onScanFailure);
          scannerRef.current = scanner;
        } catch (err) {
          console.warn('QR camera scanner initialization notice:', err);
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          try {
            scannerRef.current.clear();
          } catch (e) {
            // ignore cleanup errors
          }
        }
      };
    }
  }, [isOpen, activeTab]);

  const handleRoomSelected = (room) => {
    if (scannerRef.current) {
      try { scannerRef.current.clear(); } catch (e) {}
    }
    onClose();
    navigate(`/report?building=${encodeURIComponent(room.building)}&roomId=${room.id}&roomNumber=${encodeURIComponent(room.room_number)}`);
  };

  const onScanSuccess = (decodedText) => {
    try {
      // Check if JSON payload
      if (decodedText.startsWith('{')) {
        const data = JSON.parse(decodedText);
        if (data.roomId || data.building) {
          onClose();
          navigate(`/report?building=${encodeURIComponent(data.building || '')}&roomId=${data.roomId || ''}&roomNumber=${encodeURIComponent(data.roomNumber || '')}`);
          return;
        }
      }

      // Check if CTC-ROOM format
      const match = rooms.find(r => r.qr_code === decodedText || decodedText.includes(r.room_number));
      if (match) {
        handleRoomSelected(match);
      } else {
        // Fallback: pick first matched room or pass text
        onClose();
        navigate(`/report?qrCode=${encodeURIComponent(decodedText)}`);
      }
    } catch (e) {
      console.error('QR parsing error:', e);
      setScanError('Could not process QR code data.');
    }
  };

  const onScanFailure = (error) => {
    // Normal non-match during frame scan
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan Classroom / Room QR Code" maxWidth="max-w-lg">
      <div className="space-y-4">
        {/* Tab switcher */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 text-sm font-medium border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'camera'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Camera className="w-4 h-4" /> Live Camera Scanner
          </button>
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-2 text-sm font-medium border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'quick'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Simulated Room QR Codes
          </button>
        </div>

        {activeTab === 'camera' ? (
          <div>
            <p className="text-xs text-slate-500 text-center mb-3">
              Point your device camera at the classroom door QR plaque to instantly open the problem reporting form.
            </p>
            <div id="qr-reader" className="w-full bg-slate-900 rounded-xl overflow-hidden min-h-[260px] flex items-center justify-center text-white"></div>
            {scanError && (
              <div className="mt-2 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {scanError}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-500">
              Select any registered classroom or staff room to simulate scanning its on-door QR code plaque:
            </p>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {rooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => handleRoomSelected(room)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="font-semibold text-sm text-slate-800 group-hover:text-indigo-600 flex items-center gap-2">
                      <DoorOpen className="w-4 h-4 text-indigo-500" />
                      {room.room_number}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building className="w-3 h-3" />
                      {room.building} ({room.room_type})
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    Scan Room
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default QRScannerModal;
