'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
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
} from '@mui/material';
import { Visibility, Dashboard, Assessment } from '@mui/icons-material';
import { fetchApi } from '@/services/api';
import MainLayout from '@/components/MainLayout';

interface Season {
  id: string;
  name: string;
  dataInicio: string;
  dataFim: string;
  active: boolean;
}

export default function SeasonsPage() {
  const router = useRouter();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [nameFilter, setNameFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeasons();
  }, [nameFilter, activeFilter]);

  const fetchSeasons = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (nameFilter) queryParams.append('name', nameFilter);
      if (activeFilter !== null) queryParams.append('active', activeFilter.toString());

      const response = await fetchApi<Season[]>(`seasons?${queryParams.toString()}`);
      setSeasons(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar temporadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSeason = (seasonId: string) => {
    router.push(`/seasons/${seasonId}`);
  };

  const handleViewDashboard = (seasonId: string) => {
    router.push(`/seasons/${seasonId}/dashboard`);
  };

  const handleViewReports = (seasonId: string) => {
    router.push(`/seasons/${seasonId}/reports`);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <MainLayout pageTitle="Gestão de Temporadas">

      {/* Filtros */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Filtrar por nome"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          variant="outlined"
          size="small"
        />
        <FormControlLabel
          control={
            <Switch
              checked={activeFilter === true}
              onChange={(e) => setActiveFilter(e.target.checked ? true : null)}
            />
          }
          label="Apenas ativas"
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
              <TableCell>Data Início</TableCell>
              <TableCell>Data Fim</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {seasons.map((season, index) => (
              <TableRow 
                key={season.id}
                sx={{
                  backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(238, 80, 20, 0.04)',
                  '&:hover': {
                    backgroundColor: 'rgba(238, 80, 20, 0.08)',
                  },
                }}
              >
                <TableCell>{season.name}</TableCell>
                <TableCell>{formatDate(season.dataInicio)}</TableCell>
                <TableCell>{formatDate(season.dataFim)}</TableCell>
                <TableCell>{season.active ? 'Ativa' : 'Inativa'}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleViewSeason(season.id)}>
                    <Visibility />
                  </IconButton>
                  <IconButton color="primary" onClick={() => handleViewDashboard(season.id)}>
                    <Dashboard />
                  </IconButton>
                  <IconButton color="primary" onClick={() => handleViewReports(season.id)}>
                    <Assessment />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MainLayout>
  );
}