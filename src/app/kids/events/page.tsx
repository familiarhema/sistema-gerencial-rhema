'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { fetchApi } from '@/services/api';
import MainLayout from '@/components/MainLayout';

interface KidsEvent {
  id: number;
  name: string;
  date: string;
}

export default function KidsEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<KidsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetchApi<KidsEvent[]>('kids/events');
      setEvents(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar eventos do kids:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEvent = (eventId: number) => {
    router.push(`/kids/events/${eventId}`);
  };

  const formatDate = (date: string) => {
    if (!date) return 'Data não definida';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <MainLayout pageTitle="Eventos do Kids">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle="Eventos do Kids">
      <Box>
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
                <TableCell>Data</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event, index) => (
                <TableRow
                  key={event.id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(238, 80, 20, 0.04)',
                    '&:hover': {
                      backgroundColor: 'rgba(238, 80, 20, 0.08)',
                    },
                  }}
                >
                  <TableCell>{event.name}</TableCell>
                  <TableCell>{formatDate(event.date)}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleViewEvent(event.id)}>
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {events.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              Nenhum evento encontrado
            </Typography>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
}