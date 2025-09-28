'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Search } from '@mui/icons-material';
import { fetchApi } from '@/services/api';
import MainLayout from '@/components/MainLayout';

interface NoCellVolunteerDto {
  name: string;
  phone: string;
  email: string;
  cell_name: string;
}

interface NoMinistryVolunteerDto {
  name: string;
  email: string;
  phone: string;
  birth_date: Date;
  startServicedAt: number;
  tipoVoluntario: string;
  cell_name: string;
}

interface ReportOption {
  id: string;
  name: string;
  description: string;
}

interface ReportData {
  [key: string]: any;
}

const REPORT_OPTIONS: ReportOption[] = [
  {
    id: 'no-cell',
    name: 'Voluntários sem Célula',
    description: 'Lista voluntários que não possuem célula atribuída'
  },
  {
    id: 'no-ministry',
    name: 'Voluntários sem Ministério',
    description: 'Lista voluntários que não possuem ministério atribuído'
  }
];

export default function SeasonReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [seasonId, setSeasonId] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params;
      setSeasonId(id);
    };
    getParams();
  }, [params]);

  const handleBack = () => {
    router.back();
  };

  const handleGenerateReport = async () => {
    if (!selectedReport || !seasonId) return;

    setLoading(true);
    try {
      let endpoint = '';

      switch (selectedReport) {
        case 'no-cell':
          endpoint = `seasons/${seasonId}/no-cell`;
          break;
        case 'no-ministry':
          endpoint = `seasons/${seasonId}/no-ministry`;
          break;
        default:
          throw new Error('Relatório não encontrado');
      }

      const response = await fetchApi<any>(endpoint);
      setReportData(response.data || []);
      setHasSearched(true);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const renderNoCellVolunteersTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#ff6900', '& .MuiTableCell-head': { color: 'white', fontWeight: 600 } }}>
            <TableCell>Nome</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Telefone</TableCell>
            <TableCell>Célula</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.map((volunteer: any, index: number) => (
            <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(238, 80, 20, 0.04)' }}>
              <TableCell>{volunteer.name}</TableCell>
              <TableCell>{volunteer.email}</TableCell>
              <TableCell>{volunteer.phone}</TableCell>
              <TableCell>{volunteer.cell_name || 'Não atribuída'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderNoMinistryVolunteersTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#ff6900', '& .MuiTableCell-head': { color: 'white', fontWeight: 600 } }}>
            <TableCell>Nome</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Telefone</TableCell>
            <TableCell>Data de Nascimento</TableCell>
            <TableCell>Tempo de Serviço</TableCell>
            <TableCell>Tipo de Voluntário</TableCell>
            <TableCell>Célula</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.map((volunteer: any, index: number) => (
            <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(238, 80, 20, 0.04)' }}>
              <TableCell>{volunteer.name}</TableCell>
              <TableCell>{volunteer.email}</TableCell>
              <TableCell>{volunteer.phone}</TableCell>
              <TableCell>{new Date(volunteer.birth_date).toLocaleDateString('pt-BR')}</TableCell>
              <TableCell>{volunteer.startServicedAt} anos</TableCell>
              <TableCell>{volunteer.tipoVoluntario}</TableCell>
              <TableCell>{volunteer.cell_name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderReportTable = () => {
    if (!hasSearched || reportData.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary">
            {hasSearched ? 'Nenhum dado encontrado' : 'Selecione um relatório e clique em Consultar'}
          </Typography>
        </Box>
      );
    }

    switch (selectedReport) {
      case 'no-cell':
        return renderNoCellVolunteersTable();
      case 'no-ministry':
        return renderNoMinistryVolunteersTable();
      default:
        return null;
    }
  };

  return (
    <MainLayout pageTitle="Relatórios da Temporada">
      <Box>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            variant="outlined"
          >
            Voltar
          </Button>
        </Box>

        {/* Filtros */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Selecionar Relatório
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>Relatório</InputLabel>
              <Select
                value={selectedReport}
                label="Relatório"
                onChange={(e) => setSelectedReport(e.target.value)}
              >
                {REPORT_OPTIONS.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    <Box>
                      <Typography variant="body1">{option.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleGenerateReport}
              disabled={!selectedReport || loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Consultar'}
            </Button>
          </Box>
        </Paper>

        {/* Resultados */}
        {renderReportTable()}
      </Box>
    </MainLayout>
  );
}