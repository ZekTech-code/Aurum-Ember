import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, Heart, Star, ShoppingBag, Eye } from "lucide-react";
import MealImage from "./MealImage";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export default function MealCard({ 
  item, 
  cartItem, 
  isFavorite, 
  toggleFavorite, 
  onAddToCart, 
  onUpdateQuantity,
  variants 
}) {
  const renderCartControls = (isHoverState = false) => {
    if (cartItem) {
      return (
        <div className={`flex items-center rounded-2xl p-1 shadow-inner ${isHoverState ? 'bg-white/20' : 'bg-(--bg-secondary)'}`}>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUpdateQuantity?.(item.id || item._id, cartItem.quantity - 1); }} 
            className={`p-1.5 rounded-xl transition-colors ${isHoverState ? 'hover:bg-white/30 text-white' : 'hover:bg-(--bg-card) text-(--text-secondary)'}`}
          >
            <Minus size={14} />
          </button>
          <span className={`w-8 text-center text-sm font-bold ${isHoverState ? 'text-white' : 'text-(--text-primary)'}`}>
            {cartItem.quantity}
          </span>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUpdateQuantity?.(item.id || item._id, cartItem.quantity + 1); }} 
            className={`p-1.5 rounded-xl transition-colors ${isHoverState ? 'hover:bg-white/30 text-white' : 'hover:bg-(--bg-card) text-(--text-secondary)'}`}
          >
            <Plus size={14} />
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAddToCart?.({
            id: String(item.id || item._id),
            name: item.name,
            image: item.image,
            price: Number(item.price),
            category: item.category
          });
        }}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[12px] font-bold transition-all duration-300 transform active:scale-95 shadow-lg ${
          isHoverState 
            ? 'bg-(--brand-gold) hover:opacity-90 text-white shadow-(--brand-gold)/30' 
            : 'bg-(--brand-gold) hover:opacity-90 text-white shadow-lg'
        }`}
      >
        <ShoppingBag size={14} />
        Add
      </button>
    );
  };

  return (
    <motion.article
      layout
      variants={variants}
      className="relative group bg-(--bg-card) rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-shadow duration-500 border border-(--border) h-100 flex flex-col"
    >
      {/* Dynamic Image Background */}
      <div className="absolute top-0 left-0 right-0 h-[55%] group-hover:h-full transition-all duration-500 ease-in-out z-0 overflow-hidden">
        <MealImage
          name={item.name}
          image={item.image}
          category={item.category}
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-500 ease-in-out" />
      </div>

      {/* Top Badges & Favorite (Always Visible) */}
      <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-30 pointer-events-none">
        <div className="flex flex-col gap-2 transition-transform duration-500 ease-in-out group-hover:-translate-y-4 group-hover:opacity-0">
          {item.featured && (
            <span className="px-3 py-1 bg-(--brand-gold) rounded-xl text-[10px] font-bold uppercase tracking-wider text-white shadow-sm inline-block w-max">
              Chef's Special
            </span>
          )}
        </div>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite?.(item.id || item._id); }}
          className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg pointer-events-auto ${
            isFavorite 
              ? "bg-red-500 text-white" 
              : "bg-(--bg-card)/80 text-(--text-secondary) hover:bg-(--bg-primary) group-hover:bg-white/20 group-hover:text-white"
          }`}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Normal State Content (Bottom 45%) */}
      <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-(--bg-card) p-5 flex flex-col z-10 transition-all duration-500 ease-in-out group-hover:translate-y-full group-hover:opacity-0">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-(--text-primary) line-clamp-1 pr-2">
            {item.name}
          </h3>
          <div className="flex items-center gap-1 text-(--brand-gold) shrink-0 bg-(--brand-gold)/10 px-2 py-1 rounded-lg">
            <Star size={12} fill="currentColor" />
            <span className="text-xs font-bold">{item.rating || "5.0"}</span>
          </div>
        </div>
        
        <p className="text-(--text-secondary) text-sm line-clamp-2 mb-4 grow leading-relaxed">
          {item.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-(--border)">
          <span className="text-xl font-black text-(--text-primary)">
            {formatCurrency(item.price)}
          </span>
          {renderCartControls(false)}
        </div>
      </div>

      {/* Hover State Content (Glassmorphism Overlay) */}
      <Link 
        to={`/menu/${item.id || item._id}`}
        className="absolute inset-0 z-20 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out pointer-events-none group-hover:pointer-events-auto"
      >
        <div className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full font-bold shadow-2xl transition-all duration-300 transform scale-90 group-hover:scale-100">
          <Eye size={20} />
          <span>View Details</span>
        </div>
      </Link>

      {/* Hover State Cart Controls (Bottom) */}
      <div className="absolute bottom-5 left-5 right-5 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out pointer-events-none group-hover:pointer-events-auto translate-y-4 group-hover:translate-y-0">
         <div className="flex items-center justify-between bg-black/40 backdrop-blur-md border border-white/20 p-2 pl-4 rounded-3xl shadow-2xl">
            <div className="flex flex-col">
              <span className="text-white text-xs font-medium opacity-80 line-clamp-1">{item.name}</span>
              <span className="text-(--brand-gold) font-bold">{formatCurrency(item.price)}</span>
            </div>
            {renderCartControls(true)}
         </div>
      </div>

    </motion.article>
  );
}
