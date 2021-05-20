import React, { createContext, useEffect, useState } from "react";

import axios from 'axios';
import { getTokenFromStorage } from '../controllers/auth';

interface AuthContextState {
  token: string | null;
  signIn: (token: string) => void;
  signOut: () => void;
};

const initialContextState: AuthContextState = {
  token: getTokenFromStorage(),
  signIn: () => {},
  signOut: () => {},
};

export const AuthContext = createContext<AuthContextState>(initialContextState);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<AuthContextState['token']>(initialContextState.token);

  const signIn = (token: string) => { 
    setToken(token);
    localStorage.setItem('auth-token', token);
  };

  const signOut = () => { 
    setToken(null);
    localStorage.removeItem('auth-token');
  };

  useEffect(() => {
    // Set axios Authorization header on token change
    if(token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete axios.defaults.headers.common['Authorization'];
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, signIn, signOut }}>
      { children }
    </AuthContext.Provider>
  );
};