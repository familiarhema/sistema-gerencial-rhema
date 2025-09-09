'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import { fetchApi } from '@/services/api';

interface NewUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewUserModal({ open, onClose, onSuccess }: NewUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.name || !formData.email || !formData.password) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Email inválido');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetchApi('auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (response.error) {
        throw new Error(response.error);
      }

      onSuccess();
      onClose();
      setFormData({ name: '', email: '', password: '' });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', password: '' });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Novo Usuário</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{ position: 'relative' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Criar Usuário'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}