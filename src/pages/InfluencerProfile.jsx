
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Influencer } from '@/api/entities';
import { InfluencerCommission } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import BackButton from '@/components/ui/BackButton';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  Clock, 
  Loader2, 
  User as UserIcon, 
  BarChart,
  AlertCircle
} from 'lucide-react';

import InfluencerStats from '@/components/influencers/InfluencerStats';
import CommissionHistoryTable from '@/components/influencers/CommissionHistoryTable';
import PayoutRequestForm from '@/components/influencers/PayoutRequestForm';
import PayoutHistoryTable from '@/components/influencers/PayoutHistoryTable';
import InfluencerReferralLink from '@/components/influencers/InfluencerReferralLink';

export default function InfluencerProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [influencer, setInfluencer] = useState(null);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalCommissions: 0,
    pendingCommissions: 0,
    balance: 0,
    planTypes: {
      commercial: 0,
      providers: 0,
      club: 0,
      properties: 0
    }
  });
  const [commissions, setCommissions] = useState([]);
  const [activeTab, setActiveTab] = useState("commissions");
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Obter usuário atual
        const user = await User.me();
        setCurrentUser(user);

        // Buscar dados do influenciador
        const influencers = await Influencer.filter({
          user_id: user.id
        });

        // Se não encontrar o influenciador, criar um novo
        if (!influencers || influencers.length === 0) {
          // Gerar código único baseado no email do usuário
          const code = user.email
            .split('@')[0]
            .replace(/[^a-zA-Z0-9]/g, '')
            .toLowerCase()
            .substring(0, 8);

          // Criar novo influenciador
          const newInfluencer = await Influencer.create({
            user_id: user.id,
            code: code,
            name: user.full_name || "Novo Influenciador",
            email: user.email,
            city: "",
            social_channel: {
              type: "instagram",
              username: ""
            },
            is_active: true,
            balance: 0,
            total_earned: 0
          });

          setInfluencer(newInfluencer);
        } else {
          setInfluencer(influencers[0]);
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError("Não foi possível carregar seu perfil de influenciador. Por favor, tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);
  
  const loadInfluencerData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = currentUser || await User.me();
      const urlParams = new URLSearchParams(window.location.search);
      const influencerId = urlParams.get('id');
      
      let influencerData;
      
      if (influencerId) {
        if (user.role === 'admin') {
          influencerData = await Influencer.get(influencerId);
        } else {
          throw new Error('Você não tem permissão para acessar este perfil');
        }
      } else {
        const influencers = await Influencer.filter({ user_id: user.id });
        if (influencers && influencers.length > 0) {
          influencerData = influencers[0];
        } else {
          throw new Error('Perfil de influenciador não encontrado');
        }
      }
      
      if (!influencerData) {
        throw new Error('Influenciador não encontrado');
      }
      
      setInfluencer(influencerData);
      const commissionsData = await InfluencerCommission.filter({ influencer_id: influencerData.id });
      setCommissions(commissionsData || []);
      calculateStats(influencerData, commissionsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError(error.message || 'Erro ao carregar os dados do influenciador');
    } finally {
      setIsLoading(false);
    }
  };
  
  const calculateStats = (influencer, commissions) => {
    const planTypes = {
      commercial: 0,
      providers: 0,
      club: 0,
      properties: 0
    };
    
    let totalCommissionAmount = 0;
    let pendingCommissionAmount = 0;
    
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
    
    setStats({
      totalReferrals,
      totalCommissions: totalCommissionAmount,
      pendingCommissions: pendingCommissionAmount,
      balance: influencer.balance || 0,
      planTypes
    });
  };

  const handleDataRefresh = async () => {
    await loadInfluencerData();
  };

  // Página de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Carregando...</h3>
          <p className="mt-1 text-sm text-gray-500">Aguarde enquanto carregamos seus dados.</p>
        </div>
      </div>
    );
  }

  // Página de erro
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Erro ao Carregar Perfil</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button 
              onClick={() => navigate(createPageUrl("UserAccount"))}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Voltar para Minha Conta
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!influencer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Perfil Não Encontrado</h3>
            <p className="text-gray-600 mb-6">Não foi possível encontrar um perfil de influenciador associado à sua conta.</p>
            <Button 
              onClick={() => navigate(createPageUrl('UserAccount'))}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Voltar para Minha Conta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const renderMobileTabs = () => {
    return (
      <div className="md:hidden">
        <div className="mb-4 overflow-x-auto">
          <div className="grid grid-cols-3 gap-1">
            <Button 
              variant={activeTab === "commissions" ? "default" : "outline"}
              className={`flex items-center justify-center px-2 ${activeTab === "commissions" ? "bg-blue-600" : ""}`}
              onClick={() => handleTabChange("commissions")}
            >
              <DollarSign className="w-4 h-4 mr-1" />
              <span className="text-xs">Comissões</span>
            </Button>
            <Button 
              variant={activeTab === "payouts" ? "default" : "outline"}
              className={`flex items-center justify-center px-2 ${activeTab === "payouts" ? "bg-blue-600" : ""}`}
              onClick={() => handleTabChange("payouts")}
            >
              <CreditCard className="w-4 h-4 mr-1" />
              <span className="text-xs">Saques</span>
            </Button>
            <Button 
              variant={activeTab === "referrals" ? "default" : "outline"}
              className={`flex items-center justify-center px-2 ${activeTab === "referrals" ? "bg-blue-600" : ""}`}
              onClick={() => handleTabChange("referrals")}
            >
              <Users className="w-4 h-4 mr-1" />
              <span className="text-xs">Link</span>
            </Button>
          </div>
        </div>

        {activeTab === "commissions" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <BarChart className="w-5 h-5 mr-2 text-gray-500" />
                Histórico de Comissões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CommissionHistoryTable commissions={commissions} />
            </CardContent>
          </Card>
        )}

        {activeTab === "payouts" && (
          <div className="space-y-6">
            <PayoutRequestForm 
              influencerId={influencer?.id} 
              balance={influencer?.balance || 0}
              onRequestSent={handleDataRefresh}
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
                  Histórico de Saques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PayoutHistoryTable payouts={influencer?.payout_requests || []} />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "referrals" && (
          <div className="space-y-6">
            <InfluencerReferralLink code={influencer?.code || ""} />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Users className="w-5 h-5 mr-2 text-gray-500" />
                  Como Funciona
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2">Compartilhe seu Link</h3>
                  <p className="text-blue-700 text-sm">
                    Compartilhe seu link de referência com amigos, seguidores e clientes potenciais.
                    Quando eles se cadastrarem usando seu link, serão automaticamente vinculados ao seu perfil.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <h3 className="font-medium text-green-800 mb-2">Ganhe Comissões</h3>
                  <p className="text-green-700 text-sm">
                    Você ganhará comissões por cada plano que suas indicações contratarem.
                    As comissões são calculadas automaticamente com base nas taxas configuradas para cada tipo de plano.
                  </p>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <h3 className="font-medium text-amber-800 mb-2">Receba seus Saques</h3>
                  <p className="text-amber-700 text-sm">
                    Quando quiser receber suas comissões, basta solicitar um saque.
                    O pagamento será processado em até 48 horas úteis via PIX para a chave cadastrada.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  const renderDesktopTabs = () => {
    return (
      <div className="hidden md:block">
        <Tabs defaultValue="commissions">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="commissions">
              <DollarSign className="w-4 h-4 mr-2" />
              Comissões
            </TabsTrigger>
            <TabsTrigger value="payouts">
              <CreditCard className="w-4 h-4 mr-2" />
              Saques
            </TabsTrigger>
            <TabsTrigger value="referrals">
              <Users className="w-4 h-4 mr-2" />
              Link de Indicação
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="commissions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <BarChart className="w-5 h-5 mr-2 text-gray-500" />
                  Histórico de Comissões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CommissionHistoryTable commissions={commissions} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payouts" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <PayoutRequestForm 
                  influencerId={influencer?.id} 
                  balance={influencer?.balance || 0}
                  onRequestSent={handleDataRefresh}
                />
              </div>
              
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
                      Histórico de Saques
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PayoutHistoryTable payouts={influencer?.payout_requests || []} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="referrals" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <InfluencerReferralLink code={influencer?.code || ""} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Users className="w-5 h-5 mr-2 text-gray-500" />
                    Como Funciona
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="font-medium text-blue-800 mb-2">Compartilhe seu Link</h3>
                    <p className="text-blue-700 text-sm">
                      Compartilhe seu link de referência com amigos, seguidores e clientes potenciais.
                      Quando eles se cadastrarem usando seu link, serão automaticamente vinculados ao seu perfil.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <h3 className="font-medium text-green-800 mb-2">Ganhe Comissões</h3>
                    <p className="text-green-700 text-sm">
                      Você ganhará comissões por cada plano que suas indicações contratarem.
                      As comissões são calculadas automaticamente com base nas taxas configuradas para cada tipo de plano.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <h3 className="font-medium text-amber-800 mb-2">Receba seus Saques</h3>
                    <p className="text-amber-700 text-sm">
                      Quando quiser receber suas comissões, basta solicitar um saque.
                      O pagamento será processado em até 48 horas úteis via PIX para a chave cadastrada.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <BackButton />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{influencer?.name}</h1>
            <p className="text-gray-500 flex items-center">
              <UserIcon className="w-4 h-4 mr-1" />
              Perfil de Influenciador
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="text-gray-600 hover:text-gray-900 text-sm"
              onClick={handleDataRefresh}
            >
              <Clock className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Última atualização:</span> {
                influencer?.updated_date ? 
                format(new Date(influencer.updated_date), 'dd/MM/yyyy HH:mm') : 
                'Desconhecida'
              }
            </Button>
          </div>
        </div>
        
        <InfluencerStats stats={stats} />
        
        <div className="mt-8">
          {renderMobileTabs()}
          {renderDesktopTabs()}
        </div>
      </div>
    </div>
  );
}
