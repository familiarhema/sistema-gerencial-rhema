import { useEffect, useState } from 'react';
import { getUserData } from '@/services/auth';
import { routes, menuItems, publicRoutes } from '@/config/permissions';
import type { MenuItem } from '@/config/permissions';

export function usePermissions() {
  const [allowedMenuItems, setAllowedMenuItems] = useState<MenuItem[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const data = await getUserData();
        setUserData(data);
        
        if (!data?.role?.id) {
          setAllowedMenuItems([]);
          return;
        }

        // Filtra itens de menu permitidos (recursivamente para sub-menus)
        const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
          return items
            .filter(item => item.allowedRoles.includes(data.role.id))
            .map(item => ({
              ...item,
              children: item.children ? filterMenuItems(item.children) : undefined
            }));
        };

        const userAllowedMenuItems = filterMenuItems(menuItems);
        setAllowedMenuItems(userAllowedMenuItems);
      } catch (error) {
        console.error('Erro ao carregar permissões:', error);
        setAllowedMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, []);

  const hasPermission = (path: string): boolean => {
    if (publicRoutes.includes(path)) {
      return true;
    }

    // Verificar rotas dinâmicas
    const routeMatch = routes.find(route => {
      // Converter o padrão da rota em regex
      const pattern = route.path.replace(/\[.*?\]/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(path);
    });

    return routeMatch?.allowedRoles.includes(userData?.role?.id || '') || false;
  };

  return {
    loading,
    hasPermission,
    allowedMenuItems
  };
}