import { useState, useRef } from 'react';
import { QrCode, Printer, Download, Sparkles, Check, HelpCircle, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';

export function QrGeneratorPage() {
  const [selectedTable, setSelectedTable] = useState<number>(1);
  const [capacity, setCapacity] = useState<number>(4);
  const [copied, setCopied] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  const qrUrl = `${window.location.origin}/?table=${selectedTable}&guests=${capacity}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}&color=0f172a&bgcolor=ffffff&qzone=1`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;
    
    if (printContent) {
      // Create a temporary print frame or styling
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Table ${selectedTable} QR Code</title>
              <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&family=Poppins:wght@400;700;900&display=swap" rel="stylesheet">
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body {
                  font-family: 'Outfit', sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  background: white;
                  margin: 0;
                  padding: 20px;
                }
                @media print {
                  body { padding: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="border-[8px] border-slate-900 rounded-[36px] p-8 max-w-sm text-center shadow-xl flex flex-col items-center bg-white">
                <h2 class="text-xs font-black tracking-[0.25em] text-slate-400 uppercase mb-1">SMARTSERVE POS</h2>
                <h1 class="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 font-poppins">SCAN TO ORDER</h1>
                <div class="w-12 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-6"></div>
                
                <div class="bg-slate-50 border-2 border-slate-100 rounded-[28px] p-6.5 mb-6 flex justify-center items-center shadow-inner">
                  <img src="${qrImageUrl}" alt="Table QR Code" class="w-52 h-52 object-contain" />
                </div>
                
                <div class="bg-slate-900 text-white font-black text-lg font-poppins rounded-2xl px-6 py-2 shadow-md mb-5 tracking-wide uppercase">
                  Table ${selectedTable}
                </div>
                
                <p class="text-xs font-bold text-slate-500 max-w-[250px] leading-relaxed mb-6 uppercase tracking-wider">
                  Scan this code using your smartphone camera to view the menu, select preferences, and order.
                </p>
                
                <div class="border-t border-slate-100 pt-5 w-full flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <span>Guest Capacity: ${capacity} Pax</span>
                  <span>•</span>
                  <span>Wi-Fi Guest Pass: smartserve123</span>
                </div>
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">QR CODE TABLE GENERATOR</h1>
        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
          Generate digital dining codes, print desk cards, and bind tables directly to customer cart sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Settings Panel */}
        <div className="lg:col-span-5 bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-sm space-y-6 self-start">
          <h3 className="font-extrabold text-[15.5px] text-[#0f172a] font-poppins flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-purple-500" />
            QR Sign Specifications
          </h3>

          <div className="space-y-4">
            {/* Table Number Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Select Table</label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(parseInt(e.target.value))}
                className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3.5 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Table {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Capacity Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Guests Seating Capacity</label>
              <select
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value))}
                className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3.5 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
              >
                <option value={2}>2 Seater (Cozy)</option>
                <option value={4}>4 Seater (Family)</option>
                <option value={6}>6 Seater (Group)</option>
                <option value={8}>8 Seater (Banquet)</option>
              </select>
            </div>

            {/* Scanned Destination URL info */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Target Scanned Address</span>
              <code className="text-[11px] font-bold text-[#7c3aed] break-all block leading-tight">
                {qrUrl}
              </code>
              
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 cursor-pointer pt-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Copied URL!
                  </>
                ) : (
                  <>
                    Copy Link Address
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-50">
            <button
              onClick={handlePrint}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Sign
            </button>
            <a
              href={qrImageUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer text-center"
            >
              <Download className="w-4 h-4" />
              Get Image
            </a>
          </div>
        </div>

        {/* Visual Sign Blueprint Mockup */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-50 border border-[#f1f5f9] rounded-[32px] p-8 min-h-[460px]">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4">Printable Sign Preview</span>
          
          <div 
            ref={printRef}
            className="bg-white border-[8px] border-slate-900 rounded-[36px] p-8 max-w-sm text-center shadow-xl flex flex-col items-center w-full transition-transform hover:scale-[1.01]"
          >
            <h2 className="text-[10px] font-black tracking-[0.25em] text-slate-400 uppercase mb-1">SMARTSERVE POS</h2>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 font-poppins">SCAN TO ORDER</h1>
            <div className="w-12 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-6"></div>
            
            {/* QR Frame */}
            <div className="bg-slate-50 border border-slate-100 rounded-[28px] p-6.5 mb-6 flex justify-center items-center shadow-inner relative group">
              <img 
                src={qrImageUrl} 
                alt={`Table ${selectedTable} QR`} 
                className="w-48 h-48 object-contain" 
              />
            </div>
            
            {/* Table Badge */}
            <div className="bg-slate-900 text-white font-black text-base font-poppins rounded-xl px-5 py-1.5 shadow-md mb-5 tracking-wide uppercase">
              Table {selectedTable}
            </div>
            
            <p className="text-[11px] font-bold text-slate-500 max-w-[240px] leading-relaxed mb-6 uppercase tracking-wider">
              Scan this code using your smartphone camera to view the menu, select preferences, and order.
            </p>
            
            {/* Sign Footer */}
            <div className="border-t border-slate-100 pt-5 w-full flex items-center justify-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider">
              <span>Guest Capacity: {capacity} Pax</span>
              <span>•</span>
              <span className="flex items-center gap-0.5"><Wifi className="w-3 h-3" /> smartserve123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
