import { useEffect, useRef } from "react";
import "../styles/Testimonials.css";

const testimonials = [
  {
    name: "Amara Okeke",
    quote:
      "Absolutely the best dining experience I've had in Abuja. The flavors are unforgettable and the service is top-tier.",
  },
  {
    name: "Daniel Musa",
    quote:
      "From the ambiance to the food presentation, everything felt luxurious. Highly recommend for special occasions.",
  },
  {
    name: "Fatima Bello",
    quote:
      "The meals were fresh, rich, and beautifully served. I’ll definitely be coming back with friends.",
  },
];

const Testimonials = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const headerElements = sectionRef.current?.querySelectorAll(".testimonials-title, .testimonials-subtitle");
    const cards = sectionRef.current?.querySelectorAll(".testimonial-card");
    if ((!cards || cards.length === 0) && (!headerElements || headerElements.length === 0)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          } else {
            entry.target.classList.remove("visible");
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
    );

    headerElements?.forEach((el) => observer.observe(el));
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="testimonials" ref={sectionRef}>
      <div className="testimonials-container">
        <h2 className="testimonials-title">What Our Guests Say</h2>
        <p className="testimonials-subtitle">
          Real experiences from people who love our food
        </p>

        <div className="testimonials-grid">
          {testimonials.map((item, index) => (
            <div className="testimonial-card" key={index} style={{ transitionDelay: `${index * 120}ms` }}>
              <p className="quote">“{item.quote}”</p>
              <h4 className="name">— {item.name}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;