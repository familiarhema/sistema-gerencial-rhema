'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import { fetchApi } from '@/services/api';

interface VolunteerMinistry {
  new_id: string;
  status: string;
  id: number;
  name: string;
}

interface ActiveCell {
  id: string;
  name: string;
}

interface ActiveMinistry {
  id: string;
  name: string;
}

interface Volunteer {
  id: string;
  name: string;
  new_ministeries: VolunteerMinistry[];
  cell_id: string;
  cell_name: string;
  new_cell: boolean;
  startServicedAt: number;
}

interface EditVolunteerModalProps {
  open: boolean;
  onClose: () => void;
  volunteer: Volunteer | null;
  seasonId: string;
  cells: ActiveCell[];
  ministries: ActiveMinistry[];
  onSuccess: () => void;
}

export default function EditVolunteerModal({
  open,
  onClose,
  volunteer,
  seasonId,
  cells,
  ministries,
  onSuccess
}: EditVolunteerModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedCell, setSelectedCell] = useState('');
  const [serviceYear, setServiceYear] = useState('');
  const [selectedMinistries, setSelectedMinistries] = useState<string[]>([]);
  const [ministryStatusChanges, setMinistryStatusChanges] = useState<Record<string, string>>({});
  const [newMinistryToAdd, setNewMinistryToAdd] = useState('');

  useEffect(() => {
    if (open && volunteer) {
      // Preencher dados atuais
      setSelectedCell(volunteer.cell_id || '');
      setServiceYear(volunteer.startServicedAt ? volunteer.startServicedAt.toString() : '');
      setSelectedMinistries([]); // Limpar ministérios adicionados
      setNewMinistryToAdd(''); // Limpar seleção do combo
      setMinistryStatusChanges({}); // Limpar mudanças anteriores
    }
  }, [open, volunteer]);

  const handleApproveMinistry = (ministryId: string) => {
    setMinistryStatusChanges(prev => ({
      ...prev,
      [ministryId]: 'Accepted'
    }));
  };

  const handleRejectMinistry = (ministryId: string) => {
    setMinistryStatusChanges(prev => ({
      ...prev,
      [ministryId]: 'Rejected'
    }));
  };

  const handleAddMinistry = () => {
    if (newMinistryToAdd && !selectedMinistries.includes(newMinistryToAdd)) {
      setSelectedMinistries(prev => [...prev, newMinistryToAdd]);
      setNewMinistryToAdd('');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Preparar dados conforme o DTO UpdateVolunteerSeasonDto
      const ministriesUpdates: Array<{ministry_id: number, status: string}> = [];


      // Adicionar mudanças de status dos ministérios existentes
      Object.entries(ministryStatusChanges).forEach(([ministryNewId, status]) => {
        if (!ministryNewId.startsWith('temp_')) {
          // Ministério existente
          const ministry = volunteer?.new_ministeries.find(m => m.new_id === ministryNewId);
          if (ministry) {
            ministriesUpdates.push({
              ministry_id: ministry.id,
              status: status
            });
          }
        } else {
          // Ministério adicionado
          const ministryId = ministryNewId.replace('temp_', '');
          ministriesUpdates.push({
            ministry_id: parseInt(ministryId),
            status: status
          });
        }
      });

      // Adicionar ministérios novos que não tiveram mudanças de status (ficam como Created)
      selectedMinistries.forEach(ministryId => {
        const tempId = `temp_${ministryId}`;
        if (!ministryStatusChanges[tempId]) {
          ministriesUpdates.push({
            ministry_id: parseInt(ministryId),
            status: 'Created'
          });
        }
      });

      const updateData = {
        startServicedAt: serviceYear ? parseInt(serviceYear) : undefined,
        cell_id: selectedCell || undefined,
        ministries: ministriesUpdates,
      };


      await fetchApi(`seasons/${seasonId}/volunteer/${volunteer?.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar dados do voluntário:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!volunteer) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon />
          Editar Voluntário - {volunteer.name}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Célula e Ano de Serviço */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginTop: '8px'  }}>
            <Box sx={{ flex: 1, minWidth: 200}}>
              <FormControl fullWidth size="small">
                <InputLabel>Célula</InputLabel>
                <Select
                  value={selectedCell}
                  label="Célula"
                  onChange={(e) => setSelectedCell(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Selecione uma célula</em>
                  </MenuItem>
                  {cells.map((cell) => (
                    <MenuItem key={cell.id} value={cell.id}>
                      {cell.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                fullWidth
                label="Sirvo desde (Ano)"
                type="number"
                size="small"
                value={serviceYear}
                onChange={(e) => setServiceYear(e.target.value)}
                inputProps={{ min: 1900, max: new Date().getFullYear() }}
              />
            </Box>
          </Box>

          {/* Status dos Ministérios */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Ministérios
            </Typography>
            <List>
              {volunteer.new_ministeries.map((ministry) => (
                <ListItem
                  key={ministry.new_id}
                  secondaryAction={
                    (ministry.status === 'Created' || ministryStatusChanges[ministry.new_id]) ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleApproveMinistry(ministry.new_id)}
                          color="success"
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRejectMinistry(ministry.new_id)}
                          color="error"
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    ) : null
                  }
                >
                  <ListItemText
                    primary={ministry.name}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={ministryStatusChanges[ministry.new_id] || ministry.status}
                          size="small"
                          color={
                            (ministryStatusChanges[ministry.new_id] || ministry.status) === 'Created' ? 'warning' :
                            (ministryStatusChanges[ministry.new_id] || ministry.status) === 'Accepted' ? 'success' :
                            (ministryStatusChanges[ministry.new_id] || ministry.status) === 'Rejected' ? 'error' : 'default'
                          }
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
              {/* Ministérios adicionados */}
              {selectedMinistries.map((ministryId) => {
                const ministry = ministries.find(m => m.id === ministryId);
                const tempId = `temp_${ministryId}`;
                return (
                  <ListItem
                    key={tempId}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleApproveMinistry(tempId)}
                          color="success"
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRejectMinistry(tempId)}
                          color="error"
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={ministry?.name || ministryId}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip
                            label={ministryStatusChanges[tempId] || 'Created'}
                            size="small"
                            color={
                              (ministryStatusChanges[tempId] || 'Created') === 'Created' ? 'warning' :
                              ministryStatusChanges[tempId] === 'Accepted' ? 'success' :
                              ministryStatusChanges[tempId] === 'Rejected' ? 'error' : 'default'
                            }
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
            {(volunteer.new_ministeries.length === 0 && selectedMinistries.length === 0) && (
              <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                Nenhum ministério associado
              </Typography>
            )}
          </Box>

          {/* Adicionar Ministério */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Adicionar Ministério</InputLabel>
              <Select
                value={newMinistryToAdd}
                label="Adicionar Ministério"
                onChange={(e) => setNewMinistryToAdd(e.target.value)}
              >
                <MenuItem value="">
                  <em>Selecione um ministério</em>
                </MenuItem>
                {ministries
                  .filter(ministry => !selectedMinistries.includes(ministry.id) &&
                    !volunteer.new_ministeries.some(vm => vm.id.toString() === ministry.id))
                  .map((ministry) => (
                    <MenuItem key={ministry.id} value={ministry.id}>
                      {ministry.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={handleAddMinistry}
              disabled={!newMinistryToAdd}
              size="small"
            >
              Adicionar
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}