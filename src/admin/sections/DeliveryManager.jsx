import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, Map, Navigation, 
  User, Phone, Star, 
  Package, CheckCircle, Clock, X,
  ChevronRight, ArrowRight
} from 'lucide-react';

const DeliveryManager = ({ orders, updateOrderStatus }) => {
  const [selectedRider, setSelectedRider] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  const [riders, setRiders] = useState([
    { id: 1, name: 'Alex Thompson', status: 'Active', activeDeliveries: 0, rating: 4.8, vehicle: 'E-Bike #12', avatar: null },
    { id: 2, name: 'Jordan Reed', status: 'In Transit', activeDeliveries: 0, rating: 4.9, vehicle: 'Scooter #08', avatar: null },
    { id: 3, name: 'Chris Evans', status: 'Offline', activeDeliveries: 0, rating: 4.7, vehicle: 'Motorcycle #04', avatar: null },
  ]);

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const token = sessionStorage.getItem('ae-admin-token');
        const res = await fetch('/api/riders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setRiders(data);
        else if (data.riders && data.riders.length > 0) setRiders(data.riders);
      } catch (e) {
        console.error("Failed to fetch riders:", e);
      }
    };
    fetchRiders();
  }, []);

  // Calculate real load for each rider from live orders
  const ridersWithLoad = riders.map(rider => ({
    ...rider,
    activeDeliveries: orders.filter(o => o.riderId === rider.id && o.status === 'delivering').length
  }));

  const assignOrderToRider = (orderId, rider) => {
    // Update the order with rider info and set status to delivering
    const orderToUpdate = orders.find(o => o._id === orderId);
    if (orderToUpdate) {
      updateOrderStatus(orderId, 'delivering', {
        riderId: rider.id,
        riderName: rider.name,
        riderAvatar: rider.avatar
      });
      setIsAssignModalOpen(false);
      setSelectedRider(null);
    }
  };

  const pendingAssignments = orders.filter(o => o.status === 'processing' || (o.status === 'awaiting' && !o.riderId));
  const activeShips = orders.filter(o => o.status === 'delivering').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-admin-text">Delivery Fleet</h1>
          <p className="text-gray-500">Track delivery riders and active logistics.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-admin-card p-4 rounded-2xl border border-admin-border flex items-center gap-3">
            <Package size={20} className="text-blue-500" />
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Ships</p>
              <p className="text-sm font-black text-admin-text">{activeShips} Parcels</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Riders List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-admin-text mb-6">Dispatch Center</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ridersWithLoad.map(rider => (
              <div key={rider.id} className="admin-panel p-6 border border-admin-border hover:border-accent/20 transition-all group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    {rider.avatar ? (
                      <img 
                        src={rider.avatar} 
                        alt={rider.name} 
                        className="w-14 h-14 rounded-full object-cover border-2 border-admin-card" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(rider.name)}&background=c5a059&color=000&bold=true`;
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full border border-admin-border flex items-center justify-center bg-admin-bg text-accent font-black">
                        {rider.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-4 border-admin-card ${rider.status === 'Offline' ? 'bg-gray-500' : 'bg-amber-500'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-admin-text">{rider.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{rider.status}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-500 uppercase">Vehicle</span>
                    <span className="text-admin-text">{rider.vehicle}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-500 uppercase">Rating</span>
                    <span className="text-yellow-500 flex items-center gap-1"><Star size={12} className="fill-yellow-500" /> {rider.rating}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-500 uppercase">Current Load</span>
                    <span className="text-accent font-black">{rider.activeDeliveries} Active</span>
                  </div>
                </div>

                <button 
                  onClick={() => { setSelectedRider(rider); setIsAssignModalOpen(true); }}
                  disabled={rider.status === 'Offline'}
                  className={`w-full mt-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                    rider.status === 'Offline' 
                    ? 'bg-admin-bg text-admin-text-muted cursor-not-allowed' 
                    : 'bg-accent/10 text-accent hover:bg-accent hover:text-white'
                  }`}
                >
                  {rider.status === 'Offline' ? 'Rider Offline' : 'Assign Delivery'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Status Map (Mock) */}
        <div className="admin-panel p-6 relative min-h-[400px] flex flex-col">
          <h2 className="text-xl font-bold text-admin-text mb-6">Live Map View</h2>
          <div className="flex-1 bg-admin-bg rounded-[2rem] relative overflow-hidden flex flex-col items-center justify-center border border-admin-border">
            <Map size={48} className="text-gray-700 mb-4 opacity-20" />
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Integrating Live Tracking...</p>
            
            {/* Mock Pointers */}
            <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-accent rounded-full animate-ping" />
            <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-accent rounded-full border-2 border-white" />
            
            <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-amber-500 rounded-full animate-ping" />
            <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-amber-500 rounded-full border-2 border-white" />
          </div>
          
           <div className="mt-6 space-y-3">
             <div className="flex items-center justify-between p-3 bg-admin-bg rounded-xl">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-accent" />
                 <span className="text-xs font-bold text-admin-text-muted">Order #20412</span>
               </div>
               <span className="text-[10px] font-black text-accent uppercase">3.2 km</span>
             </div>
             <div className="flex items-center justify-between p-3 bg-admin-bg rounded-xl">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-amber-500" />
                 <span className="text-xs font-bold text-gray-400">Order #20415</span>
               </div>
               <span className="text-[10px] font-black text-amber-500 uppercase">1.8 km</span>
             </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      <AnimatePresence>
        {isAssignModalOpen && selectedRider && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAssignModalOpen(false)}
              className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl z-[2001] p-1 bg-gradient-to-br from-accent/30 to-transparent rounded-[2.5rem]"
            >
              <div className="bg-admin-card p-10 rounded-[2.4rem] shadow-2xl overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-admin-text">Assign to {selectedRider.name}</h3>
                    <p className="text-[10px] text-admin-text-muted font-black uppercase tracking-widest">Select a pending order for dispatch</p>
                  </div>
                  <button onClick={() => setIsAssignModalOpen(false)} className="p-3 hover:bg-admin-bg rounded-2xl text-admin-text-muted transition-all cursor-pointer">
                    <X size={24} />
                  </button>
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar pr-2 space-y-4 mb-8">
                  {pendingAssignments.length > 0 ? pendingAssignments.map(order => (
                    <div 
                      key={order._id} 
                      onClick={() => assignOrderToRider(order._id, selectedRider)}
                      className="flex items-center justify-between p-5 bg-admin-bg/50 rounded-2xl hover:bg-accent/10 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-admin-bg rounded-xl flex items-center justify-center border border-admin-border">
                          <Package className="text-admin-text-muted group-hover:text-accent transition-colors" size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-admin-text">#{order._id}</p>
                          <p className="text-[10px] text-admin-text-muted font-black uppercase tracking-widest mt-1">{order.deliveryInfo?.fullName}</p>
                          <p className="text-[9px] text-gray-500 font-medium truncate max-w-[150px] mt-0.5">
                            {order.deliveryInfo?.address}, {order.deliveryInfo?.city}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-accent">${(Number(order.totalAmount) || 0).toLocaleString('en-US')}</p>
                        <div className="flex items-center gap-1 justify-end mt-1">
                           <Clock size={10} className="text-gray-600" />
                           <span className="text-[9px] text-gray-600 font-bold uppercase">{order.date}</span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center">
                       <Package size={48} className="mx-auto text-gray-700 mb-4 opacity-20" />
                       <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">No pending orders to assign</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setIsAssignModalOpen(false)}
                  className="w-full py-4 bg-admin-bg text-admin-text-muted rounded-2xl font-black text-xs uppercase tracking-widest border border-admin-border hover:bg-admin-border transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeliveryManager;
