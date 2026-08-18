import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section
      id="about"
      className="py-24 px-6 md:px-12 lg:px-20 overflow-hidden"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            About Us
          </h2>

          <p
            className="text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Discover the passion, people, and philosophy behind every dish we serve.
          </p>

          {/* Accent line */}
          <div
            className="w-20 h-0.75 mx-auto mt-6 rounded-full"
            style={{ background: "var(--brand-gold)" }}
          />
        </motion.div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          {/* Images */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="relative overflow-hidden rounded-2xl">
              <motion.img
                initial={{ opacity: 0, scale: 1.1 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                src="/images/hero_salmon.png"
                alt="Restaurant interior"
                className="rounded-2xl object-cover h-64 w-full"
                loading="lazy"
              />
            </div>
            <div className="relative mt-12 overflow-hidden rounded-2xl">
              <motion.img
                initial={{ opacity: 0, scale: 1.1 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                src="/images/suya_platter.png"
                alt="Chef cooking"
                className="rounded-2xl object-cover h-64 w-full"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-(--brand-gold) mb-4 block">Our Heritage</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">
              A Legacy of <span className="font-serif italic font-normal text-(--brand-gold)">Excellence</span> & Taste
            </h2>

            <div className="space-y-6 text-(--text-secondary) leading-relaxed">
              <p>
                At <span className="text-(--brand-gold) font-semibold">Aurum & Ember</span>, 
                we believe dining is more than just food — it’s a sensory narrative. 
                Born from a passion for bold fire-cooking and elegant presentation, 
                our restaurant blends modern culinary artistry with timeless hospitality.
              </p>

              <p>
                Every dish is crafted with intention, using the finest locally-sourced 
                ingredients to create unforgettable moments — whether it’s an intimate 
                candlelit dinner or a grand celebratory feast.
              </p>
            </div>

            {/* Chef Highlight */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-10 p-8 rounded-3xl border border-(--border) bg-(--bg-card) shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-(--brand-gold)/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-px bg-(--brand-gold)" />
                Meet Our Visionary
              </h3>

              <p className="text-sm text-(--text-muted) leading-relaxed italic">
                "Led by award-winning Chef Daniel Reyes, our kitchen is driven by
                innovation, precision, and passion. With over a decade of global
                culinary experience, every plate is designed to tell a unique story."
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;