import { useState, useEffect, useRef } from 'react';
import { AuthContext } from './AuthContextInstance';

const API_BASE = '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return !!sessionStorage.getItem('ae-admin-token');
  });
  const [token, setToken] = useState(() => sessionStorage.getItem('ae-user-token'));
  const tokenRef = useRef(token);
  const userRef = useRef(user);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!tokenRef.current || userRef.current) return;
    const t = tokenRef.current;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/users/profile`, {
          headers: { Authorization: `Bearer ${t}` }
        });
        if (res.ok) {
          setUser(await res.json());
        } else {
          sessionStorage.removeItem('ae-user-token');
          setToken(null);
        }
      } catch {
        sessionStorage.removeItem('ae-user-token');
        setToken(null);
      }
    })();
  }, []);

  useEffect(() => {
    const adminToken = sessionStorage.getItem('ae-admin-token');
    if (!adminToken) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/profile`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        if (!res.ok) {
          sessionStorage.removeItem('ae-admin-token');
          setIsAdminAuthenticated(false);
        }
      } catch {
        sessionStorage.removeItem('ae-admin-token');
        setIsAdminAuthenticated(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message || 'Login failed' };
      }
      sessionStorage.setItem('ae-user-token', data.token);
      setToken(data.token);
      return { success: true, user: data };
    } catch {
      return { success: false, error: 'Unable to connect to server' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message || 'Registration failed' };
      }
      return { success: true, user: data };
    } catch {
      return { success: false, error: 'Unable to connect to server' };
    }
  };

  const googleLogin = async (googleUser) => {
    try {
      const response = await fetch(`${API_BASE}/users/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: googleUser.name,
          email: googleUser.email,
          avatar: googleUser.picture || ''
        })
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message || 'Google login failed' };
      }
      sessionStorage.setItem('ae-user-token', data.token);
      setToken(data.token);
      return { success: true, user: data };
    } catch {
      return { success: false, error: 'Unable to connect to server' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('ae-user-token');
  };

  const finalizeLogin = (userData) => {
    if (userData?.token) {
      sessionStorage.setItem('ae-user-token', userData.token);
      setToken(userData.token);
    }
    setUser(userData);
  };

  const updateProfile = async (updates) => {
    if (!token) return false;
    try {
      const response = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteAccount = async () => {
    try {
      const storedToken = sessionStorage.getItem('ae-user-token');
      if (storedToken) {
        await fetch(`${API_BASE}/users/me`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${storedToken}` }
        });
      }
    } catch { /* Silently handle error */ }
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('ae-user-token');
  };

  const sendNotification = async (userEmail, message) => {
    try {
      await fetch(`${API_BASE}/users/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userEmail, message })
      });
    } catch {
      // Silent fail for notifications
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message || 'Login failed' };
      }
      sessionStorage.setItem('ae-admin-token', data.token);
      setIsAdminAuthenticated(true);
      return { success: true };
    } catch {
      return { success: false, error: 'Unable to connect to server' };
    }
  };

  const adminRegister = async (adminData) => {
    try {
      const admToken = sessionStorage.getItem('ae-admin-token');
      if (!admToken) {
        return { success: false, error: 'Not authenticated as admin' };
      }
      const response = await fetch(`${API_BASE}/admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admToken}`,
        },
        body: JSON.stringify(adminData),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message || 'Registration failed' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Unable to connect to server' };
    }
  };

  const adminBootstrap = async (adminData) => {
    try {
      const response = await fetch(`${API_BASE}/admin/bootstrap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message || 'Bootstrap failed' };
      }
      sessionStorage.setItem('ae-admin-token', data.token);
      setIsAdminAuthenticated(true);
      return { success: true };
    } catch {
      return { success: false, error: 'Unable to connect to server' };
    }
  };

  const adminLogout = () => {
    sessionStorage.removeItem('ae-admin-token');
    setIsAdminAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      login, 
      register, 
      googleLogin,
      logout, 
      adminLogin,
      adminRegister,
      adminBootstrap,
      adminLogout,
      isAdminAuthenticated,
      finalizeLogin, 
      updateProfile, 
      deleteAccount, 
      sendNotification,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
