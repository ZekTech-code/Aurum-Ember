/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Loader2,
  ChevronRight,
  Utensils,
  Wine,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { searchMeals } from "../api/mealDb";
import { searchDrinks } from "../api/cocktailDb";

function generatePrice(id) {
  const str = String(id ?? "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return Math.round(((str.startsWith('d') ? 5 : 8) + (hash % 2500) / 100) * 100) / 100;
}

function SmartSearchBar({ placeholder = "Search for dishes, drinks...", className = "" }) {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [meals, setMeals] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setMeals([]);
      setDrinks([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const [mealResults, drinkResults] = await Promise.allSettled([
          searchMeals(query.trim()),
          searchDrinks(query.trim()),
        ]);

        setMeals(
          (mealResults.status === 'fulfilled' ? mealResults.value : [])
            .slice(0, 4)
            .map(m => ({ ...m, type: 'meal' }))
        );
        setDrinks(
          (drinkResults.status === 'fulfilled' ? drinkResults.value : [])
            .slice(0, 3)
            .map(d => ({ ...d, type: 'drink' }))
        );
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch {
        setMeals([]);
        setDrinks([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const allSuggestions = [...meals, ...drinks];

  function handleSelect(item) {
    setQuery("");
    setIsOpen(false);
    if (item.type === 'drink') {
      navigate(`/drink/${item.id}`);
    } else {
      navigate(`/menu/${item.id}`);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    navigate(`/search?query=${encodeURIComponent(query.trim())}`);
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => prev < allSuggestions.length - 1 ? prev + 1 : prev);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
        e.preventDefault();
        handleSelect(allSuggestions[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }

  function highlightMatch(text, highlight) {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="text-(--brand-gold) font-bold">{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  }

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <form onSubmit={handleSearchSubmit} className="relative z-1001">
        <div className={`flex items-center gap-3 px-4 py-2.5 transition-all duration-300 rounded-full border ${
          isFocused
            ? "bg-(--bg-card) border-(--brand-gold) shadow-xl ring-4 ring-(--brand-gold)/10"
            : "bg-(--bg-secondary) border-(--border) hover:border-(--brand-gold)/50"
        }`}>
          <motion.div
            animate={{ rotate: isFocused ? 90 : 0, scale: isFocused ? 1.1 : 1, color: isFocused ? "var(--brand-gold)" : "currentColor" }}
            className="shrink-0 text-gray-400 dark:text-white/40"
          >
            <Search size={18} strokeWidth={2.5} />
          </motion.div>

          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => { setIsFocused(true); if (query.length > 1) setIsOpen(true); }}
            onBlur={() => setIsFocused(false)}
            className="w-full bg-transparent border-none outline-none text-[14px] font-semibold placeholder-(--text-muted)"
          />

          <div className="flex items-center gap-2">
            <AnimatePresence>
              {isLoading && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                  <Loader2 size={16} className="animate-spin text-accent" />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {query && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => { setQuery(""); setMeals([]); setDrinks([]); setIsOpen(false); }}
                  className="p-1 rounded-full bg-(--bg-secondary) text-(--text-muted) hover:text-rose-500 transition-colors"
                >
                  <X size={14} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </form>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, x: "-50%", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: 10, x: "-50%", scale: 0.95 }}
            className="absolute top-full left-1/2 mt-4 w-[calc(100vw-2rem)] md:w-137.5 bg-(--bg-card) border border-(--border) rounded-4xl shadow-(--shadow) z-10000 overflow-hidden backdrop-blur-2xl"
          >
            <div className="max-h-[75vh] md:max-h-125 overflow-y-auto custom-scrollbar">
              {allSuggestions.length > 0 ? (
                <div className="py-4">
                  <div className="px-7 py-3 flex justify-between items-center border-b border-gray-50 dark:border-white/5 mb-2">
                    <span className="text-[10px] font-black text-(--text-muted) uppercase tracking-[0.3em]">Results</span>
                    <span className="text-[9px] font-black bg-(--brand-gold)/10 text-(--brand-gold) px-2 py-0.5 rounded-full uppercase tracking-widest">
                      {allSuggestions.length} Found
                    </span>
                  </div>

                  <div className="px-2">
                    {allSuggestions.map((item, index) => {
                      const isDrink = item.type === 'drink';

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`w-full flex items-center gap-5 px-5 py-4 text-left transition-all rounded-2xl group ${
                            selectedIndex === index ? "bg-(--bg-secondary)" : "bg-transparent"
                          }`}
                        >
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-(--bg-secondary) shrink-0 border border-(--border) shadow-md group-hover:scale-105 transition-transform duration-500">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center gap-2">
                                <p className={`text-[16px] font-black truncate tracking-tight ${
                                  selectedIndex === index ? "text-(--brand-gold)" : "text-(--text-primary)"
                                }`}>
                                  {highlightMatch(item.name, query)}
                                </p>
                                {isDrink && <Wine size={12} className="text-blue-400 shrink-0" />}
                              </div>
                              <span className="text-[15px] font-black text-(--brand-gold) ml-3 tracking-tighter">
                                ${generatePrice(item.id).toLocaleString('en-US')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                                isDrink ? 'bg-blue-500/10 text-blue-500' : 'bg-(--bg-primary) text-(--text-muted)'
                              }`}>
                                {isDrink ? 'Drink' : item.category || 'Meal'}
                              </span>
                            </div>
                          </div>

                          <ChevronRight size={18} className={`transition-all ${
                            selectedIndex === index ? "translate-x-1 text-(--brand-gold)" : "text-(--text-muted)"
                          }`} />
                        </button>
                      );
                    })}
                  </div>

                  <div className="px-7 py-4 mt-3 border-t border-gray-50 dark:border-white/5">
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full py-4 bg-(--bg-secondary) rounded-2xl text-[11px] font-black text-(--text-primary) hover:bg-(--brand-gold) hover:text-white transition-all text-center uppercase tracking-[0.3em] shadow-sm hover:shadow-xl hover:shadow-(--brand-gold)/20"
                    >
                      Explore All Results for "{query}"
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center px-10">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 bg-(--bg-secondary) rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-(--text-muted)"
                  >
                    <Utensils size={32} strokeWidth={1} />
                  </motion.div>
                  <h4 className="text-lg font-black text-(--text-primary) uppercase tracking-tight">No Flavors Found</h4>
                  <p className="text-[11px] text-(--text-muted) mt-2 uppercase tracking-[0.2em] font-bold">
                    Try searching for a different dish or drink
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SmartSearchBar;
