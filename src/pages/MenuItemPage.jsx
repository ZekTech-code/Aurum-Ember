/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

  const [loading, setLoading] = useState(true);
  const [meal, setMeal] = useState(null);
  const [error, setError] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 50, y: 50 });
  const [showLens, setShowLens] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLensPos({ x, y });
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getMealById(mealId)
      .then((m) => {
        if (!cancelled) setMeal(m);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load meal details.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [mealId]);

  const price = useMemo(() => generatePrice(mealId), [mealId]);
  const inCart = cart.find((c) => c.id === mealId);

  if (loading) {
    return (
      <PageLayout className="text-center py-10">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-(--bg-secondary) rounded w-1/3 mb-6 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-(--bg-secondary) rounded-2xl" />
              <div className="space-y-4">
                <div className="h-6 bg-(--bg-secondary) rounded w-1/4" />
                <div className="h-10 bg-(--bg-secondary) rounded w-3/4" />
                <div className="h-20 bg-(--bg-secondary) rounded" />
                <div className="h-8 bg-(--bg-secondary) rounded w-1/3" />
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !meal) {
    return (
      <PageLayout className="text-center py-10">
        <p className="text-lg mb-4">{error || 'Item not found'}</p>
        <Link to="/menu" style={{ display: 'inline-block', marginTop: 10, padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 8, textDecoration: 'none' }}>
          Back to menu
        </Link>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 60px' }}>
        <style>{`
          @media (max-width: 640px) {
            .menu-detail-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
            .menu-detail-grid section { order: 1; }
            .menu-detail-grid aside { order: 2; padding: 16px !important; }
          }
        `}</style>
        <button onClick={() => navigate(-1)} style={{ marginBottom: 18, padding: '8px 14px', borderRadius: 999, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="menu-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 28, alignItems: 'start' }}>
          <section>
            <div
              style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)', position: 'relative', cursor: 'crosshair' }}
              onMouseEnter={() => setShowLens(true)}
              onMouseLeave={() => setShowLens(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setIsZoomed(true)}
            >
              <MealImage
                name={meal.name}
                image={meal.image}
                category={meal.category}
                style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
              />
              {showLens && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 10,
                  overflow: 'hidden',
                  borderRadius: 16,
                }}>
                  <div style={{
                    position: 'absolute',
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    border: '2px solid rgba(201,146,42,0.8)',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.2), 0 4px 20px rgba(0,0,0,0.3)',
                    left: `calc(${lensPos.x}% - 70px)`,
                    top: `calc(${lensPos.y}% - 70px)`,
                    backgroundImage: `url(${meal.image})`,
                    backgroundSize: `${420 * (420 / 140)}px auto`,
                    backgroundPosition: `${(lensPos.x / 100) * 420 * (420 / 140) - 70}px ${(lensPos.y / 100) * 420 * (420 / 140) - 70}px`,
                    zIndex: 11,
                    transition: 'left 0.05s ease-out, top 0.05s ease-out',
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> Hover to zoom · Click for full view
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: 24 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-gold)', textTransform: 'uppercase' }}>
                {meal.category}
              </span>
              {meal.area && (
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Globe size={12} /> {meal.area}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 30, margin: '8px 0' }}>{meal.name}</h1>

            {meal.tags && meal.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {meal.tags.map(tag => (
                  <span key={tag} style={{ padding: '2px 10px', borderRadius: 20, background: 'var(--bg-secondary)', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {meal.instructions ? meal.instructions.substring(0, 300) + '...' : ''}
            </p>

            <div style={{ fontSize: 26, fontWeight: 800, margin: '18px 0', color: 'var(--brand-gold)' }}>
              ${price.toLocaleString('en-US')}
            </div>

            {meal.ingredients && meal.ingredients.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Ingredients</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  {meal.ingredients.slice(0, 10).map((ing, i) => (
                    <span key={i} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ing}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
              {inCart ? (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 14, alignItems: 'center' }}>
                  <button onClick={() => updateQuantity?.(mealId, inCart.quantity - 1)} style={{ padding: '6px 12px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>-</button>
                  <span>{inCart.quantity}</span>
                  <button onClick={() => updateQuantity?.(mealId, inCart.quantity + 1)} style={{ padding: '6px 12px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>+</button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart?.({ id: mealId, name: meal.name, image: meal.image, price })}
                  style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '12px', borderRadius: 10, border: '1px solid var(--brand-gold)', background: 'transparent', color: 'var(--brand-gold)', cursor: 'pointer' }}
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>
              )}
              <button
                onClick={() => {
                  if (!inCart) addToCart?.({ id: mealId, name: meal.name, image: meal.image, price });
                  navigate("/checkout");
                }}
                style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '12px', borderRadius: 10, border: 'none', background: 'var(--brand-gold)', color: '#fff', cursor: 'pointer' }}
              >
                <ShoppingBag size={16} />
                Order Now
              </button>
            </div>

            {meal.youtube && (
              <a href={meal.youtube} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, padding: '10px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'none', fontSize: 13 }}>
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
          <MealImage name={meal.name} image={meal.image} category={meal.category} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, boxShadow: '0 8px 60px rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', color: '#fff', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, pointerEvents: 'none' }}>
            ×
          </div>
        </div>
      )}
    </PageLayout>
  );
}
