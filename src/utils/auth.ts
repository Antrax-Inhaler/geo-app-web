const TOKEN_KEY = 'auth_token';

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const logout = (): void => {
  removeToken();
  // You can add additional cleanup here if needed
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};