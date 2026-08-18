import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Utensils } from "lucide-react";

const backgrounds = [
  "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
  "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
  "https://images.pexels.com/photos/262897/pexels-photo-262897.jpeg",
  "https://images.pexels.com/photos/2092897/pexels-photo-2092897.jpeg",
  "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg",
  "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg",
];

export default function HomePage() {
  const [activeBg, setActiveBg] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveBg((prev) => (prev + 1) % backgrounds.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      className="relative w-full min-h-150 lg:min-h-170 xl:min-h-185 overflow-hidden rounded-lg mx-auto pt-23 md:pt-24 lg:pt-25"
      style={{ marginTop: 'calc(-1 * (var(--navbar-height, 76px) + 24px))' }}
    >
      <div className="relative w-full h-full min-h-[inherit] overflow-hidden rounded-lg">
        {/* ── Background Layers ── */}
        {backgrounds.map((bg, i) => (
          <div
            key={bg}
            className="absolute inset-0 transition-opacity duration-1500 ease-in-out pointer-events-none"
            style={{ opacity: i === activeBg ? 1 : 0 }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          </div>
        ))}

        {/* ── Overlays ── */}
        <div className="absolute inset-0 z-2 bg-black/50 dark:bg-black/70 transition-colors duration-500" />
        <div className="absolute inset-0 z-2 bg-linear-to-r from-black/80 via-black/40 to-transparent" />

        {/* ── Content ── */}
        <div
          className="relative z-10 mx-auto h-full flex items-center"
          style={{
            maxWidth: "80rem",
            paddingInline: "clamp(1.5rem, 5vw, 5rem)",
            minHeight: "inherit",
          }}
        >
          <div className="w-full py-16 md:py-20 text-center md:text-left">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 mb-4 md:mb-5 px-4 md:px-5 py-2 rounded-full border border-yellow-400/30 bg-yellow-500/10 text-yellow-400 text-[10px] md:text-xs uppercase tracking-[0.25em] font-bold backdrop-blur-sm"
            >
              <Utensils size={14} />
              Best Restaurant Experience
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] text-white max-w-3xl mx-auto md:mx-0"
            >
              Delicious Food
              <br />
              <span className="text-yellow-400">Delivered Fresh</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-4 md:mt-6 max-w-md md:max-w-lg lg:max-w-xl text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed mx-auto md:mx-0"
            >
              Savor premium meals crafted with passion, served straight to your
              table from kitchens around the world.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            >
              <Link
                to="/menu"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 md:px-8 md:py-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full font-bold uppercase tracking-wider transition-all duration-300 shadow-2xl hover:scale-105 hover:shadow-yellow-500/25 text-sm md:text-base"
              >
                Order Now
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
              <a
                href="#menu"
                className="inline-flex items-center justify-center px-7 py-3.5 md:px-8 md:py-4 border border-white/20 hover:border-yellow-400 text-white hover:text-yellow-400 rounded-full font-bold uppercase tracking-wider transition-all duration-300 backdrop-blur-sm text-sm md:text-base"
              >
                Explore Menu
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
