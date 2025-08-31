if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL não configurada');
}

export const config = {
  externalApiUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  endpoints: {
    auth: {
      login: 'auth/login',
    },
    // Adicione outros endpoints aqui
  },
} as const;