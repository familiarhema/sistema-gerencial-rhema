'use client';

import { useState } from 'react';
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
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';

interface VolunteerMinistry {
  new_id: string;
  status: string;
  id: number;
  name: string;
}

interface Volunteer {
  id: string;
  name: string;
  new_ministeries: VolunteerMinistry[];
}

interface ApproveMinisteriesModalProps {
  open: boolean;
  onClose: () => void;
  volunteer: Volunteer | null;
}

export default function ApproveMinisteriesModal({ 
  open, 
  onClose, 
  volunteer 
}: ApproveMinisteriesModalProps) {
  const [approving, setApproving] = useState<string[]>([]);

  const handleApprove = async (ministryId: string) => {
    setApproving(prev => [...prev, ministryId]);
    // TODO: Implementar a chamada à API para aprovar o ministério
    // await approveMinistry(ministryId);
    setApproving(prev => prev.filter(id => id !== ministryId));
  };

  if (!volunteer) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Aprovar Ministérios - {volunteer.name}
      </DialogTitle>
      <DialogContent>
        <List>
          {volunteer.new_ministeries.map((ministry) => (
            <ListItem
              key={ministry.new_id}
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => handleApprove(ministry.new_id)}
                  disabled={approving.includes(ministry.new_id)}
                  color="primary"
                >
                  <CheckIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={ministry.name}
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Chip
                      label={ministry.status}
                      size="small"
                      color={ministry.status === 'Created' ? 'warning' : 'success'}
                    />
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
        {volunteer.new_ministeries.length === 0 && (
          <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
            Nenhum ministério pendente de aprovação
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}