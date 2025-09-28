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
  Tooltip,
  Chip,
} from '@mui/material';
import { ArrowBack, CheckCircle, Delete, FileDownload, Edit, Block, Info, Cancel } from '@mui/icons-material';
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
  birth_date: string;
  new_phone: string;
  new_email: string;
  cell_name: string;
  cell_id: string;
  new_cell: boolean;
  history_id: string;
  new_ministeries: VolunteerMinistry[];
  is_new_volunteer: boolean;
  startServicedAt: number;
  blockedManager: boolean;
  reason?: string;
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
  const [blockedManagerFilter, setBlockedManagerFilter] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [selectedVolunteerToRemove, setSelectedVolunteerToRemove] = useState<Volunteer | null>(null);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [seasonId, setSeasonId] = useState<string>('');
  const [batchApprovalEnabled, setBatchApprovalEnabled] = useState(false);
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);
  const [openBatchApprovalModal, setOpenBatchApprovalModal] = useState(false);
  const [selectedVolunteerToBlock, setSelectedVolunteerToBlock] = useState<Volunteer | null>(null);
  const [openBlockModal, setOpenBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [selectedMinistryForApproval, setSelectedMinistryForApproval] = useState<{ volunteer: Volunteer; ministry: VolunteerMinistry } | null>(null);
  const [openMinistryApprovalModal, setOpenMinistryApprovalModal] = useState(false);

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
      if (blockedManagerFilter !== null) queryParams.append('blockedManager', blockedManagerFilter.toString());

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
      if (blockedManagerFilter !== null) initialQueryParams.append('blockedManager', blockedManagerFilter.toString());

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
        if (blockedManagerFilter !== null) queryParams.append('blockedManager', blockedManagerFilter.toString());

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
        'Data de Nascimento': formatDate(volunteer.birth_date),
        'Célula': volunteer.cell_name,
        'Novo Voluntário': volunteer.is_new_volunteer ? 'Sim' : 'Não',
        'Ministérios': volunteer.new_ministeries?.map(m => m.name).join(', ') || '',
        'Bloqueado': volunteer.blockedManager ? 'Sim' : 'Não',
        'Motivo do Bloqueio': volunteer.reason || ''
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
        { wch: 20 }, // Data de Nascimento
        { wch: 20 }, // Célula
        { wch: 15 }, // Novo Voluntário
        { wch: 40 }, // Ministérios
        { wch: 10 }, // Bloqueado
        { wch: 30 }  // Motivo do Bloqueio
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
    setBatchApprovalEnabled(!!ministryFilter); // Habilitar apenas se ministério foi selecionado
    setSelectedVolunteers([]); // Limpar seleções ao filtrar
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

  const handleVolunteerSelection = (volunteerId: string) => {
    setSelectedVolunteers(prev => 
      prev.includes(volunteerId) 
        ? prev.filter(id => id !== volunteerId)
        : [...prev, volunteerId]
    );
  };

  const handleBatchApproval = async () => {
    if (!ministryFilter || selectedVolunteers.length === 0) return;

    try {
      await fetchApi(`volunteers/season/${seasonId}/ministry/${ministryFilter}/approve`, {
        method: 'POST',
        body: JSON.stringify({ volunteerIds: selectedVolunteers }),
      });

      // Limpar seleções e fechar modal
      setSelectedVolunteers([]);
      setOpenBatchApprovalModal(false);
      
      // Recarregar a tabela
      fetchVolunteers();
    } catch (error) {
      console.error('Erro ao aprovar voluntários em lote:', error);
    }
  };

  const handleCloseBatchApprovalModal = () => {
    setOpenBatchApprovalModal(false);
  };

  const handleBlockVolunteer = (volunteer: Volunteer) => {
    setSelectedVolunteerToBlock(volunteer);
    setOpenBlockModal(true);
  };

  const handleConfirmBlock = async () => {
    if (!selectedVolunteerToBlock || !blockReason.trim()) return;

    try {
      const { id } = await params;
      await fetchApi(`volunteers/${selectedVolunteerToBlock.id}/season/${id}/block`, {
        method: 'PUT',
        body: JSON.stringify({ reason: blockReason }),
      });

      // Recarregar a tabela
      fetchVolunteers();
      setOpenBlockModal(false);
      setSelectedVolunteerToBlock(null);
      setBlockReason('');
    } catch (error) {
      console.error('Erro ao bloquear voluntário:', error);
    }
  };

  const handleCloseBlockModal = () => {
    setOpenBlockModal(false);
    setSelectedVolunteerToBlock(null);
    setBlockReason('');
  };

  const handleMinistryClick = (volunteer: Volunteer, ministry: VolunteerMinistry) => {
    if (ministry.status === 'Created') {
      setSelectedMinistryForApproval({ volunteer, ministry });
      setOpenMinistryApprovalModal(true);
    }
  };

  const handleApproveMinistry = async () => {
    if (!selectedMinistryForApproval) return;

    try {
      await fetchApi(`volunteers/${selectedMinistryForApproval.volunteer.id}/season/${seasonId}/ministry/${selectedMinistryForApproval.ministry.id}/approve`, {
        method: 'PUT',
      });

      // Fechar modal e recarregar dados
      setOpenMinistryApprovalModal(false);
      setSelectedMinistryForApproval(null);
      fetchVolunteers();
    } catch (error) {
      console.error('Erro ao aprovar ministério:', error);
    }
  };

  const handleDisapproveMinistry = async () => {
    if (!selectedMinistryForApproval) return;

    try {
      await fetchApi(`volunteers/${selectedMinistryForApproval.volunteer.id}/season/${seasonId}/ministry/${selectedMinistryForApproval.ministry.id}/disapprove`, {
        method: 'PUT',
      });

      // Fechar modal e recarregar dados
      setOpenMinistryApprovalModal(false);
      setSelectedMinistryForApproval(null);
      fetchVolunteers();
    } catch (error) {
      console.error('Erro ao reprovar ministério:', error);
    }
  };

  const handleCloseMinistryApprovalModal = () => {
    setOpenMinistryApprovalModal(false);
    setSelectedMinistryForApproval(null);
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
                onChange={(e) => {
                  setMinistryFilter(e.target.value);
                  setBatchApprovalEnabled(false); // Desabilitar quando o combo for alterado
                  setSelectedVolunteers([]); // Limpar seleções
                }}
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={blockedManagerFilter === true}
                  onChange={(e) => setBlockedManagerFilter(e.target.checked ? true : null)}
                  size="small"
                />
              }
              label="Bloqueado"
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
            {batchApprovalEnabled && (
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={() => setOpenBatchApprovalModal(true)}
                size="small"
                color="success"
                disabled={selectedVolunteers.length === 0}
              >
                Aprovar Selecionados ({selectedVolunteers.length})
              </Button>
            )}
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
                <TableCell>Selecionar</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data de Registro</TableCell>
                <TableCell>Data de Nascimento</TableCell>
                <TableCell>Ministérios</TableCell>
                <TableCell>Voluntário Novo</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                      Carregando voluntários...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : volunteers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
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
                      ...(volunteer.blockedManager && {
                        border: '2px solid #d32f2f',
                        backgroundColor: 'rgba(211, 47, 47, 0.08)',
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.12)',
                        },
                      }),
                    }}
                  >
                    <TableCell>
                      {batchApprovalEnabled && (
                        <Checkbox
                          checked={selectedVolunteers.includes(volunteer.id)}
                          onChange={() => handleVolunteerSelection(volunteer.id)}
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {volunteer.name}
                        {volunteer.blockedManager && volunteer.reason && (
                          <Tooltip title={`Motivo do bloqueio: ${volunteer.reason}`} arrow>
                            <Info color="error" fontSize="small" />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{volunteer.email}</TableCell>
                    <TableCell>{volunteer.new_phone}</TableCell>
                    <TableCell>{volunteer.status}</TableCell>
                    <TableCell>{formatDate(volunteer.registration_date)}</TableCell>
                    <TableCell>{formatDate(volunteer.birth_date)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {volunteer.new_ministeries?.filter(m => m.status !== 'Rejected').map((ministry, idx) => (
                          <Chip
                            key={idx}
                            label={ministry.name}
                            size="small"
                            color={
                              ministry.status === 'Created' ? 'warning' :
                              ministry.status === 'Accepted' ? 'success' : 'error'
                            }
                            onClick={() => handleMinistryClick(volunteer, ministry)}
                            sx={{
                              cursor: ministry.status === 'Created' ? 'pointer' : 'default',
                              '&:hover': ministry.status === 'Created' ? {
                                opacity: 0.8,
                              } : {},
                            }}
                          />
                        )) || ''}
                      </Box>
                    </TableCell>
                    <TableCell>{volunteer.is_new_volunteer ? 'Sim' : 'Não'}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenModal(volunteer)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="warning" onClick={() => handleBlockVolunteer(volunteer)}>
                        <Block />
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

        {/* Modal de Confirmação de Aprovação em Lote */}
        <Dialog
          open={openBatchApprovalModal}
          onClose={handleCloseBatchApprovalModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirmar Aprovação em Lote</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Você está prestes a aprovar {selectedVolunteers.length} voluntário(s) para o ministério selecionado.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Voluntários que serão aprovados:
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
              {selectedVolunteers.map(volunteerId => {
                const volunteer = volunteers.find(v => v.id === volunteerId);
                return volunteer ? (
                  <Typography key={volunteerId} variant="body2" sx={{ py: 0.5 }}>
                    • {volunteer.name}
                  </Typography>
                ) : null;
              })}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBatchApprovalModal} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleBatchApproval} color="success" variant="contained">
              Confirmar Aprovação
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de Bloqueio de Voluntário */}
        <Dialog
          open={openBlockModal}
          onClose={handleCloseBlockModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Bloquear Voluntário</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Você está prestes a bloquear o voluntário "{selectedVolunteerToBlock?.name}".
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Informe o motivo do bloqueio:
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Motivo do bloqueio"
              fullWidth
              multiline
              rows={4}
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              variant="outlined"
              placeholder="Digite o motivo do bloqueio..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBlockModal} color="primary">
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmBlock} 
              color="warning" 
              variant="contained"
              disabled={!blockReason.trim()}
            >
              Confirmar Bloqueio
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de Aprovação/Reprovação de Ministério */}
        <Dialog
          open={openMinistryApprovalModal}
          onClose={handleCloseMinistryApprovalModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Aprovar ou Reprovar Ministério</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Voluntário: <strong>{selectedMinistryForApproval?.volunteer.name}</strong>
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Ministério: <strong>{selectedMinistryForApproval?.ministry.name}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Escolha uma ação para este ministério:
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMinistryApprovalModal} color="primary">
              Cancelar
            </Button>
            <Button
              onClick={handleDisapproveMinistry}
              color="error"
              variant="contained"
              startIcon={<Cancel />}
            >
              Reprovar
            </Button>
            <Button
              onClick={handleApproveMinistry}
              color="success"
              variant="contained"
              startIcon={<CheckCircle />}
            >
              Aprovar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}