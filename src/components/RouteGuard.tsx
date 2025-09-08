'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { hasPermission, loading } = usePermissions();

  useEffect(() => {
    if (!loading && !hasPermission(pathname)) {
      console.log('Acesso negado à rota:', pathname);
      router.push('/unauthorized');
    }
  }, [pathname, hasPermission, loading, router]);

  if (loading) {
    // Você pode adicionar um componente de loading aqui
    return <div>Carregando...</div>;
  }

  return hasPermission(pathname) ? children : null;
}