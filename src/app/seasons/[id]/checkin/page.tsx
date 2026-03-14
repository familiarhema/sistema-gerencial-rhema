'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { ArrowBack, CheckCircle, CheckCircleOutline } from '@mui/icons-material';
import { fetchApi } from '@/services/api';
import MainLayout from '@/components/MainLayout';

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
  new_ministeries: any[];
  is_new_volunteer: boolean;
  startServicedAt: number;
  blockedManager: boolean;
  reason?: string;
  attendedVolunteersDay?: boolean;
}

interface VolunteersResponse {
  items: Volunteer[];
  total: number;
  page: string;
  totalPages: number;
}

export default function SeasonCheckinPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(50);
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [checkinFilter, setCheckinFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [seasonId, setSeasonId] = useState<string>('');
  const [checkinLoading, setCheckinLoading] = useState<string | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params;
      setSeasonId(id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (seasonId) {
      fetchVolunteers();
    }
  }, [seasonId]);

  useEffect(() => {
    fetchVolunteers();
  }, [page]);

 
  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
      });

      if (nameFilter) queryParams.append('name', nameFilter);
      if (emailFilter) queryParams.append('email', emailFilter);
      if (phoneFilter) queryParams.append('phone', phoneFilter);
      if (checkinFilter === 'pending') queryParams.append('attendedVolunteersDay', 'false');
      if (checkinFilter === 'done') queryParams.append('attendedVolunteersDay', 'true');

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

  const handleFilter = () => {
    setPage(0);
    fetchVolunteers();
  };

  const handleCheckin = async (volunteer: Volunteer) => {
    try {
      setCheckinLoading(volunteer.id);
      await fetchApi(`volunteers/${volunteer.id}/season/${seasonId}/attended-volunteers-day`, {
        method: 'PUT',
        body: JSON.stringify({ attended: true }),
      });

      // Recarregar a tabela para atualizar o status
      fetchVolunteers();
    } catch (error) {
      console.error('Erro ao fazer check-in:', error);
    } finally {
      setCheckinLoading(null);
    }
  };

  return (
    <MainLayout pageTitle="Check-in de Voluntários">
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
            <TextField
              label="Telefone"
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
              size="small"
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status Check-in</InputLabel>
              <Select
                value={checkinFilter}
                label="Status Check-in"
                onChange={(e) => setCheckinFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pending">Pendente</MenuItem>
                <MenuItem value="done">Check-in feito</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleFilter}
              size="small"
            >
              Filtrar
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
                <TableCell align="center">Check-in</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                      Carregando voluntários...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : volunteers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
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
                      ...(volunteer.attendedVolunteersDay && {
                        backgroundColor: 'rgba(76, 175, 80, 0.08)',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.12)',
                        },
                      }),
                    }}
                  >
                    <TableCell>{volunteer.name}</TableCell>
                    <TableCell>{volunteer.email}</TableCell>
                    <TableCell>{volunteer.new_phone}</TableCell>
                    <TableCell align="center">
                      <Tooltip title={volunteer.attendedVolunteersDay ? "Check-in realizado" : "Fazer check-in"}>
                        <IconButton
                          color={volunteer.attendedVolunteersDay ? "success" : "default"}
                          onClick={() => handleCheckin(volunteer)}
                          size="small"
                          disabled={checkinLoading === volunteer.id || volunteer.attendedVolunteersDay}
                        >
                          {checkinLoading === volunteer.id ? (
                            <CircularProgress size={20} />
                          ) : volunteer.attendedVolunteersDay ? (
                            <CheckCircle />
                          ) : (
                            <CheckCircleOutline />
                          )}
                        </IconButton>
                      </Tooltip>
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
      </Box>
    </MainLayout>
  );
}