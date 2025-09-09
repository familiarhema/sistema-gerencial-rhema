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
} from '@mui/material';
import { ArrowBack, CheckCircle } from '@mui/icons-material';
import { fetchApi } from '@/services/api';
import MainLayout from '@/components/MainLayout';
import ApproveMinisteriesModal from './ApproveMinisteriesModal';

interface ActiveMinistry {
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
  new_cell: boolean;
  history_id: string;
  new_ministeries: VolunteerMinistry[];
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
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [ministryFilter, setMinistryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);

  useEffect(() => {
    fetchMinistries();
  }, []);

  useEffect(() => {
    fetchVolunteers();
  }, [page, nameFilter, emailFilter, ministryFilter]);

  const fetchMinistries = async () => {
    try {
      const response = await fetchApi<ActiveMinistry[]>('ministries/active');
      setMinistries(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar ministérios:', error);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
      });

      if (nameFilter) queryParams.append('name', nameFilter);
      if (emailFilter) queryParams.append('email', emailFilter);
      if (ministryFilter) queryParams.append('ministerioId', ministryFilter);

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleOpenModal = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
  };

  const handleCloseModal = () => {
    setSelectedVolunteer(null);
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
          <Box sx={{ display: 'flex', gap: 2 }}>
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
          </Box>
        </Paper>

        {/* Tabela */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data de Registro</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {volunteers.map((volunteer) => (
                <TableRow key={volunteer.id}>
                  <TableCell>{volunteer.name}</TableCell>
                  <TableCell>{volunteer.email}</TableCell>
                  <TableCell>{volunteer.new_phone}</TableCell>
                  <TableCell>{volunteer.status}</TableCell>
                  <TableCell>{formatDate(volunteer.registration_date)}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenModal(volunteer)}>
                      <CheckCircle />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10]}
          />
        </TableContainer>

        {/* Modal de Aprovação de Ministérios */}
        <ApproveMinisteriesModal
          open={selectedVolunteer !== null}
          onClose={handleCloseModal}
          volunteer={selectedVolunteer}
        />
      </Box>
    </MainLayout>
  );
}