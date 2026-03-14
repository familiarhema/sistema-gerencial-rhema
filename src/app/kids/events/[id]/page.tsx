'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  CircularProgress,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  IconButton,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { ArrowBack, Download, ExpandMore, FilterList } from '@mui/icons-material';
import { fetchApi } from '@/services/api';
import MainLayout from '@/components/MainLayout';
import * as XLSX from 'xlsx';

interface RegisteredChild {
  ID_CRIANCA: string;
  CRIANCA: string;
  TIPO: string;
  IDADE: string;
  NCE: string;
  STATUS: string;
  ID_RESPONSAVEL: string;
  RESPONSAVEL: string;
  TIPO_RESPONSAVEL: string;
  DT_NASCIMENTO_CRIANCA: string;
  SEXO_CRIANCA: string;
  DT_NASCIMENTO_RESPONSAVEL: string;
  SEXO_RESPONSAVEL: string;
  TELEFONE_PRINCIPAL: string;
  EMAIL_PRINCIPAL: string;
  DATA_INSCRICAO: string;
}

interface EventRegisteredsResponse {
  success: boolean;
  eventCode: string;
  registereds: RegisteredChild[];
}

export default function KidsEventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [eventId, setEventId] = useState<string>('');
  const [registereds, setRegistereds] = useState<RegisteredChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventCode, setEventCode] = useState<string>('');
  const [childNameFilter, setChildNameFilter] = useState<string>('');
  const [responsibleNameFilter, setResponsibleNameFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string[]>(['GRATUITO']);

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params;
      setEventId(id);
      fetchRegistereds(id);
    };
    getParams();
  }, [params]);

  const fetchRegistereds = async (id: string) => {
    try {
      const response = await fetchApi<EventRegisteredsResponse>(`kids/events/${id}/registereds`);
      if (response.data) {
        setRegistereds(response.data.registereds || []);
        setEventCode(response.data.eventCode || '');
      }
    } catch (error) {
      console.error('Erro ao buscar inscritos do evento:', error);
      setRegistereds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleExportToExcel = () => {
    if (registereds.length === 0) return;

    const data = registereds.map((child) => ({
      'Criança': child.CRIANCA,
      'Idade': child.IDADE,
      'Sexo': child.SEXO_CRIANCA,
      'Responsável': child.RESPONSAVEL,
      'Tipo Responsável': child.TIPO_RESPONSAVEL,
      'Telefone': child.TELEFONE_PRINCIPAL,
      'Email': child.EMAIL_PRINCIPAL,
      'Data Inscrição': child.DATA_INSCRICAO,
      'Status': child.STATUS,
      'Tipo': child.TIPO,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inscritos');
    XLSX.writeFile(wb, `inscritos_evento_${eventCode}_${eventId}.xlsx`);
  };

  const formatDate = (date: string) => {
    if (!date) return '';

    // Se a data já está no formato brasileiro dd/mm/yyyy hh:mm, retorna como está
    if (/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(date)) {
      return date;
    }

    // Caso contrário, tenta formatar
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return date; // Se não conseguir parsear, retorna original

      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return date; // Em caso de erro, retorna a string original
    }
  };

  const calculateAgeTotals = () => {
    const totals = {
      baby: { male: 0, female: 0, total: 0 },
      start: { male: 0, female: 0, total: 0 },
      middle: { male: 0, female: 0, total: 0 },
      inter: { male: 0, female: 0, total: 0 },
    };

    // Filtrar apenas registros que não estão cancelados
    const activeRegistereds = registereds.filter(child => child.STATUS !== 'CANCELADO');

    activeRegistereds.forEach((child) => {
      const age = parseInt(child.IDADE) || 0;
      const gender = child.SEXO_CRIANCA.toLowerCase();

      if (age >= 1 && age <= 2) {
        if (gender === 'masculino') totals.baby.male++;
        else if (gender === 'feminino') totals.baby.female++;
        totals.baby.total++;
      } else if (age >= 3 && age <= 4) {
        if (gender === 'masculino') totals.start.male++;
        else if (gender === 'feminino') totals.start.female++;
        totals.start.total++;
      } else if (age >= 5 && age <= 7) {
        if (gender === 'masculino') totals.middle.male++;
        else if (gender === 'feminino') totals.middle.female++;
        totals.middle.total++;
      } else if (age >= 8 && age <= 12) {
        if (gender === 'masculino') totals.inter.male++;
        else if (gender === 'feminino') totals.inter.female++;
        totals.inter.total++;
      }
    });

    return totals;
  };

  const ageTotals = calculateAgeTotals();

  const handleStatusFilterChange = (status: string, checked: boolean) => {
    if (checked) {
      setStatusFilter(prev => [...prev, status]);
    } else {
      setStatusFilter(prev => prev.filter(s => s !== status));
    }
  };

  const getFilteredData = () => {
    return registereds.filter((child) => {
      const childNameMatch = childNameFilter === '' || 
        child.CRIANCA.toLowerCase().includes(childNameFilter.toLowerCase());
      const responsibleNameMatch = responsibleNameFilter === '' || 
        child.RESPONSAVEL.toLowerCase().includes(responsibleNameFilter.toLowerCase());
      const statusMatch = statusFilter.length === 0 || statusFilter.includes(child.STATUS);
      
      return childNameMatch && responsibleNameMatch && statusMatch;
    });
  };

  const filteredData = getFilteredData();

  if (loading) {
    return (
      <MainLayout pageTitle="Detalhes do Evento Kids">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle={`Detalhes do Evento - ${eventCode}`}>
      <Box>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            variant="outlined"
          >
            Voltar
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportToExcel}
            disabled={registereds.length === 0}
          >
            Exportar para Excel
          </Button>
        </Box>

        {/* Filtros */}
        <Accordion sx={{ mb: 4 }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="filters-content"
            id="filters-header"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList />
              <Typography variant="h6">Filtros e Ordenação</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                label="Nome da Criança"
                value={childNameFilter}
                onChange={(e) => setChildNameFilter(e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
              />
              <TextField
                label="Nome do Responsável"
                value={responsibleNameFilter}
                onChange={(e) => setResponsibleNameFilter(e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
              />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statusFilter.includes('GRATUITO')}
                      onChange={(e) => handleStatusFilterChange('GRATUITO', e.target.checked)}
                      size="small"
                    />
                  }
                  label="GRATUITO"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statusFilter.includes('CANCELADO')}
                      onChange={(e) => handleStatusFilterChange('CANCELADO', e.target.checked)}
                      size="small"
                    />
                  }
                  label="CANCELADO"
                />
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Totalizadores por Faixa Etária */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Card sx={{ bgcolor: '#e3f2fd', minWidth: 200, flex: 1 }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Total Baby (1-2 anos)
              </Typography>
              <Typography variant="h4" color="primary.main">
                {ageTotals.baby.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {ageTotals.baby.male} meninos, {ageTotals.baby.female} meninas
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ bgcolor: '#f3e5f5', minWidth: 200, flex: 1 }}>
            <CardContent>
              <Typography variant="h6" color="secondary" gutterBottom>
                Total Start (3-4 anos)
              </Typography>
              <Typography variant="h4" color="secondary.main">
                {ageTotals.start.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {ageTotals.start.male} meninos, {ageTotals.start.female} meninas
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ bgcolor: '#e8f5e8', minWidth: 200, flex: 1 }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#2e7d32' }} gutterBottom>
                Total Middle (5-7 anos)
              </Typography>
              <Typography variant="h4" sx={{ color: '#2e7d32' }}>
                {ageTotals.middle.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {ageTotals.middle.male} meninos, {ageTotals.middle.female} meninas
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ bgcolor: '#fff3e0', minWidth: 200, flex: 1 }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#f57c00' }} gutterBottom>
                Total Inter (8-12 anos)
              </Typography>
              <Typography variant="h4" sx={{ color: '#f57c00' }}>
                {ageTotals.inter.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {ageTotals.inter.male} meninos, {ageTotals.inter.female} meninas
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Tabela */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#ff6900', '& .MuiTableCell-head': { color: 'white', fontWeight: 600 } }}>
                <TableCell>Criança</TableCell>
                <TableCell>Idade</TableCell>
                <TableCell>Sexo</TableCell>
                <TableCell>Responsável</TableCell>
                <TableCell>Tipo Responsável</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Data Inscrição</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Tipo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((child, index) => (
                <TableRow key={child.ID_CRIANCA} sx={{ backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(238, 80, 20, 0.04)' }}>
                  <TableCell>{child.CRIANCA}</TableCell>
                  <TableCell>{child.IDADE}</TableCell>
                  <TableCell>{child.SEXO_CRIANCA}</TableCell>
                  <TableCell>{child.RESPONSAVEL}</TableCell>
                  <TableCell>{child.TIPO_RESPONSAVEL}</TableCell>
                  <TableCell>{child.TELEFONE_PRINCIPAL}</TableCell>
                  <TableCell>{child.EMAIL_PRINCIPAL}</TableCell>
                  <TableCell>{formatDate(child.DATA_INSCRICAO)}</TableCell>
                  <TableCell>{child.STATUS}</TableCell>
                  <TableCell>{child.TIPO}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={10} sx={{ fontWeight: 600, textAlign: 'center' }}>
                  Total: {filteredData.length} inscritos {(childNameFilter || responsibleNameFilter) && `(filtrados de ${registereds.length} total)`}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
        {filteredData.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              {registereds.length === 0 ? 'Nenhum inscrito encontrado' : 'Nenhum resultado encontrado com os filtros aplicados'}
            </Typography>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
}