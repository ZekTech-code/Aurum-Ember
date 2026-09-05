import "../styles/Contact.css";

const Contact = () => {
  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="contact-header">
          <h2>Contact Us</h2>
          <p>We’d love to hear from you.</p>
        </div>

        <div className="contact-content">
          {/* Info */}
          <div className="contact-info">
            <div className="info-item">
              <h4>Address</h4>
              <p>123 Restaurant Street, Abuja</p>
            </div>

            <div className="info-item">
              <h4>Phone</h4>
              <p><a href="tel:+2348001234567">+234 800 123 4567</a></p>
            </div>

            <div className="info-item">
              <h4>Email</h4>
              <p><a href="mailto:info@yourrestaurant.com">info@yourrestaurant.com</a></p>
            </div>
          </div>

          {/* Map */}
          <div className="contact-map">
            <iframe
              title="map"
              src="https://www.google.com/maps?q=Abuja,Nigeria&output=embed"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;