import { Router } from 'express';
import { db } from '../store.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

const MEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1';
const COCKTAILDB_BASE = 'https://www.thecocktaildb.com/api/json/v1/1';

async function fetchJSON(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const data = await res.json();
    return data;
  } catch {
    return {};
  }
}

const menuCache = { data: null, timestamp: 0 };
const CACHE_TTL = 5 * 60 * 1000;

router.get('/external-menu', async (req, res) => {
  if (menuCache.data && Date.now() - menuCache.timestamp < CACHE_TTL) {
    return res.json(menuCache.data);
  }

  const categories = ['Beef', 'Chicken', 'Seafood', 'Pasta', 'Vegetarian', 'Dessert', 'Goat', 'Breakfast', 'Lamb', 'Miscellaneous', 'Pork', 'Side', 'Starter', 'Vegan'];

  const mealPromises = categories.map(c =>
    fetchJSON(`${MEALDB_BASE}/filter.php?c=${c}`)
  );

  const drinkPromises = [
    fetchJSON(`${COCKTAILDB_BASE}/filter.php?c=Cocktail`),
    fetchJSON(`${COCKTAILDB_BASE}/filter.php?c=Ordinary%20Drink`),
    fetchJSON(`${COCKTAILDB_BASE}/filter.php?c=Beer`),
    fetchJSON(`${COCKTAILDB_BASE}/filter.php?c=Shot`),
    fetchJSON(`${COCKTAILDB_BASE}/filter.php?c=Coffee%20/%20Tea`),
    fetchJSON(`${COCKTAILDB_BASE}/filter.php?c=Other%2FUnknown`),
  ];

  const allResults = await Promise.all([...mealPromises, ...drinkPromises]);

  const seen = new Set();
  const items = [];

  for (let i = 0; i < categories.length; i++) {
    const d = allResults[i];
    if (!Array.isArray(d.meals)) continue;
    for (const m of d.meals) {
      if (seen.has(m.idMeal)) continue;
      seen.add(m.idMeal);
      items.push({
        id: m.idMeal,
        name: m.strMeal,
        image: m.strMealThumb,
        category: categories[i],
        description: '',
      });
    }
  }

  for (let i = categories.length; i < allResults.length; i++) {
    const d = allResults[i];
    if (!Array.isArray(d.drinks)) continue;
    for (const c of d.drinks) {
      if (seen.has(c.idDrink)) continue;
      seen.add(c.idDrink);
      items.push({
        id: c.idDrink,
        name: c.strDrink,
        image: c.strDrinkThumb,
        category: 'Drinks',
        description: '',
      });
    }
  }

  menuCache.data = { items };
  menuCache.timestamp = Date.now();
  res.json({ items });
});

const drinkCache = new Map();
const DRINK_CACHE_TTL = 5 * 60 * 1000;

router.get('/drink/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Drink ID required' });

  const cached = drinkCache.get(id);
  if (cached && Date.now() - cached.ts < DRINK_CACHE_TTL) {
    return res.json(cached.data);
  }

  try {
    const data = await fetchJSON(`${COCKTAILDB_BASE}/lookup.php?i=${encodeURIComponent(id)}`);
    const drinks = Array.isArray(data.drinks) ? data.drinks : [];
    if (drinks.length === 0) return res.status(404).json({ error: 'Drink not found' });

    const drink = drinks[0];
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
      const ing = drink[`strIngredient${i}`];
      const measure = drink[`strMeasure${i}`];
      if (ing && ing.trim()) {
        ingredients.push(measure ? `${measure.trim()} ${ing.trim()}` : ing.trim());
      }
    }

    const normalized = {
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
    };

    drinkCache.set(id, { data: normalized, ts: Date.now() });
    res.json(normalized);
  } catch {
    res.status(502).json({ error: 'Failed to fetch drink' });
  }
});

router.get('/', async (req, res) => {
  const { page = 1, limit = 200, category, search, sort } = req.query;
  let meals = await db.get('meals');

  if (category && category !== 'All') {
    meals = meals.filter(m => m.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    meals = meals.filter(m => (m.name || '').toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q));
  }
  if (sort === 'price_asc') meals.sort((a, b) => (a.price || 0) - (b.price || 0));
  if (sort === 'price_desc') meals.sort((a, b) => (b.price || 0) - (a.price || 0));
  if (sort === 'name') meals.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const start = (Number(page) - 1) * Number(limit);
  const paginated = meals.slice(start, start + Number(limit));

  res.json({ meals: paginated, total: meals.length, page: Number(page), limit: Number(limit) });
});

router.get('/:id', async (req, res) => {
  const meal = await db.findById('meals', req.params.id);
  if (!meal) return res.status(404).json({ error: 'Meal not found' });
  res.json(meal);
});

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  let mealData = {};

  if (req.is('multipart/form-data')) {
    const fields = req.body || {};
    Object.entries(fields).forEach(([k, v]) => { mealData[k] = v; });
  } else {
    mealData = { ...req.body };
  }

  if (req.file) {
    mealData.image = `/uploads/${req.file.filename}`;
  }

  mealData.availability = mealData.availability !== 'false' && mealData.availability !== false;
  mealData.price = Number(mealData.price) || 0;
  mealData.rating = Number(mealData.rating) || 0;
  mealData.featured = mealData.featured === 'true' || mealData.featured === true;

  const meal = await db.insert('meals', mealData);
  res.status(201).json({ message: 'Meal created', meal });
});

router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const existing = await db.findById('meals', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Meal not found' });

  let updates = {};
  if (req.is('multipart/form-data')) {
    Object.entries(req.body || {}).forEach(([k, v]) => { updates[k] = v; });
  } else {
    updates = { ...req.body };
  }

  if (req.file) {
    updates.image = `/uploads/${req.file.filename}`;
  }

  if (updates.price !== undefined) updates.price = Number(updates.price) || 0;
  if (updates.availability !== undefined) updates.availability = updates.availability !== 'false' && updates.availability !== false;
  if (updates.featured !== undefined) updates.featured = updates.featured === 'true' || updates.featured === true;

  const meal = await db.updateById('meals', req.params.id, updates);
  res.json({ message: 'Meal updated', meal });
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const deleted = await db.deleteById('meals', req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Meal not found' });
  res.json({ message: 'Meal deleted' });
});

export default router;
