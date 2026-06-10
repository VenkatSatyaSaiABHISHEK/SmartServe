import { useState } from 'react';
import { useAdminStore } from '../store/useAdminStore';
import { Search, Calendar, Plus, User, Clock, Trash2, ShieldAlert, Layers, Grid, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ReservationPage() {
  const { reservations, addReservation, updateReservationStatus } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom states for Visual Floor Plan Seating Map
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [activeFloor, setActiveFloor] = useState<1 | 2>(1);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

  // Add reservation form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [custName, setCustName] = useState('');
  const [tableNum, setTableNum] = useState('');
  const [resDate, setResDate] = useState('2026-06-10');
  const [resTime, setResTime] = useState('08:00 PM');
  const [guests, setGuests] = useState('2');
  const [requestText, setRequestText] = useState('');

  const handleAddReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !tableNum) return;

    addReservation({
      customerName: custName,
      tableNumber: parseInt(tableNum),
      date: resDate,
      time: resTime,
      guestCount: parseInt(guests),
      specialRequest: requestText || undefined
    });

    // Reset Form
    setCustName('');
    setTableNum('');
    setResDate('2026-06-09');
    setResTime('08:00 PM');
    setGuests('2');
    setRequestText('');
    setShowAddForm(false);
  };

  const handleStatusChange = (id: string, status: typeof reservations[0]['status']) => {
    updateReservationStatus(id, status);
  };

  // Filter reservations
  const filteredReservations = reservations.filter(res => 
    res.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `table ${res.tableNumber}`.includes(searchQuery.toLowerCase()) ||
    res.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Define visual seating charts table layouts with coordinates
  const floor1Tables = [
    { number: 1, capacity: 2, shape: 'circle', x: '18%', y: '25%' },
    { number: 2, capacity: 4, shape: 'square', x: '46%', y: '25%' },
    { number: 5, capacity: 2, shape: 'circle', x: '74%', y: '25%' },
    { number: 3, capacity: 4, shape: 'square', x: '18%', y: '65%' },
    { number: 4, capacity: 6, shape: 'rect', x: '46%', y: '65%' },
    { number: 6, capacity: 4, shape: 'square', x: '74%', y: '65%' },
  ];

  const floor2Tables = [
    { number: 7, capacity: 4, shape: 'square', x: '18%', y: '25%' },
    { number: 8, capacity: 2, shape: 'circle', x: '46%', y: '25%' },
    { number: 9, capacity: 8, shape: 'rect-long', x: '74%', y: '25%' },
    { number: 10, capacity: 4, shape: 'square', x: '18%', y: '65%' },
    { number: 11, capacity: 6, shape: 'rect', x: '46%', y: '65%' },
    { number: 12, capacity: 2, shape: 'circle', x: '74%', y: '65%' },
  ];

  const activeFloorTables = activeFloor === 1 ? floor1Tables : floor2Tables;

  // Find reservation for a table
  const getTableReservation = (tableNumber: number) => {
    return reservations.find(
      (r) => r.tableNumber === tableNumber && r.status !== 'Completed' && r.status !== 'Cancelled'
    );
  };

  const selectedRes = selectedTableId ? getTableReservation(selectedTableId) : null;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">FLOOR BOOKINGS & RESERVATIONS</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Monitor host reservations and update guest check-in schedules.
          </p>
        </div>
        
        <div className="flex items-center gap-3.5 self-start sm:self-center">
          {/* Toggle View Mode */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
            <button
              type="button"
              onClick={() => {
                setViewMode('map');
                setSelectedTableId(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'map' ? 'bg-white text-[#7c3aed] shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Floor Map
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-[#7c3aed] shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Bookings List
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setTableNum('');
              setGuests('2');
              setShowAddForm(!showAddForm);
            }}
            className="inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer self-start"
          >
            <Plus className="w-4.5 h-4.5" />
            Create Booking
          </button>
        </div>
      </div>

      {/* Add Reservation Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddReservation} className="bg-white border border-[#f1f5f9] rounded-[24px] p-6.5 shadow-sm space-y-4 max-w-2xl">
              <h3 className="font-extrabold text-[15px] text-[#0f172a] font-poppins">New Booking Specifications</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Guest Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena Rostova"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Table Number</label>
                  <input
                    type="number"
                    required
                    placeholder="5"
                    value={tableNum}
                    onChange={(e) => setTableNum(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Guest Size</label>
                  <input
                    type="number"
                    required
                    placeholder="4"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Booking Date</label>
                  <input
                    type="date"
                    required
                    value={resDate}
                    onChange={(e) => setResDate(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Booking Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 08:30 PM"
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Special Notes / Diet Requests</label>
                  <textarea
                    placeholder="e.g. Eggless cake, baby seat..."
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400 min-h-[70px] resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-slate-100 text-slate-500 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-500/10 cursor-pointer"
                >
                  Save Reservation
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {viewMode === 'map' ? (
        /* ==================== 2D FLOOR MAP SEATING PLAN ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map Layout Canvas */}
          <div className="lg:col-span-8 bg-white border border-[#f1f5f9] rounded-[28px] p-6 shadow-sm space-y-5 flex flex-col justify-between">
            {/* Floor and Legend Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
              {/* Floor Toggles */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/30 self-start">
                <button
                  type="button"
                  onClick={() => {
                    setActiveFloor(1);
                    setSelectedTableId(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeFloor === 1 ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Floor 1 (Ground)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFloor(2);
                    setSelectedTableId(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeFloor === 2 ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Floor 2 (Terrace)
                </button>
              </div>

              {/* Status Labels */}
              <div className="flex flex-wrap gap-3 text-[9px] font-black uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-50 border-2 border-green-200 border-dashed" /> Available</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-50 border-2 border-amber-200" /> Pending</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-50 border-2 border-blue-200" /> Confirmed</span>
              </div>
            </div>

            {/* Blueprint Grid Canvas */}
            <div className="relative w-full aspect-[1.8] bg-[#fafafc] border border-[#f1f5f9] rounded-[24px] overflow-hidden select-none">
              {/* Layout Decorative Lines (Entrance, Kitchen, stairs) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-200/60 px-4 py-1 text-[9px] font-black uppercase tracking-wider rounded-b-xl border-x border-b border-slate-300/35">
                Kitchen Pass & Plating
              </div>
              <div className="absolute bottom-0 left-10 bg-slate-200/60 px-4 py-1 text-[9px] font-black uppercase tracking-wider rounded-t-xl border-x border-t border-slate-300/35">
                Main Entrance
              </div>
              <div className="absolute bottom-4 right-4 bg-slate-200/60 p-2 text-[9px] font-black uppercase tracking-wider rounded-xl border border-slate-300/35">
                Stairs
              </div>

              {/* Floor indicator logo background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 font-black text-slate-800 text-5xl tracking-widest uppercase">
                Floor {activeFloor}
              </div>

              {/* Map Tables Loop */}
              {activeFloorTables.map((table) => {
                const activeRes = getTableReservation(table.number);
                
                // Color mapping
                let statusColors = 'bg-green-50 text-green-700 border-green-200 border-dashed';
                if (activeRes) {
                  if (activeRes.status === 'Confirmed') {
                    statusColors = 'bg-blue-50 text-blue-700 border-blue-200 shadow-md shadow-blue-500/5';
                  } else if (activeRes.status === 'Pending') {
                    statusColors = 'bg-amber-50 text-amber-700 border-amber-200 shadow-md shadow-amber-500/5';
                  }
                }
                
                const isSelected = selectedTableId === table.number;
                const highlightBorder = isSelected ? 'ring-4 ring-purple-500 ring-offset-2' : '';

                // Shapes
                const sizeStyles = {
                  'circle': 'w-16 h-16 rounded-full',
                  'square': 'w-18 h-18 rounded-2xl',
                  'rect': 'w-26 h-18 rounded-[20px]',
                  'rect-long': 'w-30 h-18 rounded-[20px]'
                }[table.shape];

                // Chair coordinates for visualization
                const getChairs = () => {
                  if (table.capacity === 2) {
                    return [
                      { top: '-10px', left: 'calc(50% - 7px)' }, // Top
                      { bottom: '-10px', left: 'calc(50% - 7px)' } // Bottom
                    ];
                  }
                  if (table.capacity === 4) {
                    return [
                      { top: '-10px', left: 'calc(50% - 7px)' },
                      { bottom: '-10px', left: 'calc(50% - 7px)' },
                      { left: '-10px', top: 'calc(50% - 7px)' },
                      { right: '-10px', top: 'calc(50% - 7px)' }
                    ];
                  }
                  if (table.capacity === 6) {
                    return [
                      { top: '-10px', left: '20%' },
                      { top: '-10px', left: '50%' },
                      { top: '-10px', left: '80%' },
                      { bottom: '-10px', left: '20%' },
                      { bottom: '-10px', left: '50%' },
                      { bottom: '-10px', left: '80%' }
                    ];
                  }
                  return [
                    { top: '-10px', left: '15%' },
                    { top: '-10px', left: '38%' },
                    { top: '-10px', left: '61%' },
                    { top: '-10px', left: '85%' },
                    { bottom: '-10px', left: '15%' },
                    { bottom: '-10px', left: '38%' },
                    { bottom: '-10px', left: '61%' },
                    { bottom: '-10px', left: '85%' }
                  ];
                };

                return (
                  <div 
                    key={table.number}
                    className="absolute"
                    style={{ left: table.x, top: table.y, transform: 'translate(-50%, -50%)' }}
                  >
                    {/* Render Chairs Around Table */}
                    {getChairs().map((pos, idx) => (
                      <span 
                        key={idx}
                        className="absolute w-3.5 h-3.5 rounded bg-slate-300 border border-slate-400/30 shadow-inner z-0 pointer-events-none"
                        style={pos}
                      />
                    ))}

                    {/* Table Body */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTableId(table.number);
                        if (!activeRes) {
                          setTableNum(table.number.toString());
                          setGuests(table.capacity.toString());
                          setShowAddForm(true);
                        } else {
                          setShowAddForm(false);
                        }
                      }}
                      className={`relative z-10 flex flex-col items-center justify-center border-2 text-center cursor-pointer transition-all duration-300 active:scale-95 ${sizeStyles} ${statusColors} ${highlightBorder}`}
                    >
                      <span className="text-xs font-black font-poppins">T{table.number}</span>
                      <span className="text-[8px] font-black uppercase tracking-wider opacity-60 mt-0.5">{table.capacity} Pax</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details & Actions Panel */}
          <div className="lg:col-span-4 flex flex-col justify-between min-h-[350px]">
            {selectedTableId ? (
              selectedRes ? (
                /* Active Booking Detail View */
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-purple-100 rounded-[28px] p-6 shadow-md flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-2 border-b border-slate-50 pb-3">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{selectedRes.id}</span>
                        <h4 className="font-extrabold text-[16px] text-slate-900 font-poppins leading-tight mt-1">
                          {selectedRes.customerName}
                        </h4>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                        selectedRes.status === 'Confirmed' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        selectedRes.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-slate-50 text-slate-400'
                      }`}>
                        {selectedRes.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-b border-slate-50 pb-4 text-xs font-bold text-slate-500">
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Timing</span>
                        <span className="text-[#0f172a] flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedRes.time}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Table & Guests</span>
                        <span className="text-[#0f172a]">Table {selectedRes.tableNumber} • {selectedRes.guestCount} Pax</span>
                      </div>
                    </div>

                    {selectedRes.specialRequest && (
                      <div className="bg-[#fafafc] border border-[#f1f5f9] p-3.5 rounded-xl flex items-start gap-2 text-[11px] text-slate-600 font-medium">
                        <ShieldAlert className="w-4.5 h-4.5 text-purple-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{selectedRes.specialRequest}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-slate-50">
                    <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block ml-1">Update Status</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(selectedRes.id, 'Confirmed')}
                        className={`py-2 rounded-xl text-[9.5px] font-black uppercase tracking-wider cursor-pointer border text-center transition-colors ${
                          selectedRes.status === 'Confirmed'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-100'
                        }`}
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(selectedRes.id, 'Completed')}
                        className="py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-600 rounded-xl text-[9.5px] font-black uppercase tracking-wider cursor-pointer text-center transition-colors"
                      >
                        Arrived
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(selectedRes.id, 'Cancelled')}
                        className="py-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 rounded-xl text-[9.5px] font-black uppercase tracking-wider cursor-pointer text-center transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Selected Available Table Details */
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white border border-[#f1f5f9] rounded-[28px] p-6 shadow-sm flex-1 flex flex-col justify-center items-center text-center space-y-4"
                >
                  <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center border border-green-100/60 shadow-sm">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[15.5px] text-[#0f172a] font-poppins">Table {selectedTableId} Available</h4>
                    <p className="text-xs text-slate-400 font-semibold mt-1">Ready for custom client booking on Floor {activeFloor}.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTableNum(selectedTableId.toString());
                      setShowAddForm(true);
                    }}
                    className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-sm cursor-pointer transition-colors"
                  >
                    Open Reservation Form
                  </button>
                </motion.div>
              )
            ) : (
              /* No Table Selected State */
              <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6 shadow-sm flex-1 flex flex-col justify-center items-center text-center space-y-3">
                <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-100/50">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[14.5px] text-[#0f172a] font-poppins">No Table Selected</h4>
                  <p className="text-[11.5px] text-slate-400 font-semibold leading-relaxed max-w-[200px]">
                    Click on any table in the visual seating layout map to review bookings or slot reservations.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ==================== LIST VIEW (ORIGINAL LAYOUT) ==================== */
        <div className="space-y-6">
          {/* Search Filter */}
          <div className="relative">
            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by reservation ID, guest name, or table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#f1f5f9] rounded-[22px] pl-12 pr-6 py-4.5 text-sm font-bold text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-500/5 transition-all shadow-sm"
            />
          </div>

          {/* Bookings List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReservations.map((res) => {
              const statusStyles = {
                'Pending': 'bg-amber-50 text-amber-600 border border-amber-100',
                'Confirmed': 'bg-blue-50 text-blue-600 border border-blue-100',
                'Completed': 'bg-green-50 text-green-600 border border-green-100',
                'Cancelled': 'bg-slate-100 text-slate-400 border border-slate-200'
              };

              return (
                <div key={res.id} className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{res.id}</span>
                        <h4 className="font-extrabold text-[15px] text-[#0f172a] font-poppins leading-tight mt-1">{res.customerName}</h4>
                      </div>
                      <span className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shrink-0 ${statusStyles[res.status]}`}>
                        {res.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-y border-slate-50 py-3 text-xs font-bold text-slate-500">
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Timing</span>
                        <span className="text-[#0f172a] flex items-center gap-1"><Clock className="w-3.5 h-3.5 shrink-0" /> {res.time}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Table / Guests</span>
                        <span className="text-[#0f172a]">T{res.tableNumber} • {res.guestCount} Pax</span>
                      </div>
                    </div>

                    {res.specialRequest && (
                      <div className="bg-[#fafafc] border border-[#f1f5f9] p-3 rounded-xl flex items-start gap-2 text-[11px] text-slate-600 font-medium">
                        <ShieldAlert className="w-4.5 h-4.5 text-purple-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{res.specialRequest}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Update Options */}
                  <div className="flex items-center gap-2 pt-2">
                    <select
                      value={res.status}
                      onChange={(e) => handleStatusChange(res.id, e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-[10.5px] font-black uppercase tracking-wider text-slate-700 focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
