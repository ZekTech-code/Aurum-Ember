import "../styles/events.css";

const EVENTS = [
  {
    title: "Chef's Tasting Night",
    date: "Every Thursday",
    time: "7:00 PM - 10:00 PM",
    description: "A seven-course guided tasting menu with curated wine pairings from our cellar.",
  },
  {
    title: "Live Jazz & Dinner",
    date: "Friday Evenings",
    time: "8:00 PM - 11:00 PM",
    description: "Refined dining ambiance with live jazz performance and signature cocktails.",
  },
  {
    title: "Private Celebration Service",
    date: "By Reservation",
    time: "Custom Schedule",
    description: "Birthdays, proposals, and corporate events with personalized menus and decor.",
  },
];

export default function Events() {
  return (
    <section className="events-section reveal-on-scroll" id="events">
      <div className="events-container">
        <div className="events-header">
          <p className="events-kicker">Curated Experiences</p>
          <h2 className="events-title">Events At Aurum & Ember</h2>
          <p className="events-subtitle">
            Beyond dining, we host elegant nights designed to create memorable moments.
          </p>
        </div>

        <div className="events-grid">
          {EVENTS.map((event) => (
            <article className="event-card" key={event.title}>
              <h3 className="event-title">{event.title}</h3>
              <p className="event-meta">{event.date}</p>
              <p className="event-meta">{event.time}</p>
              <p className="event-description">{event.description}</p>
              <a href="/reserve" className="event-cta">
                Reserve Your Spot
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
