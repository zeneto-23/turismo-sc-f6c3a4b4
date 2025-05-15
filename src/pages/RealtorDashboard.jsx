
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Realtor } from "@/api/entities";
import { User } from "@/api/entities";
import { Property } from "@/api/entities";
import { UserSubscription } from "@/api/entities";
import { SubscriptionPlan } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { 
  Building2, 
  Home, 
  Plus, 
  Eye, 
  LayoutDashboard, 
  Settings, 
  CreditCard, 
  LogOut,
  BarChart2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from "lucide-react";

export default function RealtorDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [realtorProfile, setRealtorProfile] = useState(null);
  const [properties, setProperties] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    let localUserData = null;
    try {
      console.log("RealtorDashboard: Iniciando carregamento de dados");
      
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        localUserData = JSON.parse(storedUser);
        setCurrentUser(localUserData);
        console.log("RealtorDashboard: Usuário do localStorage:", localUserData);
      } else {
        console.log("RealtorDashboard: Nenhum usuário no localStorage");
        navigate(createPageUrl("UserAccount"));
        return;
      }

      if (!localUserData || !localUserData.email) {
        console.log("RealtorDashboard: Dados do usuário inválidos");
        navigate(createPageUrl("UserAccount"));
        return;
      }
      
      let realtorData = null;
      
      // Se temos realtor_id no localUserData, tentamos carregar diretamente
      if (localUserData.realtor_id) {
        try {
          console.log("RealtorDashboard: Tentando carregar imobiliária pelo ID:", localUserData.realtor_id);
          realtorData = await Realtor.get(localUserData.realtor_id);
          console.log("RealtorDashboard: Imobiliária carregada por ID:", realtorData);
        } catch (error) {
          console.error("RealtorDashboard: Erro ao carregar imobiliária por ID:", error);
        }
      }
      
      // Se não conseguimos carregar pelo ID, tentamos pelo email
      if (!realtorData) {
        try {
          console.log("RealtorDashboard: Tentando buscar imobiliárias pelo email:", localUserData.email);
          const realtors = await Realtor.list();
          
          // Busca case-insensitive para evitar problemas com maiúsculas/minúsculas
          const matchedRealtor = realtors.find(r => 
            r.email && r.email.trim().toLowerCase() === localUserData.email.trim().toLowerCase()
          );
          
          if (matchedRealtor) {
            realtorData = matchedRealtor;
            console.log("RealtorDashboard: Imobiliária encontrada por email:", realtorData);
          } else {
            console.log("RealtorDashboard: Nenhuma imobiliária encontrada para o email:", localUserData.email);
          }
        } catch (error) {
          console.error("RealtorDashboard: Erro ao buscar imobiliárias por email:", error);
        }
      }
      
      if (!realtorData) {
        console.error("RealtorDashboard: Imobiliária não encontrada para o usuário:", localUserData);
        toast({
          title: "Erro de Autenticação",
          description: "Perfil de imobiliária não associado a este usuário.",
          variant: "destructive"
        });
        navigate(createPageUrl("UserAccount"));
        return;
      }
      
      setRealtorProfile(realtorData);
      
      // Atualizar o localStorage com dados corretos da imobiliária
      if (!localUserData.realtor_id || localUserData.realtor_id !== realtorData.id) {
        localUserData.realtor_id = realtorData.id;
        localUserData.full_name = realtorData.company_name || localUserData.full_name;
        localStorage.setItem('currentUser', JSON.stringify(localUserData));
        console.log("RealtorDashboard: currentUser atualizado no localStorage:", localUserData);
      }
      
      // Carregar propriedades da imobiliária
      const propertiesData = await Property.filter({ realtor_id: realtorData.id });
      setProperties(propertiesData || []);
      
      // Se a imobiliária tem um plano associado, tenta carregar os detalhes do plano
      if (realtorData.subscription_plan_id) {
        console.log("RealtorDashboard: Carregando detalhes do plano:", realtorData.subscription_plan_id);
        try {
          const plan = await SubscriptionPlan.get(realtorData.subscription_plan_id);
          
          if (plan) {
            console.log("RealtorDashboard: Plano encontrado:", plan);
            
            // Força o status do plano como "active" se a imobiliária estiver aprovada
            const planStatus = realtorData.status === 'approved' ? 'active' : realtorData.subscription_status;
            
            setSubscription({
              plan_id: plan.id,
              plan_name: plan.name,
              status: planStatus,
              max_listings: plan.max_listings || realtorData.max_active_listings || 15,
              featured_listings: plan.featured_listings || realtorData.featured_listings_available || 0
            });
          }
        } catch (e) {
          console.error("RealtorDashboard: Erro ao carregar plano:", e);
            
          // Mesmo sem conseguir carregar o plano, consideramos o plano ativo
          // se a imobiliária estiver aprovada
          if (realtorData.status === 'approved') {
            setSubscription({
              plan_id: realtorData.subscription_plan_id,
              plan_name: "Plano Imobiliário Premium",
              status: "active",
              max_listings: realtorData.max_active_listings || 15,
              featured_listings: realtorData.featured_listings_available || 0
            });
          }
        }
      } else if (realtorData.status === 'approved') {
        // Se a imobiliária está aprovada, mas não tem plano específico,
        // criamos um plano "default" para permitir o acesso
        console.log("RealtorDashboard: Criando plano default para imobiliária aprovada");
        setSubscription({
          plan_id: "default",
          plan_name: "Plano Imobiliário",
          status: "active",
          max_listings: realtorData.max_active_listings || 15,
          featured_listings: 0
        });
      } else {
        console.log("RealtorDashboard: Imobiliária sem plano ativo. Status:", realtorData.status);
      }

    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      toast({
        title: "Erro ao carregar dashboard",
        description: "Não foi possível carregar os dados do perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    navigate(createPageUrl("Public"));
  };

  const handleCreateProperty = () => {
    // Simplificado! Permite qualquer realtor criar imóvel sem verificar status
    navigate(createPageUrl("PropertyForm"));
  };

  const getStatusMessage = () => {
    if (!realtorProfile) return null;
    
    // Removida a verificação de status pending/rejected
    // Mostramos informações sobre o limite de anúncios disponíveis
    
    const currentAnnouncements = properties.length;
    const maxAnnouncements = subscription?.max_listings || realtorProfile.max_active_listings || 15;
    
    return (
      <Card className="bg-blue-50 border-blue-200 mb-6 shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-800 text-lg">Bem-vindo, {realtorProfile.company_name}!</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 text-sm space-y-1">
          <p>Você tem <strong>{currentAnnouncements}</strong> imóveis cadastrados.</p>
          <p>Você pode cadastrar até <strong>{maxAnnouncements}</strong> imóveis.</p>
          <p>Adicione imóveis, gerencie seus anúncios e acompanhe as visualizações!</p>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Carregando seu dashboard</h2>
          <p className="text-gray-500 mt-2">Aguarde enquanto preparamos suas informações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              {realtorProfile?.logo_url ? (
                <img src={realtorProfile.logo_url} alt="Logo" className="h-8 w-auto mr-2"/>
              ) : (
                <Building2 className="h-8 w-8 text-blue-600 mr-2" />
              )}
              <h1 className="text-xl font-bold text-gray-900">
                {realtorProfile?.company_name || "Dashboard Imobiliário"}
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-600" onClick={() => navigate(createPageUrl("Public"))}>
                Site Principal
              </Button>
              <Button variant="ghost" className="text-gray-600" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {getStatusMessage()}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Menu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate(createPageUrl("RealtorDashboard"))}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate(createPageUrl("Properties"))}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Meus Imóveis
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate(createPageUrl("SubscriptionPlans?tab=realtor"))}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Meu Plano
                  </Button>
                  {/* <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => { // Navegar para Estatísticas  }}
                  >
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Estatísticas
                  </Button> */}
                  {/* <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => { // Navegar para Configurações  }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Button> */}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Meu Plano</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {subscription?.status === "active" ? (
                    <>
                      <p className="text-sm text-gray-700 mb-1">
                        Plano atual: <span className="font-semibold">{subscription.plan_name}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Anúncios disponíveis: {subscription.max_listings}
                      </p>
                    </>
                  ) : subscription?.status === "trial" ? (
                     <>
                        <p className="text-sm text-gray-700 mb-1">
                            Plano atual: <span className="font-semibold">{subscription.plan_name}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                            Anúncios disponíveis: {subscription.max_listings}
                        </p>
                     </>
                  ) : (
                    <p className="text-sm text-gray-500 mb-2">
                      Você não possui um plano ativo.
                    </p>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate(createPageUrl("SubscriptionPlans?tab=realtor"))}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {subscription?.status === "active" || subscription?.status === "trial" ? "Alterar Plano" : "Ver Planos"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
          
          <div className="md:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visão Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border text-center">
                    <h3 className="text-lg font-semibold text-gray-700">Total de Imóveis</h3>
                    <p className="text-3xl font-bold text-blue-600">{properties.length}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border text-center">
                    <h3 className="text-lg font-semibold text-gray-700">Imóveis Ativos</h3>
                    <p className="text-3xl font-bold text-green-600">
                      {properties.filter(p => p.status === "active").length}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border text-center">
                    <h3 className="text-lg font-semibold text-gray-700">Visualizações</h3>
                    <p className="text-3xl font-bold text-purple-600">
                      {properties.reduce((sum, p) => sum + (p.views_count || 0), 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Imóveis Recentes</CardTitle>
                <Button 
                  onClick={handleCreateProperty}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Imóvel
                </Button>
              </CardHeader>
              <CardContent>
                {properties.length === 0 ? (
                  <div className="text-center py-12">
                    <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Nenhum imóvel cadastrado</h3>
                    <p className="text-gray-500 mt-1 mb-4">Comece a cadastrar seus imóveis agora mesmo</p>
                    <Button 
                      onClick={handleCreateProperty}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Imóvel
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {properties.slice(0, 3).map(property => (
                      <div key={property.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{property.title}</h4>
                          <p className="text-sm text-gray-500">{property.address}</p>
                          <div className="mt-1">
                            <span className="text-sm font-medium text-blue-600">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price || 0)}
                            </span>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline"
                          onClick={() => navigate(createPageUrl(`PropertyDetail?id=${property.id}`))}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                      </div>
                    ))}
                    
                    {properties.length > 3 && (
                      <div className="text-center">
                        <Button 
                          variant="link"
                          onClick={() => navigate(createPageUrl("Properties"))}
                        >
                          Ver todos os imóveis
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
