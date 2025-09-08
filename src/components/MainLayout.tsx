'use client';

import { ReactNode, useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import RouteGuard from './RouteGuard';

interface MainLayoutProps {
  children: ReactNode;
  pageTitle: string;
}

export default function MainLayout({ children, pageTitle }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const drawerWidth = sidebarCollapsed ? 64 : 256;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <CssBaseline />
      
      {/* Header */}
      <Header pageTitle={pageTitle} />
      
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '64px',
          ml: `${drawerWidth}px`,
          transition: 'margin-left 0.3s ease-in-out',
        }}
      >
        <RouteGuard>
          {children}
        </RouteGuard>
      </Box>
    </Box>
  );
}