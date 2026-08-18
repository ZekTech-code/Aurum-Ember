import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSearch = ({ 
  placeholder = "Search anything...", 
  onSearch, 
  isLoading = false,
  className = "" 
}) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) onSearch(query);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <motion.div 
        animate={{ 
          scale: isFocused ? 1.02 : 1,
          boxShadow: isFocused 
            ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" 
            : "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        }}
        className={`
          relative flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 border
          ${isFocused 
            ? 'bg-gray-50/90 dark:bg-[#1E293B]/90 border-accent ring-4 ring-accent/10' 
            : 'bg-gray-100/50 dark:bg-white/5 border-accent/20 dark:border-accent/10 hover:border-accent/40 dark:hover:border-accent/30'
          }
        `}
      >
        {/* Search Icon */}
        <div className={`shrink-0 transition-colors duration-300 ${isFocused ? 'text-accent' : 'text-gray-400 dark:text-gray-500'}`}>
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none text-[13px] font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
        />

        {/* Clear Button */}
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all cursor-pointer"
            >
              <X size={14} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Animated Focus Ring Border (Subtle Glow) */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              layoutId="focus-ring"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-[-1px] rounded-2xl border border-accent/30 pointer-events-none z-10"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Keyboard Shortcut Hint (Optional Professional Touch) */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        {!query && !isFocused && (
          <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1E293B] text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
            <span className="text-[8px]">⌘</span>K
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSearch;
