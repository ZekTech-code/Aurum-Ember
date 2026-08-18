const API_BASE = '/api';
const MEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1';

export function priceFromId(mealId) {
  const str = String(mealId ?? "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  const dollars = 8 + (hash % 3500) / 100;
  return Math.round(dollars * 100) / 100;
}

export async function fetchAllMeals({ page = 1, limit = 200, category, search, sort } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category && category !== 'All') params.set('category', category);
  if (search) params.set('search', search);
  if (sort) params.set('sort', sort);

  const res = await fetch(`${API_BASE}/meals?${params}`);
  if (!res.ok) throw new Error('Failed to fetch meals');
  return res.json();
}

export async function fetchMealById(id) {
  const res = await fetch(`${API_BASE}/meals/${id}`);
  if (!res.ok) throw new Error('Meal not found');
  return res.json();
}

export async function searchMeals(query, signal) {
  if (!query || !query.trim()) return [];

  const [adminRes, mealDbRes] = await Promise.allSettled([
    fetch(`${API_BASE}/meals?search=${encodeURIComponent(query.trim())}&limit=200`, { signal })
      .then(r => r.ok ? r.json() : { meals: [] })
      .then(d => Array.isArray(d.meals) ? d.meals : []),
    fetch(`${MEALDB_BASE}/search.php?s=${encodeURIComponent(query.trim())}`, { signal })
      .then(r => r.ok ? r.json() : { meals: [] })
      .then(d => (Array.isArray(d.meals) ? d.meals : []).map(m => ({
        _id: m.idMeal,
        name: m.strMeal,
        image: m.strMealThumb,
        category: m.strCategory || 'Meals',
        price: priceFromId(m.idMeal),
        description: m.strInstructions ? m.strInstructions.substring(0, 120) + '...' : '',
        source: 'themealdb',
      }))),
  ]);

  const adminMeals = adminRes.status === 'fulfilled' ? adminRes.value : [];
  const externalMeals = mealDbRes.status === 'fulfilled' ? mealDbRes.value : [];

  return [...adminMeals, ...externalMeals];
}

export async function fetchMealsByCategory(category) {
  if (!category || category === 'All') {
    const data = await fetchAllMeals({ limit: 200 });
    return Array.isArray(data.meals) ? data.meals : [];
  }

  const [adminRes, mealDbRes] = await Promise.allSettled([
    fetch(`${API_BASE}/meals?category=${encodeURIComponent(category)}&limit=200`)
      .then(r => r.ok ? r.json() : { meals: [] })
      .then(d => Array.isArray(d.meals) ? d.meals : []),
    fetch(`${MEALDB_BASE}/filter.php?c=${encodeURIComponent(category)}`)
      .then(r => r.ok ? r.json() : { meals: [] })
      .then(d => (Array.isArray(d.meals) ? d.meals : []).map(m => ({
        _id: m.idMeal,
        name: m.strMeal,
        image: m.strMealThumb,
        category,
        source: 'themealdb',
      }))),
  ]);

  const adminMeals = adminRes.status === 'fulfilled' ? adminRes.value : [];
  const externalMeals = mealDbRes.status === 'fulfilled' ? mealDbRes.value : [];

  return [...adminMeals, ...externalMeals];
}

export async function fetchCategories() {
  const [adminRes, mealDbRes] = await Promise.allSettled([
    fetchAllMeals({ limit: 200 }).then(d => (Array.isArray(d.meals) ? d.meals : []).map(m => m.category).filter(Boolean)),
    fetch(`${MEALDB_BASE}/categories.php`)
      .then(r => r.ok ? r.json() : { categories: [] })
      .then(d => (d.categories || []).map(c => c.strCategory)),
  ]);

  const adminCats = adminRes.status === 'fulfilled' ? adminRes.value : [];
  const externalCats = mealDbRes.status === 'fulfilled' ? mealDbRes.value : [];
  const cats = [...new Set([...adminCats, ...externalCats])];

  return ['All', ...cats];
}
