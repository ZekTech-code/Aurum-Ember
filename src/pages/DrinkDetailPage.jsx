/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getDrinkById } from "../api/cocktailDb";
import { ShoppingCart, ShoppingBag, ArrowLeft, Wine, GlassWater } from "lucide-react";
import { useCart } from "../hooks/useCart";
import MealImage from "../components/MealImage";
import PageLayout from "../components/PageLayout";

function generatePrice(id) {
  const str = String(id ?? "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return Math.round((5 + (hash % 1200) / 100) * 100) / 100;
}

export default function DrinkDetailPage() {
  const { drinkId } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity } = useCart();

  const [loading, setLoading] = useState(true);
  const [drink, setDrink] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getDrinkById(drinkId)
      .then((d) => {
        if (!cancelled) setDrink(d);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load drink details.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [drinkId]);

  const price = useMemo(() => generatePrice(drinkId), [drinkId]);
  const inCart = cart.find((c) => c.id === drinkId);

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

  if (error || !drink) {
    return (
      <PageLayout className="text-center py-10">
        <p className="text-lg mb-4">{error || 'Drink not found'}</p>
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
            .drink-detail-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
            .drink-detail-grid section { order: 1; }
            .drink-detail-grid aside { order: 2; padding: 16px !important; }
          }
        `}</style>
        <button onClick={() => navigate(-1)} style={{ marginBottom: 18, padding: '8px 14px', borderRadius: 999, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="drink-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 28, alignItems: 'start' }}>
          <section>
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <MealImage
                name={drink.name}
                image={drink.image}
                category="Drinks"
                style={{ width: '100%', height: 420, objectFit: 'cover' }}
              />
            </div>
          </section>

          <aside style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: 24 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-gold)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Wine size={12} /> {drink.category}
              </span>
              <span style={{ padding: '2px 10px', borderRadius: 20, background: drink.alcoholic === 'Alcoholic' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: drink.alcoholic === 'Alcoholic' ? '#ef4444' : '#22c55e', fontSize: 11, fontWeight: 700 }}>
                {drink.alcoholic}
              </span>
            </div>

            <h1 style={{ fontSize: 30, margin: '8px 0' }}>{drink.name}</h1>

            {drink.glass && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                <GlassWater size={14} /> Served in: {drink.glass}
              </div>
            )}

            {drink.tags && drink.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {drink.tags.map(tag => (
                  <span key={tag} style={{ padding: '2px 10px', borderRadius: 20, background: 'var(--bg-secondary)', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {drink.instructions}
            </p>

            <div style={{ fontSize: 26, fontWeight: 800, margin: '18px 0', color: 'var(--brand-gold)' }}>
              ${price.toLocaleString('en-US')}
            </div>

            {drink.ingredients && drink.ingredients.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Ingredients</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  {drink.ingredients.map((ing, i) => (
                    <span key={i} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ing}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
              {inCart ? (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 14, alignItems: 'center' }}>
                  <button onClick={() => updateQuantity?.(drinkId, inCart.quantity - 1)} style={{ padding: '6px 12px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>-</button>
                  <span>{inCart.quantity}</span>
                  <button onClick={() => updateQuantity?.(drinkId, inCart.quantity + 1)} style={{ padding: '6px 12px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>+</button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart?.({ id: drinkId, name: drink.name, image: drink.image, price, category: 'Drinks' })}
                  style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '12px', borderRadius: 10, border: '1px solid var(--brand-gold)', background: 'transparent', color: 'var(--brand-gold)', cursor: 'pointer' }}
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>
              )}
              <button
                onClick={() => {
                  if (!inCart) addToCart?.({ id: drinkId, name: drink.name, image: drink.image, price, category: 'Drinks' });
                  navigate("/checkout");
                }}
                style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '12px', borderRadius: 10, border: 'none', background: 'var(--brand-gold)', color: '#fff', cursor: 'pointer' }}
              >
                <ShoppingBag size={16} />
                Order Now
              </button>
            </div>

            <Link to="/menu" style={{ display: 'block', marginTop: 18, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
              ← Continue browsing
            </Link>
          </aside>
        </div>
      </div>
    </PageLayout>
  );
}
