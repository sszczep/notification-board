import axios from 'axios';
import jwt from 'jsonwebtoken';

export interface JWTPayload {
  exp: number;
  iat: number;
  username: string;
  isAdmin: boolean;
};

export function decodeToken(token: string) {
  return jwt.decode(token) as JWTPayload;
};

export function isTokenActive(token: string) {
  const decoded = decodeToken(token);
  return decoded.exp * 1000 > new Date().getTime();
};

export function getTokenFromStorage() {
  const token = localStorage.getItem('auth-token');
  if(token && isTokenActive(token)) return token; 
  return null;
};

export function isAdmin(token: string) {
  const decoded = decodeToken(token);
  return decoded.isAdmin;
};

export function getUsername(token: string) {
  const decoded = decodeToken(token);
  return decoded.username;
};

export async function signIn(username: string, password: string) {
  const { data: token } = await axios.post<string>('/auth/sign-in', { username, password });
  return token;
};

export async function signUp(username: string, password: string) {
  const { data: token } = await axios.post<string>('/auth/sign-up', { username, password });
  return token;
};