import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await api.post('/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Invalid email or password');
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
};