'use client';

import { useRouter } from 'next/navigation';
import { Box, Button, Paper, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import MainLayout from '@/components/MainLayout';

interface SeasonPageProps {
  params: {
    id: string;
  };
}

export default function SeasonPage({ params }: SeasonPageProps) {
  const router = useRouter();
  const seasonId = params.id;

  const handleBack = () => {
    router.back();
  };

  return (
    <MainLayout pageTitle="Visualizar Temporada">
      <Box>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            variant="outlined"
          >
            Voltar
          </Button>
          <Typography variant="h5">
            Visualizar Temporada
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            ID da Temporada
          </Typography>
          <Typography variant="body1" gutterBottom>
            {seasonId}
          </Typography>

          <Typography sx={{ mt: 3 }}>
            Página em construção. Aqui serão exibidos os detalhes da temporada.
          </Typography>
        </Paper>
      </Box>
    </MainLayout>
  );
}