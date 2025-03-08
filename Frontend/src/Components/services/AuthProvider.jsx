import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context and hook in one place
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load user and setup storage listener
  useEffect(() => {
    const loadUser = () => {
      setLoading(true);
      try {
        const userJSON = localStorage.getItem('loggedUser');
        setUser(userJSON ? JSON.parse(userJSON) : null);
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
    
    const handleStorageChange = (e) => {
      if (e.key === 'loggedUser') {
        loadUser();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Auth methods
  const login = userData => {
    localStorage.setItem('loggedUser', JSON.stringify(userData));
    setUser(userData);
  };
  
  const logout = () => {
    localStorage.removeItem('loggedUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};