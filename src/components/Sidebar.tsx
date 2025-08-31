'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Paper,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  Assessment,
  Bolt,
  Group,
  Description,
  Settings,
  ChevronLeft,
  Help,
} from '@mui/icons-material';

const menuItems = [
  {
    name: 'Dashboard',
    path: '/',
    icon: <Dashboard />
  },
  {
    name: 'Analytics',
    path: '/analytics',
    icon: <Assessment />
  },
  {
    name: 'Insights',
    path: '/insights',
    icon: <Bolt />
  },
  {
    name: 'Usuários',
    path: '/users',
    icon: <Group />
  },
  {
    name: 'Relatórios',
    path: '/reports',
    icon: <Description />
  },
  {
    name: 'Configurações',
    path: '/settings',
    icon: <Settings />
  }
];

export default function Sidebar({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const drawerWidth = isCollapsed ? 64 : 256;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: '64px',
          height: 'calc(100vh - 64px)',
          transition: 'width 0.3s ease-in-out',
        },
      }}
    >
      {/* Toggle Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={onToggle}>
          <ChevronLeft sx={{ transform: isCollapsed ? 'rotate(180deg)' : 'none' }} />
        </IconButton>
      </Box>

      {/* Navigation Menu */}
      <List>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding>
              <Tooltip 
                title={isCollapsed ? item.name : ''} 
                placement="right"
                arrow
              >
                <ListItemButton
                  component={Link}
                  href={item.path}
                  selected={isActive}
                  sx={{
                    minHeight: 48,
                    mx: 1,
                    my: 0.5,
                    px: 2.5,
                    borderRadius: 2,
                    ...(isActive && {
                      bgcolor: '#FF6900',
                      color: 'white',
                      '&:hover': {
                        bgcolor: '#FF6900',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    }),
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isCollapsed ? 0 : 2,
                      justifyContent: 'center',
                      color: isActive ? 'white' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText 
                      primary={item.name}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Help Section */}
      <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'orange.50',
            border: 1,
            borderColor: 'orange.100',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                bgcolor: '#FF6900',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Help sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            {!isCollapsed && (
              <Box>
                <Typography variant="caption" fontWeight={500} color="text.primary">
                  Precisa de ajuda?
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  Acesse nossa documentação
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Drawer>
  );
}
