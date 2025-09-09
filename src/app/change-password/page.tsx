'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { Lock } from '@mui/icons-material';
import MainLayout from '@/components/MainLayout';
import { fetchApi } from '@/services/api';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('A nova senha e a confirmação não coincidem');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetchApi(`users/change-password`, {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout pageTitle="Alterar Senha">
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)' 
      }}>
        <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Lock sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" component="h1" gutterBottom>
              Alterar Senha
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type="password"
              label="Senha Atual"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              type="password"
              label="Nova Senha"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              type="password"
              label="Confirmar Nova Senha"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              sx={{ mb: 3 }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Senha alterada com sucesso! Redirecionando...
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading || success}
              sx={{ 
                height: 48,
                position: 'relative'
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Alterar Senha'}
            </Button>
          </form>
        </Paper>
      </Box>
    </MainLayout>
  );
}