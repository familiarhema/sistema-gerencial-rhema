'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Box, Typography, Paper, LinearProgress, Button } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import MainLayout from '@/components/MainLayout';
import { fetchApi } from '@/services/api';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface VolunteersByMinistry {
  ministryName: string;
  total: number;
}

interface VolunteersByCell {
  cellName: string;
  total: number;
}

interface VolunteersNewVsOld {
  novo: number;
  antigo: number;
}

interface VolunteersByAgeGroup {
  ageGroup: string;
  total: number;
}

export default function SeasonDashboardPage() {
  const params = useParams();
  const seasonId = params.id as string;
  const router = useRouter();

  const [volunteersByMinistry, setVolunteersByMinistry] = useState<VolunteersByMinistry[]>([]);
  const [volunteersByCell, setVolunteersByCell] = useState<VolunteersByCell[]>([]);
  const [volunteersNewVsOld, setVolunteersNewVsOld] = useState<VolunteersNewVsOld | null>(null);
  const [volunteersByAgeGroup, setVolunteersByAgeGroup] = useState<VolunteersByAgeGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (seasonId) {
      fetchDashboardData();
    }
  }, [seasonId]);

  const fetchDashboardData = async () => {
    try {
      const [ministryRes, cellRes, newOldRes, ageRes] = await Promise.all([
        fetchApi<VolunteersByMinistry[]>(`seasons/${seasonId}/volunteers-by-ministry`),
        fetchApi<VolunteersByCell[]>(`seasons/${seasonId}/volunteers-by-cell`),
        fetchApi<VolunteersNewVsOld>(`seasons/${seasonId}/volunteers-new-vs-old`),
        fetchApi<VolunteersByAgeGroup[]>(`seasons/${seasonId}/volunteers-by-age-group`),
      ]);

      setVolunteersByMinistry(ministryRes.data || []);
      setVolunteersByCell(cellRes.data || []);
      setVolunteersNewVsOld(newOldRes.data || null);
      setVolunteersByAgeGroup(ageRes.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout pageTitle="Dashboard da Temporada">
        <Typography>Carregando...</Typography>
      </MainLayout>
    );
  }

  const handleBack = () => {
    router.back();
  };

  return (
    <MainLayout pageTitle="Dashboard da Temporada">
      <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBack}
              variant="outlined"
            >
              Voltar
            </Button>
          </Box>
        {/* Outros gráficos em grid */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 45%', minWidth: '350px' }}>
            
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  color: '#2c3e50', 
                  fontWeight: 600,
                  textAlign: 'center'
                }}
              >
                Voluntários por Célula
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {volunteersByCell.map((cell, index) => {
                  const maxValue = Math.max(...volunteersByCell.map(c => c.total));
                  const percentage = (cell.total / maxValue) * 100;
                  
                  return (
                    <Box key={index} sx={{ width: '100%' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 1 
                      }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#2c3e50',
                            flex: 1,
                            mr: 2
                          }}
                        >
                          {cell.cellName}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 'bold', 
                            color: '#a8dadc',
                            minWidth: '40px',
                            textAlign: 'right'
                          }}
                        >
                          {cell.total}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: '#f0f0f0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#a8dadc',
                            borderRadius: 12,
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Box>

          <Box sx={{ flex: '1 1 45%', minWidth: '350px' }}>
          <Box sx={{ flex: '1 1 100%', minWidth: '350px' }}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fff8 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  color: '#2c3e50', 
                  fontWeight: 600,
                  textAlign: 'center'
                }}
              >
                Novos vs Antigos
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {volunteersNewVsOld && (
                  <PieChart width={350} height={300}>
                    <Pie
                      data={[
                        { name: 'Novos', value: volunteersNewVsOld.novo },
                        { name: 'Antigos', value: volunteersNewVsOld.antigo },
                      ]}
                      cx={175}
                      cy={150}
                      labelLine={false}
                      label={({ name, percent }) => 
                        `${name} ${percent ? Math.round(Number(percent) * 100) : 0}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#ffd6a5" />
                      <Cell fill="#caffbf" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }}
                    />
                  </PieChart>
                )}
              </Box>
            </Paper>
          </Box>

          <Box sx={{ flex: '1 1 100%', minWidth: '350px', mt: 2 }}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #fff8f8 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  color: '#2c3e50', 
                  fontWeight: 600,
                  textAlign: 'center'
                }}
              >
                Voluntários por Ministério
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {volunteersByMinistry.map((ministry, index) => {
                  const maxValue = Math.max(...volunteersByMinistry.map(m => m.total));
                  const percentage = (ministry.total / maxValue) * 100;
                  
                  return (
                    <Box key={index} sx={{ width: '100%' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 1 
                      }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#2c3e50',
                            flex: 1,
                            mr: 2
                          }}
                        >
                          {ministry.ministryName}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 'bold', 
                            color: '#f4a261',
                            minWidth: '40px',
                            textAlign: 'right'
                          }}
                        >
                          {ministry.total}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: '#f0f0f0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#f4a261',
                            borderRadius: 12,
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Box>

          <Box sx={{ flex: '1 1 100%', minWidth: '350px', mt: 2 }}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #fff8ff 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  color: '#2c3e50', 
                  fontWeight: 600,
                  textAlign: 'center'
                }}
              >
                Voluntários por Faixa Etária
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <BarChart width={800} height={350} data={volunteersByAgeGroup}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="ageGroup" 
                    stroke="#6c757d"
                    fontSize={12}
                  />
                  <YAxis stroke="#6c757d" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="total" fill="#cdb4db" radius={[4, 4, 0, 0]} />
                </BarChart>
              </Box>
            </Paper>
          </Box>
        </Box>
        </Box>
      </Box>
    </MainLayout>
  );
}