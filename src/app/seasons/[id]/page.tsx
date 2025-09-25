'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
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
  TablePagination,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, CheckCircle, Delete, FileDownload, Edit } from '@mui/icons-material';
import { fetchApi } from '@/services/api';
import MainLayout from '@/components/MainLayout';
import EditVolunteerModal from './EditVolunteerModal';

interface ActiveMinistry {
  id: string;
  name: string;
}

interface ActiveCell {
  id: string;
  name: string;
}

interface VolunteerMinistry {
  new_id: string;
  status: string;
  id: number;
  name: string;
}

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  registration_date: string;
  new_phone: string;
  new_email: string;
  cell_name: string;
  cell_id: string;
  new_cell: boolean;
  history_id: string;
  new_ministeries: VolunteerMinistry[];
  is_new_volunteer: boolean;
  startServicedAt: number;
}

interface VolunteersResponse {
  items: Volunteer[];
  total: number;
  page: string;
  totalPages: number;
}

export default function SeasonPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [ministries, setMinistries] = useState<ActiveMinistry[]>([]);
  const [cells, setCells] = useState<ActiveCell[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(50);
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [ministryFilter, setMinistryFilter] = useState('');
  const [voluntarioNovoFilter, setVoluntarioNovoFilter] = useState<boolean | null>(null);
  const [pendingApproveFilter, setPendingApproveFilter] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [selectedVolunteerToRemove, setSelectedVolunteerToRemove] = useState<Volunteer | null>(null);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [seasonId, setSeasonId] = useState<string>('');

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params;
      setSeasonId(id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (seasonId) {
      fetchMinistries();
      fetchCells();
      fetchVolunteers(); // Chamar uma vez na inicialização
    }
  }, [seasonId]);

  useEffect(() => {
    fetchVolunteers();
  }, [page]); // Manter apenas para paginação

  const fetchMinistries = async () => {
    try {
      const response = await fetchApi<ActiveMinistry[]>('ministries/active');
      setMinistries(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar ministérios:', error);
    }
  };

  const fetchCells = async () => {
    try {
      const response = await fetchApi<ActiveCell[]>('cells/active');
      setCells(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar células:', error);
    }
  };

  const fetchVolunteers = async () => {
    try {

      setLoading(true);
      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
      });

      if (nameFilter) queryParams.append('name', nameFilter);
      if (emailFilter) queryParams.append('email', emailFilter);
      if (ministryFilter) queryParams.append('ministerioId', ministryFilter);
      if (voluntarioNovoFilter !== null) queryParams.append('voluntarioNovo', voluntarioNovoFilter.toString());
      if (pendingApproveFilter !== null) queryParams.append('pendingApprove', pendingApproveFilter.toString());

      const { id } = await params;

      const response = await fetchApi<VolunteersResponse>(`volunteers/season/${id}?${queryParams.toString()}`);

      if (response.data) {
        setVolunteers(response.data.items);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('Erro ao buscar voluntários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleExportExcel = async () => {
    try {
      const { id } = await params;
      const allVolunteers: Volunteer[] = [];
      
      // Primeiro, obter o total de páginas fazendo uma chamada inicial
      const initialQueryParams = new URLSearchParams({
        page: '1',
      });

      if (nameFilter) initialQueryParams.append('name', nameFilter);
      if (emailFilter) initialQueryParams.append('email', emailFilter);
      if (ministryFilter) initialQueryParams.append('ministerioId', ministryFilter);
      if (voluntarioNovoFilter !== null) initialQueryParams.append('voluntarioNovo', voluntarioNovoFilter.toString());
      if (pendingApproveFilter !== null) initialQueryParams.append('pendingApprove', pendingApproveFilter.toString());

      const initialResponse = await fetchApi<VolunteersResponse>(`volunteers/season/${id}?${initialQueryParams.toString()}`);
      
      if (!initialResponse.data) {
        throw new Error('Erro ao obter dados iniciais');
      }

      const totalPages = initialResponse.data.totalPages;
      allVolunteers.push(...initialResponse.data.items);

      // Fazer chamadas para as páginas restantes
      for (let pageNum = 2; pageNum <= totalPages; pageNum++) {
        const queryParams = new URLSearchParams({
          page: pageNum.toString(),
        });

        if (nameFilter) queryParams.append('name', nameFilter);
        if (emailFilter) queryParams.append('email', emailFilter);
        if (ministryFilter) queryParams.append('ministerioId', ministryFilter);
        if (voluntarioNovoFilter !== null) queryParams.append('voluntarioNovo', voluntarioNovoFilter.toString());
        if (pendingApproveFilter !== null) queryParams.append('pendingApprove', pendingApproveFilter.toString());

        const response = await fetchApi<VolunteersResponse>(`volunteers/season/${id}?${queryParams.toString()}`);
        
        if (response.data) {
          allVolunteers.push(...response.data.items);
        }
      }

      // Preparar dados para Excel
      const excelData = allVolunteers.map(volunteer => ({
        'Nome': volunteer.name,
        'Email': volunteer.email,
        'Telefone': volunteer.new_phone,
        'Status': volunteer.status,
        'Data de Registro': formatDate(volunteer.registration_date),
        'Célula': volunteer.cell_name,
        'Novo Voluntário': volunteer.new_cell ? 'Sim' : 'Não',
        'Ministérios': volunteer.new_ministeries?.map(m => m.name).join(', ') || ''
      }));

      // Criar workbook e worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Ajustar largura das colunas
      const colWidths = [
        { wch: 30 }, // Nome
        { wch: 35 }, // Email
        { wch: 15 }, // Telefone
        { wch: 10 }, // Status
        { wch: 15 }, // Data de Registro
        { wch: 20 }, // Célula
        { wch: 15 }, // Novo Voluntário
        { wch: 40 }  // Ministérios
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Voluntários');

      // Gerar arquivo e fazer download
      const fileName = `voluntarios_temporada_${id}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      // Aqui você pode adicionar uma notificação de erro para o usuário
    }
  };

  const handleFilter = () => {
    setPage(0); // Resetar para primeira página
    fetchVolunteers();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleOpenModal = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
  };

  const handleCloseModal = () => {
    setSelectedVolunteer(null);
  };

  const handleRemoveVolunteer = (volunteer: Volunteer) => {
    setSelectedVolunteerToRemove(volunteer);
    setOpenConfirmModal(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedVolunteerToRemove) return;
    try {
      const { id } = await params;
      await fetchApi(`volunteers/${selectedVolunteerToRemove.id}/season/${id}`, {
        method: 'DELETE',
      });
      // Recarregar a tabela
      fetchVolunteers();
      setOpenConfirmModal(false);
      setSelectedVolunteerToRemove(null);
    } catch (error) {
      console.error('Erro ao desinscrever voluntário:', error);
    }
  };

  const handleCloseConfirmModal = () => {
    setOpenConfirmModal(false);
    setSelectedVolunteerToRemove(null);
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
        </Box>

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 2 }}>
          {/* Primeira linha: Filtros */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
            <TextField
              label="Nome"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              size="small"
            />
            <TextField
              label="Email"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              size="small"
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Ministério</InputLabel>
              <Select
                value={ministryFilter}
                label="Ministério"
                onChange={(e) => setMinistryFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {ministries.map((ministry) => (
                  <MenuItem key={ministry.id} value={ministry.id}>
                    {ministry.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={voluntarioNovoFilter === true}
                  onChange={(e) => setVoluntarioNovoFilter(e.target.checked ? true : null)}
                  size="small"
                />
              }
              label="Voluntário Novo"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={pendingApproveFilter === true}
                  onChange={(e) => setPendingApproveFilter(e.target.checked ? true : null)}
                  size="small"
                />
              }
              label="Pendente Aprovação"
            />
          </Box>

          {/* Segunda linha: Botões alinhados à direita */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleFilter}
              size="small"
            >
              Filtrar
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={handleExportExcel}
              size="small"
              color="success"
            >
              Exportar Excel
            </Button>
          </Box>
        </Paper>

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
                <TableCell>Email</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data de Registro</TableCell>
                <TableCell>Ministérios</TableCell>
                <TableCell>Voluntário Novo</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                      Carregando voluntários...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : volunteers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography variant="h6" color="text.secondary">
                      Nenhum voluntário encontrado
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Tente ajustar os filtros ou cadastre novos voluntários.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                volunteers.map((volunteer, index) => (
                  <TableRow 
                    key={volunteer.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(238, 80, 20, 0.04)',
                      '&:hover': {
                        backgroundColor: 'rgba(238, 80, 20, 0.08)',
                      },
                    }}
                  >
                    <TableCell>{volunteer.name}</TableCell>
                    <TableCell>{volunteer.email}</TableCell>
                    <TableCell>{volunteer.new_phone}</TableCell>
                    <TableCell>{volunteer.status}</TableCell>
                    <TableCell>{formatDate(volunteer.registration_date)}</TableCell>
                    <TableCell>{volunteer.new_ministeries?.filter(m => m.status !== 'Rejected').map(m => m.name).join(', ') || ''}</TableCell>
                    <TableCell>{volunteer.is_new_volunteer ? 'Sim' : 'Não'}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenModal(volunteer)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleRemoveVolunteer(volunteer)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[50]}
          />
        </TableContainer>

        {/* Modal de Edição de Voluntário */}
        <EditVolunteerModal
          open={selectedVolunteer !== null}
          onClose={handleCloseModal}
          volunteer={selectedVolunteer}
          seasonId={seasonId}
          cells={cells}
          ministries={ministries}
          onSuccess={() => {
            handleCloseModal();
            fetchVolunteers();
          }}
        />

        {/* Modal de Confirmação de Remoção */}
        <Dialog
          open={openConfirmModal}
          onClose={handleCloseConfirmModal}
        >
          <DialogTitle>Confirmar Remoção</DialogTitle>
          <DialogContent>
            <Typography>
              Tem certeza que deseja desinscrever o voluntário "{selectedVolunteerToRemove?.name}" da temporada?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirmModal} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleConfirmRemove} color="error" variant="contained">
              Remover
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}