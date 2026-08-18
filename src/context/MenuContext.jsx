/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const MenuContext = createContext();

const API_BASE = '/api';

export const MenuProvider = ({ children }) => {
  const queryClient = useQueryClient();

  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['adminMeals'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/meals?limit=200`, {
        signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) throw new Error('Failed to fetch meals');
      const result = await response.json();
      return Array.isArray(result.meals) ? result.meals : [];
    },
    enabled: false,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
    refetchOnWindowFocus: false
  });

  const menuItems = data || [];

  const addMutation = useMutation({
    mutationFn: async (mealData) => {
      const token = sessionStorage.getItem('ae-admin-token');
      let body;
      let headers = {};

      if (mealData instanceof FormData) {
        body = mealData;
      } else {
        body = new FormData();
        Object.entries(mealData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            body.append(key, value);
          }
        });
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/meals`, {
        method: 'POST',
        headers,
        body
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to add meal');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminMeals']);
      queryClient.invalidateQueries(['meals']);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updatedData }) => {
      const token = sessionStorage.getItem('ae-admin-token');
      let body;
      let headers = {};

      if (updatedData instanceof FormData) {
        body = updatedData;
      } else {
        body = new FormData();
        Object.entries(updatedData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            body.append(key, value);
          }
        });
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/meals/${id}`, {
        method: 'PUT',
        headers,
        body
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to update meal');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminMeals']);
      queryClient.invalidateQueries(['meals']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = sessionStorage.getItem('ae-admin-token');
      const response = await fetch(`${API_BASE}/meals/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!response.ok) throw new Error('Failed to delete meal');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminMeals']);
      queryClient.invalidateQueries(['meals']);
    }
  });

  const addMeal = async (mealData) => addMutation.mutateAsync(mealData);
  const updateMeal = async (id, updatedData) => updateMutation.mutateAsync({ id, updatedData });
  const deleteMeal = async (id) => deleteMutation.mutateAsync(id);

  const toggleAvailability = async (id) => {
    const item = menuItems.find(m => m._id === id || m.id === id);
    if (!item) return;
    const newStatus = item.availability === 'In Stock' ? 'Out of Stock' : 'In Stock';
    return updateMutation.mutateAsync({
      id: item._id || item.id,
      updatedData: { availability: newStatus }
    });
  };

  const searchMenu = async (query) => {
    if (!query || !query.trim()) return [];
    try {
      const response = await fetch(`${API_BASE}/meals?search=${encodeURIComponent(query.trim())}&limit=20`);
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data.meals) ? data.meals : [];
    } catch {
      return [];
    }
  };

  return (
    <MenuContext.Provider value={{
      menuItems,
      loading,
      error,
      refetchMenu: refetch,
      addMeal,
      updateMeal,
      deleteMeal,
      toggleAvailability,
      searchMenu
    }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used within a MenuProvider');
  return context;
};
