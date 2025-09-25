'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Chip
} from '@mui/material';
import { Add, Block, LockOpen } from '@mui/icons-material';
import MainLayout from '@/components/MainLayout';
import { fetchApi } from '@/services/api';
import NewUserModal from './components/NewUserModal';

interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
  blocked: boolean;
  role: {
    name: string;
  };
}

interface UserFilters {
  name?: string;
  email?: string;
  active?: boolean;
  blocked?: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<UserFilters>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.name) queryParams.append('name', filters.name);
      if (filters.email) queryParams.append('email', filters.email);
      if (filters.active !== undefined) queryParams.append('active', filters.active.toString());
      if (filters.blocked !== undefined) queryParams.append('blocked', filters.blocked.toString());

      const response = await fetchApi<User[]>(`users?${queryParams.toString()}`);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string, blocked: boolean) => {
    try {
      await fetchApi(`users/${userId}/block`, {
        method: 'POST',
      });
      fetchUsers();
    } catch (error) {
      console.error('Erro ao bloquear/desbloquear usuário:', error);
    }
  };

  return (
    <MainLayout pageTitle="Gestão de Usuários">
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setModalOpen(true)}
          >
            Novo Usuário
          </Button>
        </Box>

        {/* Filtros */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Nome"
            value={filters.name || ''}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            variant="outlined"
            size="small"
          />
          <TextField
            label="Email"
            value={filters.email || ''}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
            variant="outlined"
            size="small"
          />
          <FormControlLabel
            control={
              <Switch
                checked={filters.active === true}
                onChange={(e) => setFilters({ ...filters, active: e.target.checked ? true : undefined })}
              />
            }
            label="Apenas ativos"
          />
          <FormControlLabel
            control={
              <Switch
                checked={filters.blocked === true}
                onChange={(e) => setFilters({ ...filters, blocked: e.target.checked ? true : undefined })}
              />
            }
            label="Apenas bloqueados"
          />
        </Box>

        {/* Tabela */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: '#ff6900',
                  '& .MuiTableCell-head': {
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Função</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, index) => (
                <TableRow 
                  key={user.id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(238, 80, 20, 0.04)',
                    '&:hover': {
                      backgroundColor: 'rgba(238, 80, 20, 0.08)',
                    },
                  }}
                >
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={user.active ? 'Ativo' : 'Inativo'}
                        color={user.active ? 'success' : 'error'}
                        size="small"
                      />
                      <Chip
                        label={user.blocked ? 'Bloqueado' : 'Desbloqueado'}
                        color={user.blocked ? 'error' : 'default'}
                        variant={user.blocked ? 'filled' : 'outlined'}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      color={user.blocked ? 'primary' : 'error'}
                      startIcon={user.blocked ? <LockOpen /> : <Block />}
                      onClick={() => handleBlockUser(user.id, !user.blocked)}
                      size="small"
                    >
                      {user.blocked ? 'Desbloquear' : 'Bloquear'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <NewUserModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            fetchUsers();
          }}
        />
      </Box>
    </MainLayout>
  );
}