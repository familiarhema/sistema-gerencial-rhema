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
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
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
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Data Início</TableCell>
              <TableCell>Data Fim</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {seasons.map((season) => (
              <TableRow key={season.id}>
                <TableCell>{season.name}</TableCell>
                <TableCell>{formatDate(season.dataInicio)}</TableCell>
                <TableCell>{formatDate(season.dataFim)}</TableCell>
                <TableCell>{season.active ? 'Ativa' : 'Inativa'}</TableCell>
                <TableCell align="right">
                  <Button
                    startIcon={<Visibility />}
                    onClick={() => handleViewSeason(season.id)}
                  >
                    Visualizar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MainLayout>
  );
}