interface RoutePermission {
  path: string;
  allowedRoles: string[];
}

interface MenuItem {
  id: string;
  label: string;
  path: string;
  allowedRoles: string[];
  children?: MenuItem[];
}

const publicRoutes = ['/unauthorized', '/login'];

const routes: RoutePermission[] = [
  {
    path: '/dashboard',
    allowedRoles: ['492f9cbe-c823-44fa-b53b-68bb8eae6140'] // ID do role Administrador
  },
  {
    path: '/seasons',
    allowedRoles: ['492f9cbe-c823-44fa-b53b-68bb8eae6140']
  },
  {
    path: '/seasons/[id]',
    allowedRoles: ['492f9cbe-c823-44fa-b53b-68bb8eae6140']
  }
];

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    allowedRoles: ['492f9cbe-c823-44fa-b53b-68bb8eae6140']
  },
  {
    id: 'users',
    label: 'Usuários',
    path: '/users',
    allowedRoles: ['492f9cbe-c823-44fa-b53b-68bb8eae6140']
  },
  {
    id: 'season-manager',
    label: 'Gerenciamento de Temporadas',
    path: '/seasons',
    allowedRoles: ['492f9cbe-c823-44fa-b53b-68bb8eae6140']
  },
  {
    id: 'volunteer-manager',
    label: 'Gerenciamento de Voluntários',
    path: '/volunteer-manager',
    allowedRoles: ['492f9cbe-c823-44fa-b53b-68bb8eae6140']
  },
  {
    id: 'settings',
    label: 'Configurações',
    path: '/settings',
    allowedRoles: ['492f9cbe-c823-44fa-b53b-68bb8eae6140']
  }
];

export { routes, menuItems, publicRoutes };
export type { RoutePermission, MenuItem };