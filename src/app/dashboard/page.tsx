'use client';

import { Box, Typography, Paper } from '@mui/material';
import MainLayout from '@/components/MainLayout';

export default function DashboardPage() {
  return (
    <MainLayout pageTitle="Dashboard">
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'grid', gap: 4 }}>
          {/* Seção de Boas-vindas */}
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #FF6900 0%, #FF8A3D 100%)',
              color: 'white',
              borderRadius: 4,
            }}
          >
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Bem-vindo ao Sistema da Comunidade Evangélica Rhema
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 800, mx: 'auto', mt: 2, opacity: 0.9 }}>
              Gerenciando com excelência para a glória de Deus
            </Typography>
          </Paper>

          {/* Cards Informativos */}
          {/* <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
            <Paper
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#FFF9F5',
                border: '1px solid #FFE0CC',
                borderRadius: 4,
              }}
            >
              <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 500 }}>
                Nossa Missão
              </Typography>
              <Typography variant="body1" textAlign="center" color="text.secondary">
                Servir à comunidade com amor e dedicação, proporcionando uma gestão eficiente e
                transparente dos recursos e atividades da igreja.
              </Typography>
            </Paper>

            <Paper
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#FFF9F5',
                border: '1px solid #FFE0CC',
                borderRadius: 4,
              }}
            >
              <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 500 }}>
                Nossos Valores
              </Typography>
              <Typography variant="body1" textAlign="center" color="text.secondary">
                • Excelência no serviço
                <br />
                • Transparência nas ações
                <br />
                • Amor ao próximo
                <br />
                • Compromisso com a Palavra
              </Typography>
            </Paper>
          </Box> */}

          {/* Versículo do Dia */}
          <Paper
            sx={{
              p: 4,
              backgroundColor: '#FFF9F5',
              border: '1px solid #FFE0CC',
              borderRadius: 4,
            }}
          >
            <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 500 }}>
              Versículo do Dia
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              "Tudo o que fizerem, façam de todo o coração, como para o Senhor, e não para os homens."
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Colossenses 3:23
            </Typography>
          </Paper>
        </Box>
      </Box>
    </MainLayout>
  );
}