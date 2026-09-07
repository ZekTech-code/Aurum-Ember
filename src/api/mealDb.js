const BASE = 'https://www.themealdb.com/api/json/v1/1';
const TIMEOUT_MS = 10000;

async function fetchJSON(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function normalizeMeal(meal) {
  if (!meal) return null;
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingredients.push(measure ? `${measure.trim()} ${ing.trim()}` : ing.trim());
    }
  }
  return {
    id: meal.idMeal,
    name: meal.strMeal,
    image: meal.strMealThumb,
    category: meal.strCategory || 'Special',
    area: meal.strArea || '',
    instructions: meal.strInstructions || '',
    tags: meal.strTags ? meal.strTags.split(',').map(t => t.trim()) : [],
    youtube: meal.strYoutube || '',
    source: meal.strSource || '',
    ingredients,
    strMealThumb: meal.strMealThumb,
  };
}

export async function searchMeals(query) {
  if (!query || !query.trim()) return [];
  const data = await fetchJSON(`${BASE}/search.php?s=${encodeURIComponent(query.trim())}`);
  return (Array.isArray(data.meals) ? data.meals : []).map(normalizeMeal).filter(Boolean);
}

const detailCache = new Map();

export async function getMealById(id) {
  if (!id) return null;
  if (detailCache.has(id)) return detailCache.get(id);
  const data = await fetchJSON(`${BASE}/lookup.php?i=${encodeURIComponent(id)}`);
  const meal = data.meals && data.meals.length > 0 ? normalizeMeal(data.meals[0]) : null;
  detailCache.set(id, meal);
  return meal;
}

export async function getRandomMeal() {
  const data = await fetchJSON(`${BASE}/random.php`);
  return data.meals && data.meals.length > 0 ? normalizeMeal(data.meals[0]) : null;
}

export async function getMealsByCategory(category) {
  if (!category) return [];
  const data = await fetchJSON(`${BASE}/filter.php?c=${encodeURIComponent(category)}`);
  return (Array.isArray(data.meals) ? data.meals : []).map(m => ({
    id: m.idMeal,
    name: m.strMeal,
    image: m.strMealThumb,
  }));
}

export async function getMealsByArea(area) {
  if (!area) return [];
  const data = await fetchJSON(`${BASE}/filter.php?a=${encodeURIComponent(area)}`);
  return (Array.isArray(data.meals) ? data.meals : []).map(m => ({
    id: m.idMeal,
    name: m.strMeal,
    image: m.strMealThumb,
  }));
}

export async function getMealsByIngredient(ingredient) {
  if (!ingredient) return [];
  const data = await fetchJSON(`${BASE}/filter.php?i=${encodeURIComponent(ingredient)}`);
  return (Array.isArray(data.meals) ? data.meals : []).map(m => ({
    id: m.idMeal,
    name: m.strMeal,
    image: m.strMealThumb,
  }));
}

export async function getCategories() {
  const data = await fetchJSON(`${BASE}/categories.php`);
  return (data.categories || []).map(c => ({
    id: c.idCategory,
    name: c.strCategory,
    description: c.strCategoryDescription || '',
    image: c.strCategoryThumb,
  }));
}

export async function getAreas() {
  const data = await fetchJSON(`${BASE}/list.php?a=list`);
  return (Array.isArray(data.meals) ? data.meals : []).map(m => m.strArea).filter(Boolean);
}

export async function getLetterMeal(letter = 'a') {
  const data = await fetchJSON(`${BASE}/search.php?f=${encodeURIComponent(letter)}`);
  return (Array.isArray(data.meals) ? data.meals : []).map(normalizeMeal).filter(Boolean);
}

// Fetch multiple random meals (by fetching random N times and deduplicating)
export async function getRandomMeals(count = 8) {
  const seen = new Set();
  const meals = [];
  const maxAttempts = count * 3;
  let attempts = 0;
  while (meals.length < count && attempts < maxAttempts) {
    try {
      const meal = await getRandomMeal();
      if (meal && !seen.has(meal.id)) {
        seen.add(meal.id);
        meals.push(meal);
      }
    } catch { /* ignore failed random fetch */ }
    attempts++;
  }
  return meals;
}
