
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Business } from "@/api/entities";
import { BusinessCredential } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Phone, 
  MapPin, 
  Mail, 
  Store, 
  Edit, 
  Image, 
  ExternalLink,
  Clock,
  Globe,
  ShoppingBag,
  Percent,
  BarChart,
  DollarSign,
  Wallet,
  CreditCard,
  Save,
  CheckCircle,
  Home
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { User } from "@/api/entities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Calendar, AlertCircle, ReceiptText } from "lucide-react";

export default function BusinessProfile() {
  const navigate = useNavigate();
  const [siteConfig, setSiteConfig] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [paymentSettings, setPaymentSettings] = useState({
    payment_methods: {
      credit_card: false,
      pix: false,
      cash: true
    },
    bank_info: {
      bank_name: "",
      account_type: "",
      account_number: "",
      agency: "",
      pix_key: "",
      pix_key_type: "CPF"
    }
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const checkPendingSync = async () => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser?.pendingSync) {
        const pendingData = localStorage.getItem('pendingBusiness');
        
        if (pendingData) {
          try {
            // Tentar sincronizar dados pendentes
            const businessData = JSON.parse(pendingData);
            const newBusiness = await Business.create(businessData);
            
            // Atualizar dados do usuário
            const updatedUser = {
              ...currentUser,
              id: newBusiness.id,
              business_id: newBusiness.id,
              is_temp: false,
              pendingSync: false
            };
            
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            localStorage.removeItem('pendingBusiness');
            
            // Recarregar página para atualizar dados
            window.location.reload();
          } catch (error) {
            console.error("Erro ao sincronizar dados:", error);
            // Mostrar banner de aviso
            toast({
              title: "Sincronização pendente",
              description: "Alguns recursos podem estar limitados até a sincronização ser concluída.",
              duration: 5000
            });
          }
        }
      }
    };
    
    checkPendingSync();
  }, []);

  useEffect(() => {
    loadData();
  }, [navigate]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Verificar autenticação
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) {
        navigate(createPageUrl("UserAccount"));
        return;
      }
      
      const userData = JSON.parse(storedUser);
      setCurrentUser(userData);
      
      // Carregar dados do negócio
      if (userData.business_id) {
        const businessData = await Business.get(userData.business_id);
        setBusiness(businessData);
        
        // Inicializar formulário com dados existentes
        setFormData({
          business_name: businessData.business_name || "",
          business_email: businessData.business_email || "",
          business_phone: businessData.business_phone || "",
          business_type: businessData.business_type || "",
          description: businessData.description || "",
          address: businessData.address || "",
          website: businessData.website || "",
          opening_hours: businessData.opening_hours || ""
        });
        
      } else {
        navigate(createPageUrl("UserAccount"));
      }
      
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do seu negócio.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);

      // 1. Obter usuário atual do localStorage
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        navigate(createPageUrl("UserAccount"));
        return;
      }

      const currentUser = JSON.parse(currentUserStr);

      // 2. Buscar negócio diretamente usando o ID do negócio no usuário atual
      if (currentUser.business_id) {
        try {
          const businessData = await Business.get(currentUser.business_id);
          if (businessData) {
            setBusiness(businessData);
            return;
          }
        } catch (error) {
          console.error("Erro ao buscar negócio:", error);
        }
      }

      // 3. Se não encontrar, buscar por credenciais
      try {
        const credentials = await BusinessCredential.filter({
          email: currentUser.email
        });

        if (credentials && credentials.length > 0) {
          const businessData = await Business.get(credentials[0].business_id);
          if (businessData) {
            setBusiness(businessData);
            // Atualizar usuário no localStorage
            const updatedUser = { ...currentUser, business_id: businessData.id };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            return;
          }
        }
      } catch (error) {
          console.error("Erro ao buscar credenciais:", error);
      }

      // 4. Se não encontrar negócio, redirecionar para EditBusiness
      navigate(createPageUrl("EditBusiness"));

    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      toast({
        title: "Erro",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigate(createPageUrl("EditBusiness"));
  };

  const goToGallery = () => {
    navigate(createPageUrl("BusinessGallery"));
  };

  const goToProducts = () => {
    if (!business?.id) {
      toast({
        title: "Erro",
        description: "ID do comércio não encontrado",
        variant: "destructive"
      });
      return;
    }
    navigate(createPageUrl("BusinessProducts") + `?id=${business.id}`);
  };

  const goToPayments = () => {
    navigate(createPageUrl("BusinessPayments"));
  };

  const goToWallet = () => {
    navigate(createPageUrl("BusinessWallet"));
  };

  const goToSubscriptionPlans = () => {
    navigate(createPageUrl("BusinessPlans"));
  };

  const [paymentMethods, setPaymentMethods] = useState({
    credit_card: false,
    pix: false,
    cash: true
  });

  const [bankInfo, setBankInfo] = useState({
    bank_name: "",
    account_type: "",
    account_number: "",
    agency: "",
    pix_key: "",
    pix_key_type: "CPF"
  });

  useEffect(() => {
    const loadBusinessData = async () => {
      if (currentUser?.business_id) {
        try {
          const businessData = await Business.get(currentUser.business_id);
          setBusiness(businessData);
          
          // Validar status da assinatura
          const isSubscriptionActive = 
            businessData.subscription_status === "active" && 
            businessData.subscription_end_date && 
            new Date(businessData.subscription_end_date) > new Date();

          // Se a assinatura expirou, atualizar o status
          if (businessData.subscription_status === "active" && 
              businessData.subscription_end_date && 
              new Date(businessData.subscription_end_date) <= new Date()) {
            await Business.update(businessData.id, {
              ...businessData,
              subscription_status: "expired"
            });
            businessData.subscription_status = "expired";
          }

          // Se está pendente mas já passou muito tempo, expirar
          if (businessData.subscription_status === "pending" && 
              businessData.subscription_start_date &&
              new Date(businessData.subscription_start_date) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
            await Business.update(businessData.id, {
              ...businessData,
              subscription_status: "expired"
            });
            businessData.subscription_status = "expired";
          }

          setBusiness(businessData);
  
          // Initialize payment settings from business data
          if (businessData?.payment_settings) {
            setPaymentSettings(businessData.payment_settings);
            setPaymentMethods(businessData.payment_settings.payment_methods || { credit_card: false, pix: false, cash: true });
            setBankInfo(businessData.payment_settings.bank_info || { bank_name: "", account_type: "", account_number: "", agency: "", pix_key: "", pix_key_type: "CPF" });
          }
        } catch (error) {
          console.error("Erro ao carregar dados do negócio:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do seu negócio.",
            variant: "destructive"
          });
        }
      }
    };

    if (currentUser) {
      loadBusinessData();
    }
  }, [currentUser]);
  
  // Adicionar função para verificar e corrigir as configurações de pagamento
  useEffect(() => {
    const fixPaymentSettings = async () => {
      if (business && (!business.payment_settings || !business.payment_settings.bank_info)) {
        try {
          // Criar estrutura padrão de configurações de pagamento se não existir
          const defaultPaymentSettings = {
            payment_methods: {
              credit_card: false,
              pix: false,
              cash: true
            },
            bank_info: {
              bank_name: "",
              account_type: "",
              account_number: "",
              agency: "",
              pix_key: "",
              pix_key_type: "CPF"
            }
          };
          
          console.log("Corrigindo configurações de pagamento...");
          await Business.update(business.id, {
            ...business,
            payment_settings: defaultPaymentSettings
          });
          
          // Recarregar dados
          loadBusinessData();
        } catch (error) {
          console.error("Erro ao corrigir configurações de pagamento:", error);
        }
      }
    };
    
    const loadBusinessData = async () => {
        if (currentUser?.business_id) {
          try {
            const businessData = await Business.get(currentUser.business_id);
            setBusiness(businessData);
    
            // Initialize payment settings from business data
            if (businessData?.payment_settings) {
              setPaymentSettings(businessData.payment_settings);
              setPaymentMethods(businessData.payment_settings.payment_methods || { credit_card: false, pix: false, cash: true });
              setBankInfo(businessData.payment_settings.bank_info || { bank_name: "", account_type: "", account_number: "", agency: "", pix_key: "", pix_key_type: "CPF" });
            }
          } catch (error) {
            console.error("Erro ao carregar dados do negócio:", error);
            toast({
              title: "Erro",
              description: "Não foi possível carregar os dados do seu negócio.",
              variant: "destructive"
            });
          }
        }
      };

    if (business) {
      fixPaymentSettings();
    }
  }, [business, currentUser]);
  
  // Melhorar função de salvamento das configurações de pagamento
  const handleSavePaymentSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Certificar-se que o business tem payment_settings com estrutura correta
      const updatedPaymentSettings = {
        payment_methods: {
          credit_card: paymentMethods.credit_card,
          pix: paymentMethods.pix,
          cash: paymentMethods.cash
        },
        bank_info: {
          bank_name: bankInfo.bank_name,
          account_type: bankInfo.account_type,
          account_number: bankInfo.account_number,
          agency: bankInfo.agency,
          pix_key: bankInfo.pix_key,
          pix_key_type: bankInfo.pix_key_type || "CPF"
        }
      };
      
      console.log("Salvando configurações:", updatedPaymentSettings);
      
      const updatedBusiness = await Business.update(business.id, {
        ...business,
        payment_settings: updatedPaymentSettings
      });
      
      setBusiness(updatedBusiness);
      toast({
        title: "Configurações salvas",
        description: "As configurações de pagamento foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações de pagamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handlePaymentMethodChange = (method, value) => {
    setPaymentMethods(prev => ({ ...prev, [method]: value }));
  };

  const handleBankInfoChange = (field, value) => {
    setBankInfo(prev => ({ ...prev, [field]: value }));
  };

  const renderPaymentSettings = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Pagamento</CardTitle>
          <CardDescription>
            Configure os métodos de pagamento aceitos e suas informações bancárias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSavePaymentSettings} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Métodos de Pagamento Aceitos</h3>
              
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="credit_card"
                    checked={paymentMethods.credit_card}
                    onCheckedChange={(checked) => handlePaymentMethodChange("credit_card", checked)}
                  />
                  <label htmlFor="credit_card">Cartão de Crédito</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="pix"
                    checked={paymentMethods.pix}
                    onCheckedChange={(checked) => handlePaymentMethodChange("pix", checked)}
                  />
                  <label htmlFor="pix">PIX</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cash"
                    checked={paymentMethods.cash}
                    onCheckedChange={(checked) => handlePaymentMethodChange("cash", checked)}
                  />
                  <label htmlFor="cash">Dinheiro</label>
                </div>
              </div>
              
              {paymentMethods.pix && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações de PIX</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pix_key">Chave PIX</Label>
                    <Input
                      id="pix_key"
                      value={bankInfo.pix_key || ""}
                      onChange={(e) => handleBankInfoChange("pix_key", e.target.value)}
                      placeholder="Insira sua chave PIX"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Nome do Banco</Label>
                    <Input
                      id="bank_name"
                      value={bankInfo.bank_name || ""}
                      onChange={(e) => handleBankInfoChange("bank_name", e.target.value)}
                      placeholder="Nome do banco"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Configurações de Pagamento"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  const handlePaymentSettingsChange = (type, field, value) => {
    setPaymentSettings(prev => {
      if (type === 'methods') {
        return {
          ...prev,
          payment_methods: {
            ...prev.payment_methods,
            [field]: value,
          },
        };
      } else if (type === 'bank') {
        return {
          ...prev,
          bank_info: {
            ...prev.bank_info,
            [field]: value,
          },
        };
      }
      return prev;
    });
  };
  
  const handlePaymentSettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updatedBusiness = await Business.update(business.id, {
        ...business,
        payment_settings: paymentSettings,
      });
      
      setBusiness(updatedBusiness);
      toast({
        title: "Configurações salvas",
        description: "As configurações de pagamento foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações de pagamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Renderização da aba de pagamentos
  const renderPaymentsTab = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pagamento</CardTitle>
            <CardDescription>
              Selecione quais formas de pagamento você deseja oferecer aos clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePaymentSettingsSubmit}>
              <div className="grid gap-6">
                <div className="space-y-4">
                  <Label className="text-base">Métodos aceitos</Label>
                  
                  <div className="grid gap-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="credit-card" 
                        checked={paymentSettings.payment_methods?.credit_card} 
                        onCheckedChange={(value) => handlePaymentSettingsChange('methods', 'credit_card', value)}
                      />
                      <Label htmlFor="credit-card" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        Cartão de Crédito
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="pix" 
                        checked={paymentSettings.payment_methods?.pix} 
                        onCheckedChange={(value) => handlePaymentSettingsChange('methods', 'pix', value)}
                      />
                      <Label htmlFor="pix" className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500">
                          <path fill="currentColor" d="M7.03 8.94l-2.4 2.4 2.4 2.4c.41.41.41 1.07 0 1.48-.41.41-1.07.41-1.48 0l-3.15-3.15c-.41-.41-.41-1.08 0-1.49l3.15-3.15c.41-.41 1.07-.41 1.48 0 .41.42.41 1.08 0 1.49M9.95 0l2.4 2.4-2.4 2.4c-.41.41-.41 1.07 0 1.48.41.41 1.07.41 1.48 0l3.15-3.15c.41-.41.41-1.08 0-1.49l-3.15-3.15c-.41-.41-1.07-.41-1.48 0-.41.42-.41 1.08 0 1.49M13 9h-2v3H9v2h2v3h2v-3h2v-2h-2V9z" />
                        </svg>
                        PIX
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Se PIX estiver selecionado, mostrar campos de chave PIX */}
                {paymentSettings.payment_methods?.pix && (
                  <div>
                    <Label className="text-base mb-2 block">Informações PIX</Label>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Tipo de Chave PIX</Label>
                          <Select 
                            value={paymentSettings.bank_info?.pix_key_type || 'CPF'}
                            onValueChange={(value) => handlePaymentSettingsChange('bank', 'pix_key_type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CPF">CPF</SelectItem>
                              <SelectItem value="CNPJ">CNPJ</SelectItem>
                              <SelectItem value="EMAIL">E-mail</SelectItem>
                              <SelectItem value="TELEFONE">Telefone</SelectItem>
                              <SelectItem value="ALEATORIA">Chave Aleatória</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Chave PIX</Label>
                          <Input
                            value={paymentSettings.bank_info?.pix_key || ''}
                            onChange={(e) => handlePaymentSettingsChange('bank', 'pix_key', e.target.value)}
                            placeholder="Insira sua chave PIX"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end mt-6">
                  <Button 
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Configurações
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link 
          to={createPageUrl("Public")}
          className="text-gray-600 mb-4 flex items-center hover:text-blue-600 transition-colors"
        >
          <Home className="h-4 w-4 mr-2" />
          Voltar para Home
        </Link>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Banner e Informações Básicas */}
          <div className="bg-blue-600 h-32 relative">
            {business?.image_url && (
              <img
                src={business.image_url}
                alt={business.business_name}
                className="w-full h-full object-cover"
              />
            )}
            <Button
              onClick={handleEditProfile}
              className="absolute top-4 right-4"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
          </div>

          <div className="p-6">
            {/* Logo/Ícone do Negócio */}
            <div className="flex items-start">
              <div className="flex-shrink-0 -mt-12 mr-4">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <Store className="w-12 h-12 text-blue-600" />
                </div>
              </div>

              <div className="pt-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {business?.business_name || "Nome do Comércio"}
                </h1>
                <div className="flex items-center mt-1">
                  <Badge className="mr-2 bg-blue-100 text-blue-800">
                    {business?.business_type || "Tipo de Comércio"}
                  </Badge>
                  <Badge variant="outline">
                    {business?.status === "approved" ? "Aprovado" : business?.status === "rejected" ? "Rejeitado" : "Pendente"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Informações de Contato */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-2" />
                <span>{business?.business_phone || "Telefone não informado"}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-2" />
                <span>{business?.business_email || "E-mail não informado"}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                <span>{business?.address || "Endereço não informado"}</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-5 h-5 text-gray-400 mr-2" />
                <span>
                  {business?.website ? (
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                      {business.website}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  ) : (
                    "Website não informado"
                  )}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-400 mr-2" />
                <span>{business?.opening_hours || "Horário não informado"}</span>
              </div>
            </div>

            {/* Descrição */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Sobre</h2>
              <p className="text-gray-700">
                {business?.description || "Nenhuma descrição fornecida."}
              </p>
            </div>
          </div>
        </div>

        {/* Seção de Status de Assinatura */}
        {business && (
          <div className="p-4 mb-6 rounded-lg border">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <Shield className="mr-2 h-5 w-5 text-indigo-600" />
              Status da Assinatura
            </h2>
            
            {business.subscription_status === "active" && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium text-green-800">Assinatura Ativa</h3>
                </div>
                
                <p className="text-green-700 text-sm mb-3">
                  Seu negócio está ativo e visível para todos os usuários.
                </p>
                
                {business.subscription_end_date && (
                  <div className="flex items-center text-sm text-green-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      Validade: {new Date(business.subscription_end_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            )} 

            {business.subscription_status === "pending" && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="font-medium text-yellow-800">Pagamento Pendente</h3>
                </div>
                
                <p className="text-yellow-700 text-sm mb-3">
                  Aguardando confirmação do pagamento. Assim que confirmado, seu negócio será exibido.
                </p>
              </div>
            )}

            {(business.subscription_status === "expired" || !business.subscription_status || business.subscription_status === "not_subscribed") && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-5 w-5 text-gray-600 mr-2" />
                  <h3 className="font-medium text-gray-800">Sem Assinatura Ativa</h3>
                </div>
                
                <p className="text-gray-700 text-sm mb-4">
                  Seu negócio não está visível publicamente. Assine um plano para que 
                  seu negócio apareça nas listagens públicas do site.
                </p>
                
                <Button 
                  onClick={() => navigate(createPageUrl("BusinessPlans"))}
                  className="bg-indigo-600 hover:bg-indigo-700 w-full"
                >
                  <ReceiptText className="h-4 w-4 mr-2" />
                  Ver Planos Disponíveis
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Ações/Menu do Comércio */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Gerenciar Comércio</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center py-6 px-4"
              onClick={goToProducts}
            >
              <ShoppingBag className="w-10 h-10 text-blue-600 mb-2" />
              <span className="text-lg font-medium">Produtos</span>
              <span className="text-sm text-gray-500">Gerenciar produtos e serviços</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center py-6 px-4"
              onClick={goToGallery}
            >
              <Image className="w-10 h-10 text-purple-600 mb-2" />
              <span className="text-lg font-medium">Galeria</span>
              <span className="text-sm text-gray-500">Fotos do estabelecimento</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center py-6 px-4"
              onClick={goToPayments}
            >
              <DollarSign className="w-10 h-10 text-green-600 mb-2" />
              <span className="text-lg font-medium">Pagamentos</span>
              <span className="text-sm text-gray-500">Métodos e configurações</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center py-6 px-4"
              onClick={goToWallet}
            >
              <Wallet className="w-10 h-10 text-amber-600 mb-2" />
              <span className="text-lg font-medium">Carteira Digital</span>
              <span className="text-sm text-gray-500">Saldo e transações</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center py-6 px-4"
              onClick={goToSubscriptionPlans}
            >
              <Percent className="w-10 h-10 text-red-600 mb-2" />
              <span className="text-lg font-medium">Planos</span>
              <span className="text-sm text-gray-500">Assinaturas e benefícios</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center py-6 px-4"
            >
              <BarChart className="w-10 h-10 text-indigo-600 mb-2" />
              <span className="text-lg font-medium">Relatórios</span>
              <span className="text-sm text-gray-500">Estatísticas e dados</span>
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="gallery">Galeria</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info">
            <div>Informações</div>
          </TabsContent>
          
          <TabsContent value="products">
            <div>Produtos</div>
          </TabsContent>
          
          <TabsContent value="payments">
            {renderPaymentsTab()}
          </TabsContent>
          
          <TabsContent value="gallery">
            <div>Galeria</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
