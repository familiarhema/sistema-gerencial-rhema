import { fetchApi } from './api';

interface UserData {
  email: string;
  name: string;
  sub: string;
  role: {
    id: string;
    name: string;
  };
}

interface LoginResponse {
  success: boolean;
  error?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export async function login(credentials: LoginCredentials) {
  const response = await fetchApi<LoginResponse>('auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  if (response.data?.success) {
    return { success: true };
  }

  return { 
    success: false, 
    error: response.error || 'Falha na autenticação' 
  };
}

export async function logout() {
  try {
    await fetchApi('auth/logout', {
      method: 'POST',
    });
    window.location.href = '/login';
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    // Redireciona para login mesmo em caso de erro
    window.location.href = '/login';
  }
}

export async function isAuthenticated() {
  try {
    const response = await fetchApi<LoginResponse>('auth/verify');
    return response.data?.success || false;
  } catch {
    return false;
  }
}

export async function getUserData(): Promise<UserData | null> {
  try {
    const response = await fetchApi<{ success: boolean; user?: UserData }>('auth/verify');
    return response.data?.user || null;
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    return null;
  }
}