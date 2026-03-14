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
  TableFooter,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Search } from '@mui/icons-material';
import { fetchApi } from '@/services/api';
import MainLayout from '@/components/MainLayout';
import * as XLSX from 'xlsx';
import { Download } from '@mui/icons-material';

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

interface SeasonVolunteersDto {
  volunteer_id: string;
  name: string;
  email: string;
  phone: string;
  cell_frequency: number;
  cell_id: string;
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
  },
  {
    id: 'cell-frequency',
    name: 'Frequência de Voluntários por Célula',
    description: 'Lista frequência de voluntários por célula'
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

  const formatCellFrequency = (frequency: number): string => {
    switch (frequency) {
      case 0:
        return 'Não Frequentando';
      case 5:
        return 'Frequência Média';
      case 10:
        return 'Frequente';
      default:
        return `Frequência ${frequency}`;
    }
  };

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
        case 'cell-frequency':
          endpoint = `volunteers/season/${seasonId}/list`;
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

  const handleExportToExcel = () => {
    if (!hasSearched || reportData.length === 0) return;

    let data: any[] = [];

    if (selectedReport === 'no-cell') {
      data = reportData.map((vol: any) => ({
        Nome: vol.name,
        Email: vol.email,
        Telefone: vol.phone,
        Célula: vol.cell_name || 'Não atribuída'
      }));
    } else if (selectedReport === 'no-ministry') {
      data = reportData.map((vol: any) => ({
        Nome: vol.name,
        Email: vol.email,
        Telefone: vol.phone,
        'Data de Nascimento': new Date(vol.birth_date).toLocaleDateString('pt-BR'),
        'Tempo de Serviço': `${vol.startServicedAt} anos`,
        'Tipo de Voluntário': vol.tipoVoluntario,
        Célula: vol.cell_name
      }));
    } else if (selectedReport === 'cell-frequency') {
      data = reportData.map((vol: any) => ({
        Nome: vol.name,
        Email: vol.email,
        Telefone: vol.phone,
        'Frequência': formatCellFrequency(vol.cell_frequency),
        Célula: vol.cell_name
      }));
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    XLSX.writeFile(wb, `relatorio-${selectedReport}-${seasonId}.xlsx`);
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
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4} sx={{ fontWeight: 600, textAlign: 'center' }}>
              Total: {reportData.length} registros
            </TableCell>
          </TableRow>
        </TableFooter>
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
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7} sx={{ fontWeight: 600, textAlign: 'center' }}>
              Total: {reportData.length} registros
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );

  const renderCellFrequencyVolunteersTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#ff6900', '& .MuiTableCell-head': { color: 'white', fontWeight: 600 } }}>
            <TableCell>Nome</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Telefone</TableCell>
            <TableCell>Frequência</TableCell>
            <TableCell>Célula</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.map((volunteer: any, index: number) => (
            <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(238, 80, 20, 0.04)' }}>
              <TableCell>{volunteer.name}</TableCell>
              <TableCell>{volunteer.email}</TableCell>
              <TableCell>{volunteer.phone}</TableCell>
              <TableCell>{formatCellFrequency(volunteer.cell_frequency)}</TableCell>
              <TableCell>{volunteer.cell_name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5} sx={{ fontWeight: 600, textAlign: 'center' }}>
              Total: {reportData.length} registros
            </TableCell>
          </TableRow>
        </TableFooter>
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
      case 'cell-frequency':
        return renderCellFrequencyVolunteersTable();
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleGenerateReport}
                disabled={!selectedReport || loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Consultar'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExportToExcel}
                disabled={!hasSearched || reportData.length === 0}
              >
                Exportar para Excel
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Resultados */}
        {renderReportTable()}
      </Box>
    </MainLayout>
  );
}