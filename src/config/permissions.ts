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
    path: '/',
    allowedRoles: ['492f9cbe-c823-44fa-b53b-68bb8eae6140', 'ada00ec0-d060-4f41-87aa-acdac0e0ee4d', 'daf9e273-8781-45d1-b1ea-00a76b3d1799'] // ID do role Administrador
  },
  {
    path: '/dashboard',
    allowedRoles: ['492f9cbe-c823-44fa-b53b-68bb8eae6140', 'ada00ec0-d060-4f41-87aa-acdac0e0ee4d', 'daf9e273-8781-45d1-b1ea-00a76b3d1799'] // ID do role Administrador
  },
  {
    path: '/seasons',
    allowedRoles: ['492f9cbe-c823-44fa-b53b-68bb8eae6140', 'ada00ec0-d060-4f41-87aa-acdac0e0ee4d']
  },
  {
    path: '/seasons/[id]',
    allowedRoles: ['492f9cbe-c823-44fa-b53b-68bb8eae6140', 'ada00ec0-d060-4f41-87aa-acdac0e0ee4d']
  },
  {
    path: '/seasons/[id]/dashboard',
    allowedRoles: ['492f9cbe-c823-44fa-b53b-68bb8eae6140', 'ada00ec0-d060-4f41-87aa-acdac0e0ee4d']
  },
  {
    path: '/users',
    allowedRoles: ['492f9cbe-c823-44fa-b53b-68bb8eae6140']
  },
  {
    path: '/change-password',
    allowedRoles: ['492f9cbe-c823-44fa-b53b-68bb8eae6140', 'ada00ec0-d060-4f41-87aa-acdac0e0ee4d', 'daf9e273-8781-45d1-b1ea-00a76b3d1799'] // ID do role Administrador
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
    id: 'voluntariado',
    label: 'Voluntariado',
    path: '/seasons',
    allowedRoles: ['492f9cbe-c823-44fa-b53b-68bb8eae6140', 'ada00ec0-d060-4f41-87aa-acdac0e0ee4d']
  }
];
  // {
  //   id: 'settings',
  //   label: 'Configurações',
  //   path: '/settings',
  //   allowedRoles: ['492f9cbe-c823-44fa-b53b-68bb8eae6140']
  // }
export { routes, menuItems, publicRoutes };
export type { RoutePermission, MenuItem };