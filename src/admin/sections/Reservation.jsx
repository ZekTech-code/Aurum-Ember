import { useState, useEffect } from 'react';
import { 
  Calendar, Users, Clock, MapPin, 
  CheckCircle, XCircle, MoreVertical, 
  ArrowRight, Search, Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

const Reservation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = sessionStorage.getItem('ae-admin-token');
        const res = await fetch('/api/reservations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setReservations(Array.isArray(data) ? data : (data.reservations || []));
      } catch (e) {
        console.error("Reservation fetch error:", e);
      }
    };
    fetchReservations();
  }, []);

  const updateStatus = (id, newStatus) => {
    const updated = reservations.map(res => res.id === id ? { ...res, status: newStatus } : res);
    setReservations(updated);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-admin-text">Reservations</h1>
          <p className="text-gray-500">Manage table bookings and guest schedules.</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="admin-panel p-6 border-l-4 border-orange-500">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Today's Bookings</p>
          <h3 className="text-2xl font-black text-admin-text">
            {reservations.filter(r => r.date === new Date().toISOString().split('T')[0]).length}
          </h3>
        </div>
        <div className="admin-panel p-6 border-l-4 border-accent">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Total Bookings</p>
          <h3 className="text-2xl font-black text-admin-text">{reservations.length}</h3>
        </div>
        <div className="admin-panel p-6 border-l-4 border-amber-500">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Confirmed</p>
          <h3 className="text-2xl font-black text-admin-text">{reservations.filter(r => r.status === 'Confirmed').length}</h3>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input 
          type="text" 
          placeholder="Search by guest name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-admin-card border border-admin-border rounded-2xl outline-none focus:border-accent transition-all text-sm font-medium"
        />
      </div>

      {/* Reservations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reservations.length > 0 ? reservations
          .filter(res => res.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(res => (
          <div key={res.id} className="admin-panel p-6 flex items-center justify-between group">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-admin-bg flex flex-col items-center justify-center border border-admin-border">
                <span className="text-[10px] font-black text-accent uppercase">{res.date ? res.date.split('-')[1] : '--'}</span>
                <span className="text-xl font-black text-admin-text leading-none">{res.date ? res.date.split('-')[2] : '--'}</span>
              </div>
              <div>
                <h4 className="font-bold text-admin-text text-lg">{res.name}</h4>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 text-xs text-gray-500 font-bold">
                    <Users size={14} className="text-gray-600" /> {res.guests}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 font-bold">
                    <Clock size={14} className="text-gray-600" /> {res.time}
                  </div>
                </div>
                {res.requests && (
                  <p className="text-[10px] text-gray-500 mt-2 font-medium">"{res.requests}"</p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                res.status === 'Confirmed' ? 'bg-amber-500/10 text-amber-500' : 
                res.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-500' : 'bg-orange-500/10 text-orange-500'
              }`}>
                {res.status}
              </span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {res.status !== 'Confirmed' && (
                  <button 
                    onClick={() => updateStatus(res.id, 'Confirmed')}
                    className="p-2 bg-amber-500/10 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
                {res.status !== 'Cancelled' && (
                  <button 
                    onClick={() => updateStatus(res.id, 'Cancelled')}
                    className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center admin-panel border-dashed">
             <Calendar size={48} className="mx-auto text-gray-600 mb-4 opacity-20" />
             <p className="text-gray-500 font-bold">No reservations found.</p>
             <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">Bookings from the website will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservation;
