import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, Building, DoorOpen } from 'lucide-react';
import Modal from './Modal';

export const QRCodeModal = ({ isOpen, onClose, room }) => {
  const printAreaRef = useRef(null);

  if (!room) return null;

  const qrPayload = JSON.stringify({
    app: 'CampusTechCare',
    roomId: room.id,
    building: room.building,
    roomNumber: room.room_number,
    code: room.qr_code || `CTC-ROOM-${room.id}`
  });

  const handlePrint = () => {
    const printContent = printAreaRef.current;
    const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    windowPrint.document.write(`
      <html>
        <head>
          <title>Campus TechCare - Room QR Code - ${room.room_number}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 40px; margin: 0; }
            .card { border: 3px solid #1e293b; border-radius: 20px; padding: 30px; max-width: 450px; margin: auto; }
            h1 { color: #1e1b4b; margin-bottom: 5px; font-size: 26px; }
            h2 { color: #4338ca; font-size: 20px; margin-top: 0; }
            .badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 6px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
            .instructions { font-size: 14px; color: #64748b; margin-top: 20px; }
            .footer { margin-top: 25px; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Campus TechCare</h1>
            <h2>Smart Maintenance Portal</h2>
            <div class="badge">${room.building}</div>
            <h3 style="font-size: 22px; margin: 10px 0;">${room.room_number}</h3>
            <div style="margin: 25px 0;">
              ${printContent.querySelector('svg').outerHTML}
            </div>
            <p class="instructions">Scan this QR code with the Campus TechCare app to report any equipment issues in this room immediately.</p>
            <div class="footer">Campus Facility & TechCare System • ID: ${room.qr_code || room.id}</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    windowPrint.document.close();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Room Maintenance QR Code" maxWidth="max-w-md">
      <div className="text-center space-y-6">
        <div ref={printAreaRef} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
            Campus TechCare
          </div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center justify-center gap-1.5">
            <DoorOpen className="w-5 h-5 text-indigo-600" />
            {room.room_number}
          </h3>
          <p className="text-xs text-slate-500 mb-5 flex items-center justify-center gap-1">
            <Building className="w-3.5 h-3.5" />
            {room.building} ({room.room_type})
          </p>

          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 inline-block">
            <QRCodeSVG
              value={qrPayload}
              size={200}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="mt-4 text-xs font-mono text-slate-500 bg-slate-200/60 px-3 py-1 rounded-md">
            {room.qr_code || `CTC-ROOM-${room.id}`}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" /> Print Door Plaque
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default QRCodeModal;
