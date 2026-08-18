import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MealImage from "../components/MealImage";
import PageLayout from "../components/PageLayout";

function Gallery() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=');
        const json = await res.json();
        const list = Array.isArray(json.meals) ? json.meals : [];
        const mapped = list.map(m => ({
          _id: m.idMeal,
          name: m.strMeal,
          image: m.strMealThumb,
          category: m.strCategory || 'Meals',
          price: Math.round((8 + (parseInt(m.idMeal) % 3500) / 100) * 100) / 100,
        }));
        setMeals(mapped.slice(0, 200));
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  if (loading) {
    return (
      <PageLayout className="flex items-center justify-center">
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "55px", height: "55px", border: "4px solid var(--border)", borderTop: "4px solid var(--brand-gold)", borderRadius: "50%", margin: "0 auto 18px", animation: "spin 1s linear infinite" }} />
          <h2 style={{ fontSize: "18px", fontWeight: "600" }}>Loading Signature Meals...</h2>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
    <section style={{ padding: "0 24px 80px", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto 70px", textAlign: "center" }}>
        <span style={{ display: "inline-block", padding: "8px 18px", borderRadius: "999px", background: "rgba(201,146,42,0.12)", color: "var(--brand-gold)", fontSize: "13px", fontWeight: "600", marginBottom: "18px" }}>
          PREMIUM COLLECTION
        </span>
        <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: "800", marginBottom: "18px" }}>
          Signature Dining Experience
        </h1>
        <p style={{ maxWidth: "700px", margin: "0 auto", color: "var(--text-secondary)", lineHeight: "1.8" }}>
          Explore luxury meals crafted with flavor, elegance, and premium culinary artistry.
        </p>
      </div>

      <style>{`
        .gallery-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px; }
        @media (max-width: 1024px) { .gallery-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) { .gallery-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; } }
        @media (max-width: 480px) { .gallery-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } .gallery-grid > div > div:first-child { height: 160px !important; } }
      `}</style>
      <div className="gallery-grid" style={{ maxWidth: "1300px", margin: "0 auto" }}>
        {meals.slice(0, Math.floor(meals.length / 4) * 4).map((meal) => (
          <div
            key={meal._id}
            onClick={() => navigate(`/menu/${meal._id}`)}
            style={{ position: "relative", borderRadius: "16px", overflow: "hidden", cursor: "pointer", background: "var(--bg-card)", border: "1px solid var(--border)", transition: "0.4s ease", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-10px)"; e.currentTarget.style.boxShadow = "0 20px 45px rgba(0,0,0,0.16)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.08)"; }}
          >
            <div style={{ height: "260px", overflow: "hidden", position: "relative" }}>
              <MealImage
                name={meal.name}
                image={meal.image}
                category={meal.category}
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.78), transparent)" }} />
              <div style={{ position: "absolute", bottom: "20px", left: "20px", right: "20px", color: "#fff" }}>
                <h2 style={{ fontSize: "clamp(12px, 3vw, 20px)", fontWeight: "700", marginBottom: "10px", lineHeight: "1.3" }}>{meal.name}</h2>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ fontSize: "13px", opacity: 0.9 }}>${Number(meal.price || 0).toLocaleString('en-US')}</p>
                  <span style={{ fontSize: "24px" }}>→</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
    </PageLayout>
  );
}

export default Gallery;
