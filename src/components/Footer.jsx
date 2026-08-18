import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <motion.footer 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full bg-(--bg-secondary) text-(--text-secondary) pt-16 pb-8 px-6"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-semibold text-(--text-primary) mb-4">
            Aurum & Ember
          </h2>
          <p className="text-sm leading-relaxed">
            Experience fine dining with a blend of modern and traditional
            flavors crafted to perfection.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-(--text-primary) mb-4">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-(--brand-gold) transition">Home</Link></li>
            <li><Link to="/#menu" className="hover:text-(--brand-gold) transition">Menu</Link></li>
            <li><Link to="/gallery" className="hover:text-(--brand-gold) transition">Gallery</Link></li>
            <li><Link to="/#about" className="hover:text-(--brand-gold) transition">About</Link></li>
            <li><Link to="/reserve" className="hover:text-(--brand-gold) transition font-medium text-(--brand-gold)">Reserve a Table</Link></li>
            <li><Link to="/#contact" className="hover:text-(--brand-gold) transition">Contact</Link></li>


          </ul>
        </div>

        {/* Opening Hours */}
        <div>
          <h3 className="text-lg font-semibold text-(--text-primary) mb-4">
            Opening Hours
          </h3>
          <ul className="text-sm space-y-2">
            <li>Mon - Fri: 10:00 AM - 10:00 PM</li>
            <li>Saturday: 12:00 PM - 11:00 PM</li>
            <li>Sunday: Closed</li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-(--text-primary) mb-4">
            Follow Us
          </h3>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-(--bg-card) shadow hover:bg-(--brand-gold) hover:text-white transition">
              <FaFacebookF />
            </a>
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-(--bg-card) shadow hover:bg-(--brand-gold) hover:text-white transition">
              <FaInstagram />
            </a>
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-(--bg-card) shadow hover:bg-(--brand-gold) hover:text-white transition">
              <FaTwitter />
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-(--border) mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-(--text-muted)">
        <p>© {new Date().getFullYear()} Aurum & Ember. All rights reserved.</p>
      </div>
    </motion.footer>
  );
}
