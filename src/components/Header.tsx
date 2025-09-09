'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Settings,
  Person,
  Lock,
  Logout,
} from '@mui/icons-material';
import { logout, getUserData } from '@/services/auth';
import Image from 'next/image';

interface HeaderProps {
  pageTitle: string;
}

export default function Header({ pageTitle }: HeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userData, setUserData] = useState<any>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await getUserData();
      setUserData(data);
    };

    fetchUserData();
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'white',
        color: 'text.primary',
      }}
    >
      <Toolbar>
        {/* Logo e Título */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
         <Image src="/logo-rhema-black.png" alt="Logo" width={40} height={40} unoptimized  />
          {/* <Box 
            sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: '#FF6900', 
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              R
            </Typography>
          </Box> */}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Rhema
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {pageTitle}
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Menu do Usuário */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ textAlign: 'right', mr: 1 }}>
            <Typography variant="subtitle2">{userData?.name || 'Usuário'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {userData?.role?.name || 'Carregando...'}
            </Typography>
          </Box>
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: '#FF6900',
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            >
              {userData?.name ? userData.name[0].toUpperCase() : 'U'}
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
              mt: 1.5,
              width: 220,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2">{userData?.name || 'Usuário'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {userData?.email || 'carregando@rhema.com'}
            </Typography>
          </Box>
          <Divider />
          {/* <MenuItem>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            Meu Perfil
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Configurações
          </MenuItem> */}
          <MenuItem component={Link} href="/change-password">
            <ListItemIcon>
              <Lock fontSize="small" />
            </ListItemIcon>
            Mudar Senha
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <Logout fontSize="small" color="error" />
            </ListItemIcon>
            Sair
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
