import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Eye, ShoppingCart, Star, Heart, } from "lucide-react";
import { useCart } from "../hooks/useCart";
import MealImage from "./MealImage";
import "../styles/menu.css";

/* ── Skeleton ── */
function SkeletonCard() {
  return (
    <div className="mn-skeleton">
      <div className="mn-sk-image" />
      <div className="mn-sk-body">
        <div className="mn-sk-badge" />
        <div className="mn-sk-title" />
        <div className="mn-sk-text" />
        <div className="mn-sk-footer" />
      </div>
    </div>
  );
}

/* ── Price generator ── */
function generatePrice(id) {
  const s = String(id ?? "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return Math.round((8 + (h % 3500) / 100) * 100) / 100;
}

/* ── Stars ── */
function Stars() {
  return (
    <span className="mn-stars" aria-label="5 out of 5 stars">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={12} fill="var(--brand-gold)" stroke="var(--brand-gold)" />
      ))}
      <span className="mn-stars-num">5.0</span>
    </span>
  );
}

/* ── Menu Card ── */
function MenuCard({ id, name, category, image, description }) {
  const { cart, addToCart, updateQuantity } = useCart();
  const [liked, setLiked] = useState(false);
  const cartItem = useMemo(() => cart.find((c) => c.id === id), [cart, id]);
  const price = useMemo(() => generatePrice(id), [id]);
  const isDrink = category === 'Drinks';
  const detailPath = isDrink ? `/drink/${id}` : `/menu/${id}`;

  const shortDesc = useMemo(() => {
    if (!description) return "Freshly prepared by our chefs.";
    const w = description.split(" ");
    return w.length > 14 ? w.slice(0, 14).join(" ") + "..." : description;
  }, [description]);

  return (
    <article className="mn-card">
      {/* ── Image ── */}
      <div className="mn-card-img">
        <MealImage name={name} image={image} category={category} className="mn-card-photo" />
        <Link to={detailPath} className="mn-img-link" aria-label={`View ${name} details`} />
        <span className="mn-card-badge">{category}</span>
        <button
          className={`mn-fav ${liked ? "active" : ""}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
          aria-label={liked ? "Remove from favourites" : "Add to favourites"}
        >
          <Heart size={15} fill={liked ? "var(--brand-gold)" : "none"} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="mn-card-body">
        <div className="mn-card-top">
          <h3 className="mn-card-name">
            <Link to={detailPath}>{name}</Link>
          </h3>
          <Stars />
        </div>
        <p className="mn-card-desc">{shortDesc}</p>
      </div>

      {/* ── Footer ── */}
      <div className="mn-card-foot">
        <span className="mn-card-price">${price.toLocaleString('en-US')}</span>
        <div className="mn-card-btns">
          <Link to={detailPath} className="mn-btn mn-btn-outline">
            <Eye size={14} />
            View Details
          </Link>
          {cartItem ? (
            <div className="mn-qty">
              <button className="mn-qty-btn" onClick={() => updateQuantity(id, cartItem.quantity - 1)} aria-label="Decrease quantity">−</button>
              <span className="mn-qty-num">{cartItem.quantity}</span>
              <button className="mn-qty-btn" onClick={() => updateQuantity(id, cartItem.quantity + 1)} aria-label="Increase quantity">+</button>
            </div>
          ) : (
            <button className="mn-btn mn-btn-gold" onClick={() => addToCart({ id, name, image, price })} aria-label={`Add ${name} to cart`}>
              <ShoppingCart size={14} />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* ── Fixed Categories ── */
const FIXED_CATEGORIES = ["All", "Meals", "Drinks", "Desserts", "Seafood", "Vegetarian"];

/* ── Category mapping ── */
const MEAL_CATEGORIES = ['beef', 'chicken', 'seafood', 'pasta', 'vegetarian', 'dessert', 'desserts', 'goat', 'breakfast', 'lamb', 'miscellaneous', 'pork', 'side', 'starter', 'vegan'];

function matchCategory(item, cat) {
  if (cat === "All") return true;
  const c = (item.category || "").toLowerCase();
  switch (cat) {
    case "Meals":
      return MEAL_CATEGORIES.includes(c);
    case "Drinks":
      return c === "drinks" || c === "ordinary drink" || c === "cocktail" || c === "beer" || c === "shot" || c.includes("drink");
    case "Desserts":
      return c === "dessert" || c === "desserts";
    case "Seafood":
      return c === "seafood";
    case "Vegetarian":
      return c === "vegetarian" || c === "vegan" || c === "goat";
    default:
      return true;
  }
}

/* ── Main Menu ── */
export default function Menu({ mode = "home" }) {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/meals/external-menu");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        if (!cancelled) setAllItems(data.items || []);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Failed to load menu. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return allItems.filter((item) => matchCategory(item, selectedCategory));
  }, [allItems, selectedCategory]);

  return (
    <section className="mn-section" id={mode === "home" ? "menu" : undefined}>
      <div className="mn-container">

        {/* ── Header ── */}
        <div className="mn-header">
          <span className="mn-kicker">OUR MENU</span>
          <h2 className="mn-heading">Chef's Selections</h2>
          <p className="mn-subtitle">
            Discover handcrafted meals and refreshing drinks prepared with premium ingredients.
          </p>
        </div>

        {/* ── Categories ── */}
        {!loading && !error && (
          <div className="mn-cats">
            {FIXED_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`mn-cat ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => { setSelectedCategory(cat); setVisibleCount(12); }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="mn-error">
            <p>{error}</p>
            <button className="mn-retry" onClick={() => { setLoading(true); setError(null); }}>
              Try Again
            </button>
          </div>
        )}

        {/* ── Skeleton ── */}
        {loading && (
          <div className="mn-grid">
            {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Grid ── */}
        {!loading && !error && (
          <>
            <div className="mn-grid">
              {(mode === "home" ? filtered.slice(0, 12) : filtered.slice(0, visibleCount)).map((item) => (
                <MenuCard key={item.id} {...item} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="mn-empty">
                <p>No items found in this category.</p>
              </div>
            )}

            <div className="mn-load-more">
              {mode === "home" ? (
                <Link to="/menu" className="mn-load-btn">Explore Full Menu</Link>
              ) : (
                visibleCount < filtered.length && (
                  <button className="mn-load-btn" onClick={() => setVisibleCount((p) => p + 12)}>
                    Load More
                  </button>
                )
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
