'use client';

import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Warning } from '@mui/icons-material';
import MainLayout from '@/components/MainLayout';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <MainLayout pageTitle="Acesso Não Autorizado">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          minHeight: 'calc(100vh - 200px)', // Ajustado para considerar header e padding
        }}
      >
        <Warning sx={{ fontSize: 64, color: 'warning.main' }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Acesso Não Autorizado
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          Você não tem permissão para acessar esta página.
          <br />
          Entre em contato com o administrador do sistema.
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push('/')}
          sx={{ mt: 2 }}
        >
          Voltar para o Dashboard
        </Button>
      </Box>
    </MainLayout>
  );
}