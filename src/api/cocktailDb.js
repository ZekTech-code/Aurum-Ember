const BASE = 'https://www.thecocktaildb.com/api/json/v1/1';

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function normalizeDrink(drink) {
  if (!drink) return null;
  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const ing = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingredients.push(measure ? `${measure.trim()} ${ing.trim()}` : ing.trim());
    }
  }
  return {
    id: drink.idDrink,
    name: drink.strDrink,
    image: drink.strDrinkThumb,
    category: drink.strCategory || 'Cocktail',
    glass: drink.strGlass || 'Glass',
    alcoholic: drink.strAlcoholic === 'Alcoholic' ? 'Alcoholic' : 'Non Alcoholic',
    instructions: drink.strInstructions || '',
    tags: drink.strTags ? drink.strTags.split(',').map(t => t.trim()) : [],
    video: drink.strVideo || '',
    source: drink.strSource || '',
    ingredients,
    strDrinkThumb: drink.strDrinkThumb,
  };
}

export async function searchDrinks(query) {
  if (!query || !query.trim()) return [];
  const data = await fetchJSON(`${BASE}/search.php?s=${encodeURIComponent(query.trim())}`);
  return (Array.isArray(data.drinks) ? data.drinks : []).map(normalizeDrink).filter(Boolean);
}

export async function getDrinkById(id) {
  if (!id) return null;
  try {
    const res = await fetch(`/api/meals/drink/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getRandomDrink() {
  const data = await fetchJSON(`${BASE}/random.php`);
  return data.drinks && data.drinks.length > 0 ? normalizeDrink(data.drinks[0]) : null;
}

export async function getDrinksByCategory(category) {
  if (!category) return [];
  const data = await fetchJSON(`${BASE}/filter.php?c=${encodeURIComponent(category)}`);
  return (Array.isArray(data.drinks) ? data.drinks : []).map(d => ({
    id: d.idDrink,
    name: d.strDrink,
    image: d.strDrinkThumb,
  }));
}

export async function getDrinksByAlcoholic(filter) {
  if (!filter) return [];
  const data = await fetchJSON(`${BASE}/filter.php?a=${encodeURIComponent(filter)}`);
  return (Array.isArray(data.drinks) ? data.drinks : []).map(d => ({
    id: d.idDrink,
    name: d.strDrink,
    image: d.strDrinkThumb,
  }));
}

export async function getDrinksByIngredient(ingredient) {
  if (!ingredient) return [];
  const data = await fetchJSON(`${BASE}/filter.php?i=${encodeURIComponent(ingredient)}`);
  return (Array.isArray(data.drinks) ? data.drinks : []).map(d => ({
    id: d.idDrink,
    name: d.strDrink,
    image: d.strDrinkThumb,
  }));
}

export async function getDrinkCategories() {
  const data = await fetchJSON(`${BASE}/list.php?c=list`);
  return (Array.isArray(data.drinks) ? data.drinks : []).map(d => d.strCategory).filter(Boolean);
}

export async function getGlassTypes() {
  const data = await fetchJSON(`${BASE}/list.php?g=list`);
  return (Array.isArray(data.drinks) ? data.drinks : []).map(d => d.strGlass).filter(Boolean);
}

// Fetch multiple random drinks
export async function getRandomDrinks(count = 8) {
  const seen = new Set();
  const drinks = [];
  const maxAttempts = count * 3;
  let attempts = 0;
  while (drinks.length < count && attempts < maxAttempts) {
    try {
      const drink = await getRandomDrink();
      if (drink && !seen.has(drink.id)) {
        seen.add(drink.id);
        drinks.push(drink);
      }
    } catch { /* ignore failed random fetch */ }
    attempts++;
  }
  return drinks;
}
