import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { searchMeals } from '../api/mealDb';
import { searchDrinks } from '../api/cocktailDb';
import MealImage from './MealImage';
import PageLayout from './PageLayout';
import { useCart } from '../hooks/useCart';
import "../styles/searchMeals.css";

function generatePrice(id) {
  const s = String(id ?? "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return Math.round(((s.startsWith('d') ? 5 : 8) + (h % 2500) / 100) * 100) / 100;
}

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

function SkeletonGrid() {
  return (
    <div className="search-skeleton-grid">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="search-skeleton-card">
          <div className="search-skeleton-img" />
          <div className="search-skeleton-body">
            <div className="search-skeleton-line w-80" />
            <div className="search-skeleton-line w-60" />
            <div className="search-skeleton-line w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SearchMeals() {
  const [searchParams] = useSearchParams();
  const { cart, addToCart, updateQuantity } = useCart();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItem, setAddedItem] = useState(null);

  const query = searchParams.get('query') || '';

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!query.trim()) {
        if (!cancelled) { setResults([]); setLoading(false); }
        return;
      }

      setLoading(true);

      try {
        const [mealResults, drinkResults] = await Promise.allSettled([
          searchMeals(query),
          searchDrinks(query),
        ]);

        if (cancelled) return;

        const meals = (mealResults.status === 'fulfilled' ? mealResults.value : []).map(m => ({
          id: m.id,
          name: m.name,
          category: m.category || 'Meals',
          description: m.instructions ? m.instructions.substring(0, 120) + '...' : 'Chef\'s selection.',
          price: generatePrice(m.id),
          image: m.image,
          type: 'meal',
        }));

        const drinks = (drinkResults.status === 'fulfilled' ? drinkResults.value : []).map(d => ({
          id: d.id,
          name: d.name,
          category: d.category || 'Drinks',
          description: d.instructions ? d.instructions.substring(0, 120) + '...' : 'A refreshing beverage.',
          price: generatePrice(d.id),
          image: d.image,
          type: 'drink',
        }));

        setResults([...meals, ...drinks]);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [query]);

  const handleAddToCart = (item) => {
    addToCart(item);
    setAddedItem(item.id);
    setTimeout(() => setAddedItem(null), 2000);
  };

  const isEmpty = !loading && results.length === 0 && query.trim();

  return (
    <PageLayout>
      <div className="search-page">

        {!loading && query.trim() && (
          <div className="search-results-summary">
            <h1>Results for "<span>{query}</span>"</h1>
            <p className="search-results-count">
              {results.length} {results.length === 1 ? 'result' : 'results'} found
            </p>
          </div>
        )}

        {loading && <SkeletonGrid />}

        {!loading && results.length > 0 && (
          <div className="search-results-grid">
            {results.map(item => {
              const cartItem = cart.find(c => c.id === item.id);
              const detailPath = item.type === 'drink' ? `/drink/${item.id}` : `/menu/${item.id}`;

              return (
                <article key={item.id} className="search-result-card">
                  <div className="search-result-img-wrap">
                    <Link to={detailPath}>
                      <MealImage
                        name={item.name}
                        image={item.image}
                        category={item.type === 'drink' ? 'Drinks' : item.category}
                        className="search-result-img"
                      />
                    </Link>
                    <span className={`search-result-type-badge ${item.type}`}>
                      {item.type === 'drink' ? 'Drink' : 'Meal'}
                    </span>
                  </div>

                  <div className="search-result-body">
                    <h3 className="search-result-name">
                      <Link to={detailPath}>{item.name}</Link>
                    </h3>
                    <p className="search-result-desc">{item.description}</p>

                    <div className="search-result-footer">
                      <span className="search-result-price">${item.price.toLocaleString('en-US')}</span>
                      {cartItem ? (
                        <div className="search-result-qty">
                          <button onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}>-</button>
                          <span>{cartItem.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}>+</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(item)}
                          className={`search-result-cart-btn ${addedItem === item.id ? 'added' : ''}`}
                          title="Add to cart"
                        >
                          {addedItem === item.id ? '✓' : <PlusIcon />}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {isEmpty && (
          <div className="search-empty">
            <div className="search-empty-icon">
              <Search size={32} strokeWidth={1.5} />
            </div>
            <h2>No results found</h2>
            <p>We couldn't find anything matching "{query}". Try another search.</p>
            <Link to="/menu" className="search-empty-back">
              <ArrowLeft size={16} />
              Back to Menu
            </Link>
          </div>
        )}

        {!loading && !query.trim() && (
          <div className="search-empty">
            <div className="search-empty-icon">
              <Search size={32} strokeWidth={1.5} />
            </div>
            <h2>Search our menu</h2>
            <p>Find your favorite meals and drinks from our curated collection.</p>
            <Link to="/menu" className="search-empty-back">
              <ArrowLeft size={16} />
              Back to Menu
            </Link>
          </div>
        )}

      </div>
    </PageLayout>
  );
}
