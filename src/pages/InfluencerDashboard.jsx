
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Influencer } from '@/api/entities';
import { CommissionRate } from '@/api/entities';
import { InfluencerCommission } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BackButton from '@/components/ui/BackButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash, 
  Search, 
  Loader2, 
  Check, 
  X, 
  Plus, 
  CreditCard, 
  DollarSign, 
  RefreshCw,
  PercentCircle,
  BarChart,
  ListFilter,
  CalendarDays
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function InfluencerDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [influencers, setInfluencers] = useState([]);
  const [commissionRates, setCommissionRates] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [filteredCommissions, setFilteredCommissions] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCommissionDialog, setShowCommissionDialog] = useState(false);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [formError, setFormError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterInfluencer, setFilterInfluencer] = useState('all');
  const [filterPlanType, setFilterPlanType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [newInfluencer, setNewInfluencer] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    social_channel: {
      type: 'instagram',
      username: ''
    },
    user_id: '',
    code: '',
    pix_key: '',
    pix_key_type: 'CPF'
  });
  
  const [newCommission, setNewCommission] = useState({
    influencer_id: '',
    user_id: '',
    plan_type: 'club',
    plan_name: '',
    plan_amount: 0,
    commission_percentage: 0,
    commission_amount: 0,
    payment_date: new Date().toISOString().split('T')[0]
  });
  
  const [newRate, setNewRate] = useState({
    plan_type: 'club',
    commission_percentage: 10,
    description: '',
    is_active: true
  });

  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await User.me();
        if (user && user.role === 'admin') {
          setIsAdmin(true);
          await loadData();
        } else {
          navigate('/Public');
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        navigate('/Public');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdmin();
  }, [navigate]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      const influencerData = await Influencer.list();
      setInfluencers(influencerData || []);
      
      const ratesData = await CommissionRate.list();
      setCommissionRates(ratesData || []);
      
      const commissionsData = await InfluencerCommission.list();
      setCommissions(commissionsData || []);
      setFilteredCommissions(commissionsData || []);
      
      const requests = [];
      influencerData.forEach(influencer => {
        if (influencer.payout_requests && influencer.payout_requests.length > 0) {
          influencer.payout_requests.forEach(request => {
            if (request.status === 'pending') {
              requests.push({
                ...request,
                influencer_id: influencer.id,
                influencer_name: influencer.name
              });
            }
          });
        }
      });
      setPayoutRequests(requests);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    let filtered = [...commissions];
    
    if (filterInfluencer !== 'all') {
      filtered = filtered.filter(comm => comm.influencer_id === filterInfluencer);
    }
    
    if (filterPlanType !== 'all') {
      filtered = filtered.filter(comm => comm.plan_type === filterPlanType);
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(comm => comm.status === filterStatus);
    }
    
    setFilteredCommissions(filtered);
  }, [filterInfluencer, filterPlanType, filterStatus, commissions]);
  
  const generateReferralCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };
  
  const handleAddInfluencer = async () => {
    setFormError('');
    setSaveSuccess('');
    
    if (!newInfluencer.name || !newInfluencer.email || !newInfluencer.phone || !newInfluencer.city || !newInfluencer.social_channel.username) {
      setFormError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const influencerCode = newInfluencer.code || generateReferralCode();
      
      const createdInfluencer = await Influencer.create({
        ...newInfluencer,
        code: influencerCode,
      });
      
      setSaveSuccess('Influenciador adicionado com sucesso!');
      setShowAddDialog(false);
      
      setNewInfluencer({
        name: '',
        email: '',
        phone: '',
        city: '',
        social_channel: {
          type: 'instagram',
          username: ''
        },
        user_id: '',
        code: '',
        pix_key: '',
        pix_key_type: 'CPF'
      });
      
      await loadData();
    } catch (error) {
      console.error('Erro ao adicionar influenciador:', error);
      setFormError('Erro ao adicionar influenciador. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInfluencer = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    
    try {
      await Influencer.update(selectedInfluencer.id, selectedInfluencer);
      setShowEditDialog(false);
      setSaveSuccess('Influenciador atualizado com sucesso!');
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar influenciador:', error);
      setFormError('Erro ao atualizar os dados. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCommission = async () => {
    setFormError('');
    setSaveSuccess('');
    
    if (!newCommission.influencer_id || !newCommission.plan_type || 
        !newCommission.plan_amount || !newCommission.payment_date) {
      setFormError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let commissionPercentage = 10;
      
      const rateConfig = commissionRates.find(
        rate => rate.plan_type === newCommission.plan_type && rate.is_active
      );
      
      if (rateConfig) {
        commissionPercentage = rateConfig.commission_percentage;
      }
      
      const commissionAmount = (newCommission.plan_amount * commissionPercentage) / 100;
      
      const createdCommission = await InfluencerCommission.create({
        ...newCommission,
        commission_percentage: commissionPercentage,
        commission_amount: commissionAmount,
        status: 'pending'
      });
      
      const influencer = influencers.find(inf => inf.id === newCommission.influencer_id);
      if (influencer) {
        const newBalance = (influencer.balance || 0) + commissionAmount;
        const newTotalEarned = (influencer.total_earned || 0) + commissionAmount;
        
        await Influencer.update(influencer.id, {
          balance: newBalance,
          total_earned: newTotalEarned
        });
      }
      
      setSaveSuccess('Comissão registrada com sucesso!');
      setShowCommissionDialog(false);
      
      setNewCommission({
        influencer_id: '',
        user_id: '',
        plan_type: 'club',
        plan_name: '',
        plan_amount: 0,
        commission_percentage: 0,
        commission_amount: 0,
        payment_date: new Date().toISOString().split('T')[0]
      });
      
      await loadData();
    } catch (error) {
      console.error('Erro ao registrar comissão:', error);
      setFormError('Erro ao registrar comissão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAddRate = async () => {
    setFormError('');
    setSaveSuccess('');
    
    if (!newRate.plan_type || !newRate.commission_percentage) {
      setFormError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const existingRate = commissionRates.find(rate => rate.plan_type === newRate.plan_type);
      
      if (existingRate) {
        await CommissionRate.update(existingRate.id, {
          commission_percentage: newRate.commission_percentage,
          description: newRate.description,
          is_active: true
        });
      } else {
        await CommissionRate.create(newRate);
      }
      
      setSaveSuccess('Taxa de comissão configurada com sucesso!');
      setShowRateDialog(false);
      
      setNewRate({
        plan_type: 'club',
        commission_percentage: 10,
        description: '',
        is_active: true
      });
      
      await loadData();
    } catch (error) {
      console.error('Erro ao configurar taxa:', error);
      setFormError('Erro ao configurar taxa de comissão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleProcessPayout = async (influencerId, requestDate, amount) => {
    setIsLoading(true);
    
    try {
      const influencer = influencers.find(inf => inf.id === influencerId);
      
      if (!influencer) {
        throw new Error('Influenciador não encontrado');
      }
      
      const updatedPayoutRequests = influencer.payout_requests.map(req => {
        if (req.date === requestDate && req.status === 'pending') {
          return {
            ...req,
            status: 'completed',
            completed_date: new Date().toISOString().split('T')[0]
          };
        }
        return req;
      });
      
      await Influencer.update(influencerId, {
        balance: (influencer.balance || 0) - amount,
        last_payout_date: new Date().toISOString().split('T')[0],
        payout_requests: updatedPayoutRequests
      });
      
      await loadData();
    } catch (error) {
      console.error('Erro ao processar repasse:', error);
      alert('Erro ao processar repasse. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const loadCommissionData = async (influencerId) => {
    try {
      // Buscar todas as comissões deste influenciador
      const commissions = await InfluencerCommission.filter({
        influencer_id: influencerId
      });
      
      setCommissions(commissions || []);
      
      // Calcular métricas
      let totalCommissionAmount = 0;
      let pendingCommissionAmount = 0;
      const planTypes = {
        commercial: 0,
        providers: 0,
        club: 0,
        properties: 0
      };
      
      commissions.forEach(comm => {
        if (planTypes[comm.plan_type] !== undefined) {
          planTypes[comm.plan_type]++;
        }
        
        totalCommissionAmount += comm.commission_amount || 0;
        
        if (comm.status === 'pending') {
          pendingCommissionAmount += comm.commission_amount || 0;
        }
      });
      
      const totalReferrals = Object.values(planTypes).reduce((sum, count) => sum + count, 0);
      
      // setStats({
      //   totalReferrals,
      //   totalCommissions: totalCommissionAmount,
      //   pendingCommissions: pendingCommissionAmount,
      //   balance: influencer.balance || 0,
      //   planTypes
      // });
      
    } catch (error) {
      console.error("Erro ao carregar dados de comissões:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Carregando...</h3>
          <p className="mt-1 text-sm text-gray-500">Aguarde enquanto carregamos os dados.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <BackButton />
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Influenciadores</h1>
          
          <div className="flex gap-3">
            <Button onClick={() => setShowRateDialog(true)} variant="outline" className="gap-2">
              <PercentCircle className="h-4 w-4" />
              Configurar Taxas
            </Button>
            <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <UserPlus className="h-4 w-4" />
              Adicionar Influenciador
            </Button>
          </div>
        </div>
        
        {saveSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-600">Sucesso!</AlertTitle>
            <AlertDescription className="text-green-600">
              {saveSuccess}
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="influencers">
          <TabsList className="mb-6 w-full grid grid-cols-4">
            <TabsTrigger value="influencers">
              <Users className="h-4 w-4 mr-2" />
              Influenciadores
            </TabsTrigger>
            <TabsTrigger value="commissions">
              <DollarSign className="h-4 w-4 mr-2" />
              Comissões
            </TabsTrigger>
            <TabsTrigger value="payouts">
              <CreditCard className="h-4 w-4 mr-2" />
              Solicitações de Repasse
            </TabsTrigger>
            <TabsTrigger value="rates">
              <PercentCircle className="h-4 w-4 mr-2" />
              Taxas de Comissão
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="influencers">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-center gap-3 max-w-md mb-2">
                  <Search className="h-5 w-5 text-gray-400" />
                  <Input 
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Canal Social</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                      <TableHead className="text-right">Total Ganho</TableHead>
                      <TableHead className="text-right">Último Repasse</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {influencers
                      .filter(inf => 
                        inf.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        inf.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        inf.code?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map(influencer => (
                        <TableRow key={influencer.id}>
                          <TableCell>{influencer.name}</TableCell>
                          <TableCell>{influencer.code}</TableCell>
                          <TableCell>{influencer.email}</TableCell>
                          <TableCell>{influencer.phone}</TableCell>
                          <TableCell>{influencer.city}</TableCell>
                          <TableCell>
                            {influencer.social_channel?.type && (
                              <Badge variant="outline">
                                {`${influencer.social_channel.type}: ${influencer.social_channel.username}`}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(influencer.balance)}
                          </TableCell>
                          <TableCell className="text-right text-gray-600">
                            {formatCurrency(influencer.total_earned)}
                          </TableCell>
                          <TableCell className="text-right text-gray-600">
                            {influencer.last_payout_date ? 
                              format(new Date(influencer.last_payout_date), 'dd/MM/yyyy') : 
                              'Nunca'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge className={influencer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {influencer.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedInfluencer(influencer);
                                  setShowEditDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(createPageUrl(`InfluencerProfile?id=${influencer.id}`))}
                              >
                                <BarChart className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                
                {influencers.length === 0 && (
                  <div className="p-8 text-center">
                    <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum influenciador cadastrado.</p>
                    <Button 
                      onClick={() => setShowAddDialog(true)}
                      variant="link" 
                      className="mt-2"
                    >
                      Adicionar influenciador
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="commissions">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-gray-500" />
                    Comissões Registradas
                  </CardTitle>
                  
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setNewCommission({
                        ...newCommission,
                        payment_date: new Date().toISOString().split('T')[0]
                      });
                      setShowCommissionDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Comissão
                  </Button>
                </div>
                
                <CardDescription>
                  Histórico de comissões e registros de valores pagos aos influenciadores
                </CardDescription>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label>Filtrar por Influenciador</Label>
                    <Select value={filterInfluencer} onValueChange={setFilterInfluencer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os influenciadores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os influenciadores</SelectItem>
                        {influencers.map(inf => (
                          <SelectItem key={inf.id} value={inf.id}>
                            {inf.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Filtrar por Tipo de Plano</Label>
                    <Select value={filterPlanType} onValueChange={setFilterPlanType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        <SelectItem value="commercial">Planos Comerciais</SelectItem>
                        <SelectItem value="providers">Planos Prestadores</SelectItem>
                        <SelectItem value="club">Clube Assinante</SelectItem>
                        <SelectItem value="properties">Imóveis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Filtrar por Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="credited">Creditado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Influenciador</TableHead>
                        <TableHead>Tipo de Plano</TableHead>
                        <TableHead>Nome do Plano</TableHead>
                        <TableHead>Valor do Plano</TableHead>
                        <TableHead>% Comissão</TableHead>
                        <TableHead className="text-right">Valor Comissão</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCommissions.map(comm => {
                        const influencer = influencers.find(inf => inf.id === comm.influencer_id);
                        
                        return (
                          <TableRow key={comm.id}>
                            <TableCell>
                              {comm.payment_date ? 
                                format(new Date(comm.payment_date), 'dd/MM/yyyy') : 
                                '-'}
                            </TableCell>
                            <TableCell className="font-medium">
                              {influencer?.name || 'Desconhecido'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {comm.plan_type === 'commercial' && 'Comercial'}
                                {comm.plan_type === 'providers' && 'Prestador'}
                                {comm.plan_type === 'club' && 'Clube'}
                                {comm.plan_type === 'properties' && 'Imóveis'}
                              </Badge>
                            </TableCell>
                            <TableCell>{comm.plan_name || '-'}</TableCell>
                            <TableCell>{formatCurrency(comm.plan_amount)}</TableCell>
                            <TableCell>{comm.commission_percentage}%</TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(comm.commission_amount)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge className={
                                comm.status === 'credited' ? 'bg-green-100 text-green-800' : 
                                comm.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {comm.status === 'credited' && 'Creditado'}
                                {comm.status === 'cancelled' && 'Cancelado'}
                                {comm.status === 'pending' && 'Pendente'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  
                  {filteredCommissions.length === 0 && (
                    <div className="p-8 text-center">
                      <DollarSign className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Nenhuma comissão encontrada com os filtros aplicados.</p>
                      <Button 
                        onClick={() => {
                          setFilterInfluencer('all');
                          setFilterPlanType('all');
                          setFilterStatus('all');
                        }}
                        variant="link" 
                        className="mt-2"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Limpar filtros
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-gray-500" />
                  Solicitações de Repasse Pendentes
                </CardTitle>
                <CardDescription>
                  Solicitações de repasse feitas pelos influenciadores que aguardam processamento
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data Solicitação</TableHead>
                        <TableHead>Influenciador</TableHead>
                        <TableHead>Valor Solicitado</TableHead>
                        <TableHead>Método de Pagamento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payoutRequests.map((request, index) => {
                        const influencer = influencers.find(inf => inf.id === request.influencer_id);
                        
                        return (
                          <TableRow key={`${request.influencer_id}-${index}`}>
                            <TableCell>
                              {request.date ? 
                                format(new Date(request.date), 'dd/MM/yyyy') : 
                                '-'}
                            </TableCell>
                            <TableCell className="font-medium">
                              {request.influencer_name || influencer?.name || 'Desconhecido'}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatCurrency(request.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                Chave PIX: {influencer?.pix_key_type || 'CPF'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Pendente
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-green-500 text-green-600 hover:bg-green-50"
                                onClick={() => handleProcessPayout(
                                  request.influencer_id, 
                                  request.date, 
                                  request.amount
                                )}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Processar
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  
                  {payoutRequests.length === 0 && (
                    <div className="p-8 text-center">
                      <CreditCard className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Nenhuma solicitação de repasse pendente.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rates">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <PercentCircle className="mr-2 h-5 w-5 text-gray-500" />
                    Taxas de Comissão Configuradas
                  </CardTitle>
                  
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowRateDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Taxa
                  </Button>
                </div>
                <CardDescription>
                  Configure as taxas de comissão para cada tipo de plano oferecido pela plataforma
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo de Plano</TableHead>
                        <TableHead>Percentual de Comissão</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissionRates.map(rate => (
                        <TableRow key={rate.id}>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {rate.plan_type === 'commercial' && 'Planos Comerciais'}
                              {rate.plan_type === 'providers' && 'Planos Prestadores'}
                              {rate.plan_type === 'club' && 'Clube Assinante'}
                              {rate.plan_type === 'properties' && 'Imóveis'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {rate.commission_percentage}%
                          </TableCell>
                          <TableCell>
                            {rate.description || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              rate.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }>
                              {rate.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setNewRate({
                                  plan_type: rate.plan_type,
                                  commission_percentage: rate.commission_percentage,
                                  description: rate.description || '',
                                  is_active: rate.is_active
                                });
                                setShowRateDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {commissionRates.length === 0 && (
                    <div className="p-8 text-center">
                      <PercentCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Nenhuma taxa de comissão configurada.</p>
                      <Button 
                        onClick={() => setShowRateDialog(true)}
                        variant="link" 
                        className="mt-2"
                      >
                        Configurar taxas
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Influenciador</DialogTitle>
              <DialogDescription>
                Cadastre um novo influenciador para o programa de afiliados.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddInfluencer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={newInfluencer.name}
                  onChange={(e) => setNewInfluencer({...newInfluencer, name: e.target.value})}
                  placeholder="Nome do influenciador"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newInfluencer.email}
                    onChange={(e) => setNewInfluencer({...newInfluencer, email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={newInfluencer.phone}
                    onChange={(e) => setNewInfluencer({...newInfluencer, phone: e.target.value})}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  value={newInfluencer.city}
                  onChange={(e) => setNewInfluencer({...newInfluencer, city: e.target.value})}
                  placeholder="Nome da cidade"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="socialType">Canal de Divulgação *</Label>
                  <Select
                    value={newInfluencer.social_channel.type}
                    onValueChange={(value) => setNewInfluencer({
                      ...newInfluencer,
                      social_channel: {...newInfluencer.social_channel, type: value}
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="socialUsername">Nome do Canal/Perfil *</Label>
                  <Input
                    id="socialUsername"
                    value={newInfluencer.social_channel.username}
                    onChange={(e) => setNewInfluencer({
                      ...newInfluencer,
                      social_channel: {...newInfluencer.social_channel, username: e.target.value}
                    })}
                    placeholder="@usuario"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código de Referência</Label>
                  <Input
                    id="code"
                    value={newInfluencer.code}
                    onChange={(e) => setNewInfluencer({ ...newInfluencer, code: e.target.value })}
                    placeholder="Deixe em branco para gerar automaticamente"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user_id">ID do Usuário (opcional)</Label>
                  <Input
                    id="user_id"
                    value={newInfluencer.user_id}
                    onChange={(e) => setNewInfluencer({ ...newInfluencer, user_id: e.target.value })}
                    placeholder="ID do usuário na plataforma"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pix_key_type">Tipo de Chave PIX</Label>
                  <Select 
                    value={newInfluencer.pix_key_type} 
                    onValueChange={(value) => setNewInfluencer({ ...newInfluencer, pix_key_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de chave" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CPF">CPF</SelectItem>
                      <SelectItem value="CNPJ">CNPJ</SelectItem>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="PHONE">Telefone</SelectItem>
                      <SelectItem value="RANDOM">Chave Aleatória</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pix_key">Chave PIX</Label>
                  <Input
                    id="pix_key"
                    value={newInfluencer.pix_key}
                    onChange={(e) => setNewInfluencer({ ...newInfluencer, pix_key: e.target.value })}
                    placeholder="Chave PIX para repasses"
                  />
                </div>
              </div>
            </form>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddInfluencer}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Adicionar Influenciador'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showCommissionDialog} onOpenChange={setShowCommissionDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registrar Nova Comissão</DialogTitle>
              <DialogDescription>
                Registre uma comissão para um influenciador baseada em um plano vendido.
              </DialogDescription>
            </DialogHeader>
            
            {formError && (
              <Alert className="my-2 bg-red-50 border-red-200">
                <AlertTitle className="text-red-600">Erro!</AlertTitle>
                <AlertDescription className="text-red-600">
                  {formError}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="influencer_id">Influenciador *</Label>
                  <Select 
                    value={newCommission.influencer_id} 
                    onValueChange={(value) => setNewCommission({ ...newCommission, influencer_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o influenciador" />
                    </SelectTrigger>
                    <SelectContent>
                      {influencers.map(inf => (
                        <SelectItem key={inf.id} value={inf.id}>
                          {inf.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="plan_type">Tipo de Plano *</Label>
                  <Select 
                    value={newCommission.plan_type} 
                    onValueChange={(value) => setNewCommission({ ...newCommission, plan_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commercial">Planos Comerciais</SelectItem>
                      <SelectItem value="providers">Planos Prestadores</SelectItem>
                      <SelectItem value="club">Clube Assinante</SelectItem>
                      <SelectItem value="properties">Imóveis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="plan_name">Nome do Plano</Label>
                  <Input
                    id="plan_name"
                    value={newCommission.plan_name}
                    onChange={(e) => setNewCommission({ ...newCommission, plan_name: e.target.value })}
                    placeholder="Ex: Plano Premium"
                  />
                </div>
                
                <div>
                  <Label htmlFor="user_id">ID do Usuário Indicado</Label>
                  <Input
                    id="user_id"
                    value={newCommission.user_id}
                    onChange={(e) => setNewCommission({ ...newCommission, user_id: e.target.value })}
                    placeholder="ID do usuário que comprou"
                  />
                </div>
                
                <div>
                  <Label htmlFor="plan_amount">Valor do Plano (R$) *</Label>
                  <Input
                    id="plan_amount"
                    type="number"
                    value={newCommission.plan_amount}
                    onChange={(e) => setNewCommission({ ...newCommission, plan_amount: parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="payment_date">Data do Pagamento *</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={newCommission.payment_date}
                    onChange={(e) => setNewCommission({ ...newCommission, payment_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCommissionDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddCommission}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Registrar Comissão'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showRateDialog} onOpenChange={setShowRateDialog}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Configurar Taxa de Comissão</DialogTitle>
              <DialogDescription>
                Defina o percentual de comissão para cada tipo de plano.
              </DialogDescription>
            </DialogHeader>
            
            {formError && (
              <Alert className="my-2 bg-red-50 border-red-200">
                <AlertTitle className="text-red-600">Erro!</AlertTitle>
                <AlertDescription className="text-red-600">
                  {formError}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="plan_type">Tipo de Plano *</Label>
                  <Select 
                    value={newRate.plan_type} 
                    onValueChange={(value) => setNewRate({ ...newRate, plan_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commercial">Planos Comerciais</SelectItem>
                      <SelectItem value="providers">Planos Prestadores</SelectItem>
                      <SelectItem value="club">Clube Assinante</SelectItem>
                      <SelectItem value="properties">Imóveis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="commission_percentage">Percentual de Comissão (%) *</Label>
                  <Input
                    id="commission_percentage"
                    type="number"
                    value={newRate.commission_percentage}
                    onChange={(e) => setNewRate({ ...newRate, commission_percentage: parseFloat(e.target.value) })}
                    placeholder="10"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={newRate.description}
                    onChange={(e) => setNewRate({ ...newRate, description: e.target.value })}
                    placeholder="Detalhes sobre esta taxa de comissão"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRateDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddRate}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Salvar Taxa'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Influenciador</DialogTitle>
              <DialogDescription>
                Atualize os dados do influenciador.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleEditInfluencer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome Completo *</Label>
                <Input
                  id="edit-name"
                  value={selectedInfluencer?.name || ''}
                  onChange={(e) => setSelectedInfluencer({
                    ...selectedInfluencer,
                    name: e.target.value
                  })}
                  placeholder="Nome do influenciador"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedInfluencer?.email || ''}
                    onChange={(e) => setSelectedInfluencer({
                      ...selectedInfluencer,
                      email: e.target.value
                    })}
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Telefone *</Label>
                  <Input
                    id="edit-phone"
                    value={selectedInfluencer?.phone || ''}
                    onChange={(e) => setSelectedInfluencer({
                      ...selectedInfluencer,
                      phone: e.target.value
                    })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-city">Cidade *</Label>
                <Input
                  id="edit-city"
                  value={selectedInfluencer?.city || ''}
                  onChange={(e) => setSelectedInfluencer({
                    ...selectedInfluencer,
                    city: e.target.value
                  })}
                  placeholder="Nome da cidade"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-social-type">Canal de Divulgação *</Label>
                  <Select
                    value={selectedInfluencer?.social_channel?.type || 'instagram'}
                    onValueChange={(value) => setSelectedInfluencer({
                      ...selectedInfluencer,
                      social_channel: {
                        ...selectedInfluencer?.social_channel,
                        type: value
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-social-username">Nome do Canal/Perfil *</Label>
                  <Input
                    id="edit-social-username"
                    value={selectedInfluencer?.social_channel?.username || ''}
                    onChange={(e) => setSelectedInfluencer({
                      ...selectedInfluencer,
                      social_channel: {
                        ...selectedInfluencer?.social_channel,
                        username: e.target.value
                      }
                    })}
                    placeholder="@usuario"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-pix-type">Tipo de Chave PIX *</Label>
                  <Select
                    value={selectedInfluencer?.pix_key_type || 'CPF'}
                    onValueChange={(value) => setSelectedInfluencer({
                      ...selectedInfluencer,
                      pix_key_type: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CPF">CPF</SelectItem>
                      <SelectItem value="CNPJ">CNPJ</SelectItem>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="PHONE">Telefone</SelectItem>
                      <SelectItem value="RANDOM">Chave Aleatória</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-pix-key">Chave PIX *</Label>
                  <Input
                    id="edit-pix-key"
                    value={selectedInfluencer?.pix_key || ''}
                    onChange={(e) => setSelectedInfluencer({
                      ...selectedInfluencer,
                      pix_key: e.target.value
                    })}
                    placeholder="Chave PIX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedInfluencer?.is_active}
                    onChange={(e) => setSelectedInfluencer({
                      ...selectedInfluencer,
                      is_active: e.target.checked
                    })}
                    className="form-checkbox"
                  />
                  <span>Influenciador Ativo</span>
                </Label>
              </div>

              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
