/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getMealById } from "../api/mealDb";
import { ShoppingCart, ShoppingBag, ArrowLeft, Clock, Globe } from "lucide-react";
import { useCart } from "../hooks/useCart";
import MealImage from "../components/MealImage";
import PageLayout from "../components/PageLayout";

function generatePrice(id) {
  const str = String(id ?? "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return Math.round((8 + (hash % 3500) / 100) * 100) / 100;
}

export default function MenuItemPage() {
  const { mealId } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity } = useCart();

  const [meal, setMeal] = useState(null);
  const [error, setError] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [mealId]);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    getMealById(mealId)
      .then((m) => {
        if (!cancelled) setMeal(m);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load meal details.");
      });

    return () => { cancelled = true; };
  }, [mealId]);

  const price = useMemo(() => generatePrice(mealId), [mealId]);
  const inCart = cart.find((c) => c.id === mealId);

  const name = meal?.name || "Loading...";
  const category = meal?.category || "";
  const area = meal?.area || "";
  const instructions = meal?.instructions || "";
  const tags = meal?.tags || [];
  const ingredients = meal?.ingredients || [];
  const image = meal?.image || "";
  const youtube = meal?.youtube || "";

  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.21, 0.6, 0.35, 1] }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 60px' }}>
          <button onClick={() => navigate(-1)} style={{ marginBottom: 18, padding: '8px 14px', borderRadius: 999, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} /> Back
          </button>

          {error && !meal && (
            <div className="text-center py-10">
              <p className="text-lg mb-4">{error}</p>
              <Link to="/menu" style={{ display: 'inline-block', marginTop: 10, padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 8, textDecoration: 'none' }}>
                Back to menu
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-7 items-stretch">
            <section>
              <div
                style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)', position: 'relative', cursor: image ? 'zoom-in' : 'default', height: 420 }}
                onClick={() => image && setIsZoomed(true)}
              >
                <MealImage
                  name={name}
                  image={image}
                  category={category}
                  style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
                />
              </div>
            </section>

            <aside className="no-scrollbar" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: 24, height: 420, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-gold)', textTransform: 'uppercase' }}>
                  {category}
                </span>
                {area && (
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Globe size={12} /> {area}
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: 30, margin: '8px 0' }}>{name}</h1>

              {tags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {tags.map(tag => (
                    <span key={tag} style={{ padding: '2px 10px', borderRadius: 20, background: 'var(--bg-secondary)', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {instructions ? instructions.substring(0, 300) + '...' : ''}
              </p>

              <div style={{ fontSize: 26, fontWeight: 800, margin: '18px 0', color: 'var(--brand-gold)' }}>
                ${price.toLocaleString('en-US')}
              </div>

              {ingredients.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Ingredients</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                    {ingredients.slice(0, 10).map((ing, i) => (
                      <span key={i} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ing}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
                {inCart ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 14, alignItems: 'center' }}>
                      <button onClick={() => updateQuantity?.(mealId, inCart.quantity - 1)} style={{ padding: '6px 12px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>-</button>
                      <span>{inCart.quantity}</span>
                      <button onClick={() => updateQuantity?.(mealId, inCart.quantity + 1)} style={{ padding: '6px 12px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>+</button>
                    </div>
                    <Link to="/cart" style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '12px', borderRadius: 10, textDecoration: 'none', background: 'var(--brand-gold)', color: '#fff', fontWeight: 700 }}>
                      <ShoppingBag size={16} />
                      View Cart
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={() => meal && addToCart?.({ id: mealId, name: meal.name, image: meal.image, price })}
                    style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '12px', borderRadius: 10, border: '1px solid var(--brand-gold)', background: 'var(--brand-gold)', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                )}
              </div>

              {youtube && (
                <a href={youtube} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, padding: '10px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'none', fontSize: 13 }}>
                  <Clock size={14} /> Watch Video
                </a>
              )}

              <Link to="/menu" style={{ display: 'block', marginTop: 18, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                ← Continue browsing
              </Link>
            </aside>
          </div>
        </div>

        {isZoomed && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'zoom-out', padding: 40 }}
            onClick={() => setIsZoomed(false)}
          >
            <MealImage name={name} image={image} category={category} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, boxShadow: '0 8px 60px rgba(0,0,0,0.5)' }} />
            <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', color: '#fff', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, pointerEvents: 'none' }}>
              ×
            </div>
          </div>
        )}
      </motion.div>
    </PageLayout>
  );
}
