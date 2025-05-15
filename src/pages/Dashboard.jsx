
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, Waves, Store, Users, Wrench, BarChart4, TrendingUp, 
  MessageSquare, CreditCard, DollarSign, Calendar, PieChart,
  ArrowUpCircle, Hammer, Paintbrush, Activity, BellRing,
  Briefcase, Zap, Star, RefreshCw, Bell, Plus, Search, 
  Crown, Settings, HelpCircle, ExternalLink, UserPlus, Globe,
  Menu, X, ChevronDown, Download, ChevronUp, Filter, AlertTriangle,
  CheckCircle2, Clock, ArrowDown, Sparkles, Sun, ArrowRight,
  UserIcon, Image, Mail, Lock
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";

import { City } from "@/api/entities";
import { Beach } from "@/api/entities";
import { Business } from "@/api/entities";
import { ServiceProvider } from "@/api/entities";
import { Tourist } from "@/api/entities";
import { Review } from "@/api/entities";
import { UserSubscription } from "@/api/entities";
import { User } from "@/api/entities";
import { SubscriptionPlan } from "@/api/entities";
import ProfileImageDialog from "@/components/admin/ProfileImageDialog";
import NameDialog from "@/components/admin/NameDialog";
import EmailDialog from "@/components/admin/EmailDialog";
import PasswordDialog from "@/components/admin/PasswordDialog";

export default function Dashboard() {
  const [stats, setStats] = useState({
    cities: 0,
    beaches: 0,
    businesses: 0,
    serviceProviders: 0,
    tourists: 0,
    clubMembers: 0,
    reviews: 0,
    subscriptions: 0,
    conversionRate: 0,
    totalRevenue: 0,
    serviceProvidersByType: {},
    payments: {
      pending: 0,
      completed: 0,
      failed: 0
    },
    cancellationRate: 5.2,
    monthlyGrowth: 12.4
  });
  
  const [timeFilter, setTimeFilter] = useState("month");
  const [dateRangeFilter, setDateRangeFilter] = useState("last30");
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [revenueData, setRevenueData] = useState([]);
  const [membershipData, setMembershipData] = useState([]);
  const [serviceTypeData, setServiceTypeData] = useState([]);
  
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showPendingTasks, setShowPendingTasks] = useState(true);
  const [showProfileConfig, setShowProfileConfig] = useState(false);
  const [showProfileImageDialog, setShowProfileImageDialog] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showFinanceMenu, setShowFinanceMenu] = useState(false);
  
  const COLORS = ['#007BFF', '#FF5722', '#FFC107', '#4CAF50', '#9C27B0'];

  const dashboardCards = [
    {
      title: "Cidades",
      path: "Cities",
      value: stats.cities,
      icon: Building2,
      color: "from-[#007BFF] to-[#0069d9]",
      textColor: "text-white",
      growth: "+5%"
    },
    {
      title: "Praias",
      path: "Beaches",
      value: stats.beaches,
      icon: Waves,
      color: "from-[#0091EA] to-[#0277BD]",
      textColor: "text-white",
      growth: "+8%"
    },
    {
      title: "Comércios",
      path: "Businesses",
      value: stats.businesses,
      icon: Store,
      color: "from-[#00BCD4] to-[#0097A7]",
      textColor: "text-white",
      growth: "+12%"
    },
    {
      title: "Prestadores",
      path: "ServiceProviders",
      value: stats.serviceProviders,
      icon: Wrench,
      color: "from-[#4DB6AC] to-[#00897B]",
      textColor: "text-white",
      growth: "+3%"
    },
    {
      title: "Turistas",
      path: "Tourists",
      value: stats.tourists,
      icon: Users,
      color: "from-[#5C6BC0] to-[#3949AB]",
      textColor: "text-white",
      growth: "+7%"
    },
    {
      title: "Avaliações",
      path: "Reviews",
      value: stats.reviews,
      icon: MessageSquare,
      color: "from-[#7E57C2] to-[#5E35B1]",
      textColor: "text-white",
      growth: "+15%"
    }
  ];

  const navigate = useNavigate();

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const userData = await User.me();
        setCurrentUser(userData);
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };
    
    loadCurrentUser();
    
    const loadNotifications = async () => {
      try {
        const subscriptions = await UserSubscription.list(
          "-created_date",
          5,
          undefined,
          ["user_data", "plan_data"]
        );

        const notifications = subscriptions.map(subscription => ({
          type: "subscription",
          icon: UserPlus,
          title: `${subscription.user_data?.full_name || 'Novo usuário'} aderiu ao plano ${subscription.plan_data?.name || 'Premium'}`,
          time: subscription.created_date,
          status: subscription.status
        }));

        setNotifications(notifications);
      } catch (error) {
        console.error("Erro ao carregar notificações:", error);
      }
    };

    loadNotifications();

    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const mockData = {
          cities: [
            { id: "1", name: "Florianópolis" },
            { id: "2", name: "Balneário Camboriú" },
            { id: "3", name: "Bombinhas" },
            { id: "4", name: "Itapema" },
            { id: "5", name: "Garopaba" }
          ],
          beaches: [
            { id: "1", name: "Jurerê Internacional", city_id: "1" },
            { id: "2", name: "Canasvieiras", city_id: "1" },
            { id: "3", name: "Praia Central", city_id: "2" },
            { id: "4", name: "Mariscal", city_id: "3" },
            { id: "5", name: "Meia Praia", city_id: "4" }
          ],
          businesses: [
            { id: "1", name: "Restaurante Beira Mar", type: "restaurante", city_id: "1" },
            { id: "2", name: "Hotel Costa Norte", type: "hotel", city_id: "1" },
            { id: "3", name: "Pousada do Mar", type: "pousada", city_id: "2" },
            { id: "4", name: "Loja Surf Shop", type: "loja", city_id: "3" },
            { id: "5", name: "Mercado Praia", type: "outros", city_id: "4" }
          ],
          providers: [
            { id: "1", name: "João Silva", service_type: "pintor", city_id: "1" },
            { id: "2", name: "Maria Oliveira", service_type: "diarista", city_id: "2" },
            { id: "3", name: "Pedro Santos", service_type: "eletricista", city_id: "3" },
            { id: "4", name: "Ana Costa", service_type: "pedreiro", city_id: "4" },
            { id: "5", name: "Carlos Souza", service_type: "outros", city_id: "5" }
          ],
          tourists: [
            { id: "1", user_id: "1", is_club_member: true },
            { id: "2", user_id: "2", is_club_member: false },
            { id: "3", user_id: "3", is_club_member: true },
            { id: "4", user_id: "4", is_club_member: false },
            { id: "5", user_id: "5", is_club_member: true }
          ],
          reviews: [
            { id: "1", entity_type: "beach", rating: 5 },
            { id: "2", entity_type: "business", rating: 4 },
            { id: "3", entity_type: "city", rating: 5 },
            { id: "4", entity_type: "business", rating: 3 },
            { id: "5", entity_type: "beach", rating: 4 }
          ],
          subscriptions: [
            { id: "a1", plan_id: "1", user_id: "1" },
            { id: "b2", plan_id: "2", user_id: "2" },
            { id: "c3", plan_id: "1", user_id: "3" },
            { id: "d4", plan_id: "2", user_id: "4" },
            { id: "e5", plan_id: "3", user_id: "5" }
          ]
        };

        const citiesData = mockData.cities;
        const beachesData = mockData.beaches;
        const businessesData = mockData.businesses;
        const providersData = mockData.providers;
        const touristsData = mockData.tourists;
        const reviewsData = mockData.reviews;
        const subscriptionsData = mockData.subscriptions;

        const clubMembers = touristsData.filter(tourist => tourist.is_club_member).length;
        
        const conversionRate = touristsData.length > 0 
          ? (clubMembers / touristsData.length) * 100 
          : 0;
        
        const serviceProvidersByType = {};
        providersData.forEach(provider => {
          if (!serviceProvidersByType[provider.service_type]) {
            serviceProvidersByType[provider.service_type] = 0;
          }
          serviceProvidersByType[provider.service_type]++;
        });

        const payments = {
          pending: Math.floor(Math.random() * 50),
          completed: Math.floor(Math.random() * 100) + 50,
          failed: Math.floor(Math.random() * 30)
        };
        
        const totalRevenue = subscriptionsData.reduce((total, sub) => {
          const amount = parseInt(sub.id?.substring(0, 2), 16) || 0;
          return total + amount;
        }, 0);

        setStats({
          cities: citiesData.length,
          beaches: beachesData.length,
          businesses: businessesData.length,
          serviceProviders: providersData.length,
          tourists: touristsData.length,
          clubMembers,
          reviews: reviewsData.length,
          subscriptions: subscriptionsData.length,
          conversionRate: conversionRate.toFixed(2),
          totalRevenue,
          serviceProvidersByType,
          payments,
          cancellationRate: 5.2,
          monthlyGrowth: 12.4
        });

        const serviceTypes = Object.keys(serviceProvidersByType);
        setServiceTypeData(serviceTypes.map(type => ({
          name: formatServiceType(type),
          value: serviceProvidersByType[type]
        })));

        setLastUpdated(new Date());
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };
    
    loadStats();
    generateMockChartData();
    
    const intervalId = setInterval(() => {
      loadStats();
      generateMockChartData();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [timeFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStats();
    await loadNotifications();
    setIsRefreshing(false);
  };

  const generateMockChartData = () => {
    let dataPoints = 0;
    
    switch (timeFilter) {
      case "day":
        dataPoints = 24;
        break;
      case "week":
        dataPoints = 7;
        break;
      case "month":
        dataPoints = 30;
        break;
      case "semester":
        dataPoints = 6;
        break;
      case "year":
        dataPoints = 12;
        break;
      default:
        dataPoints = 30;
    }
    
    const revenue = Array.from({ length: dataPoints }, (_, i) => ({
      name: `Ponto ${i + 1}`,
      receita: Math.floor(Math.random() * 5000) + 2000,
      membros: Math.floor(Math.random() * 50) + 10,
    }));
    
    setRevenueData(revenue);
    
    const memberJoins = Array.from({ length: dataPoints }, (_, i) => ({
      name: `Ponto ${i + 1}`,
      novos: Math.floor(Math.random() * 30) + 5,
      cancelamentos: Math.floor(Math.random() * 10),
    }));
    
    setMembershipData(memberJoins);
  };

  const formatServiceType = (type) => {
    const typeNames = {
      'pintor': 'Pintores',
      'diarista': 'Diaristas',
      'eletricista': 'Eletricistas',
      'pedreiro': 'Pedreiros',
      'outros': 'Outros'
    };
    
    return typeNames[type] || type;
  };

  const formatLastUpdated = () => {
    const options = { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    return lastUpdated.toLocaleString('pt-BR', options);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const menuItems = [
    { name: "Visão Geral", icon: BarChart4, active: true, path: "Dashboard" },
    { name: "Financeiro", icon: DollarSign, active: false, hasFinanceMenu: true },
    { name: "Planos", icon: Crown, active: false, path: "SubscriptionPlansAdmin", hasSubmenu: false },
    { name: "Eventos", icon: Calendar, active: false, path: "EventsAdmin", hasSubmenu: false },
    { name: "Configurações", icon: Settings, active: false, hasSubmenu: true },
    { name: "Config Admin", icon: UserIcon, active: false, hasConfigMenu: true },
  ];

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const handlePieChartClick = (data, index) => {
    console.log("Clicou na fatia:", data);
    alert(`Detalhes de ${data.name}: ${data.value} prestadores`);
  };

  const dateRangeOptions = [
    { value: "today", label: "Hoje" },
    { value: "last7", label: "Últimos 7 Dias" },
    { value: "last30", label: "Últimos 30 Dias" },
    { value: "custom", label: "Personalizado" }
  ];

  const pendingTasks = [
    { id: 1, title: "Confirmar 28 pagamentos", status: "urgent", category: "payment" },
    { id: 2, title: "Validar 47 novos usuários", status: "pending", category: "user" },
    { id: 3, title: "Revisar 15 avaliações denunciadas", status: "pending", category: "review" }
  ];

  const handleResolveTask = (taskId) => {
    switch (taskId) {
      case 1: // Confirmar pagamentos
        navigate(createPageUrl("SubscriptionPlansAdmin") + "?tab=subscriptions&pendingPayments=true");
        break;
      case 2: // Validar usuários
        navigate(createPageUrl("NonMembers") + "?filter=pending");
        break;
      case 3: // Revisar avaliações
        navigate(createPageUrl("Reviews") + "?filter=reported");
        break;
      default:
        break;
    }
  };

  return (
    <div className="p-2 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-md rounded-lg mb-6">
          <div className="p-3 flex justify-between items-center">
            <div className="hidden md:flex items-center gap-4">
              {menuItems.map((item, index) => (
                <div key={index} className="relative">
                  <Button 
                    variant={item.active ? "default" : "ghost"}
                    className={`flex items-center gap-2 ${item.active ? 'bg-[#007BFF] text-white hover:bg-[#0069d9]' : ''}`}
                    size="sm"
                    onClick={() => {
                      if (item.hasSubmenu) {
                        setShowSettingsMenu(!showSettingsMenu);
                      } else if (item.hasConfigMenu) {
                        setShowProfileConfig(!showProfileConfig);
                      } else if (item.hasFinanceMenu) {
                        setShowFinanceMenu(!showFinanceMenu);
                      } else if (item.path) {
                        navigate(createPageUrl(item.path));
                      }
                    }}
                  >
                    <item.icon className="w-4 h-4" />
                    <span style={{fontFamily: "'Montserrat', sans-serif"}}>{item.name}</span>
                    {(item.hasSubmenu || item.hasConfigMenu || item.hasFinanceMenu) && (
                      <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </Button>
                  
                  {item.hasSubmenu && showSettingsMenu && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-20">
                      <div className="py-1">
                        <Link 
                          to={createPageUrl("SiteConfiguration")}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Settings className="w-4 h-4 mr-2 text-gray-500" />
                          Configuração Geral
                        </Link>
                        <Link 
                          to={createPageUrl("CardSettings")}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                          Configurar Cartão
                        </Link>
                        <Link 
                          to={createPageUrl("Community")}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Users className="w-4 h-4 mr-2 text-gray-500" />
                          Comunidade
                        </Link>
                        <Link 
                          to={createPageUrl("NonMembers")}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <UserPlus className="w-4 h-4 mr-2 text-gray-500" />
                          Usuários não membros
                        </Link>
                      </div>
                    </div>
                  )}

                  {item.hasFinanceMenu && showFinanceMenu && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-20">
                      <div className="py-1">
                        <Link 
                          to={createPageUrl("FinancialDashboard")}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#007BFF] hover:text-white"
                        >
                          <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                          Dashboard Financeiro
                        </Link>
                        <Link 
                          to={createPageUrl("Statistics")}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#007BFF] hover:text-white"
                        >
                          <Activity className="w-4 h-4 mr-2 text-gray-500" />
                          Estatísticas
                        </Link>
                      </div>
                    </div>
                  )}

                  {item.hasConfigMenu && showProfileConfig && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-20">
                      <div className="py-1">
                        <button 
                          onClick={() => setShowProfileImageDialog(true)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-[#007BFF] hover:text-white"
                        >
                          <Image className="w-4 h-4 mr-2 text-gray-500" />
                          Alterar Foto de Perfil
                        </button>
                        <button 
                          onClick={() => setShowNameDialog(true)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-[#007BFF] hover:text-white"
                        >
                          <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                          Mudar Nome
                        </button>
                        <button 
                          onClick={() => setShowEmailDialog(true)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-[#007BFF] hover:text-white"
                        >
                          <Mail className="w-4 h-4 mr-2 text-gray-500" />
                          Alterar E-mail de Acesso
                        </button>
                        <button 
                          onClick={() => setShowPasswordDialog(true)} 
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-[#007BFF] hover:text-white"
                        >
                          <Lock className="w-4 h-4 mr-2 text-gray-500" />
                          Mudar Senha de Acesso
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[250px] p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    {menuItems.map((item, index) => (
                      <div key={index}>
                        {item.hasFinanceMenu ? (
                          <div>
                            <button 
                              className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowFinanceMenu(!showFinanceMenu)}
                            >
                              <div className="flex items-center">
                                <item.icon className="w-4 h-4 mr-2 text-gray-500" />
                                <span>{item.name}</span>
                              </div>
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            {showFinanceMenu && (
                              <div className="ml-6 border-l border-gray-200 pl-2">
                                <Link 
                                  to={createPageUrl("FinancialDashboard")}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                                  Dashboard Financeiro
                                </Link>
                                <Link 
                                  to={createPageUrl("Statistics")}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Activity className="w-4 h-4 mr-2 text-gray-500" />
                                  Estatísticas
                                </Link>
                              </div>
                            )}
                          </div>
                        ) : item.hasSubmenu ? (
                          <div>
                            <button 
                              className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                            >
                              <div className="flex items-center">
                                <item.icon className="w-4 h-4 mr-2 text-gray-500" />
                                <span>{item.name}</span>
                              </div>
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            {showSettingsMenu && (
                              <div className="ml-6 border-l border-gray-200 pl-2">
                                <Link 
                                  to={createPageUrl("SiteConfiguration")}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Settings className="w-4 h-4 mr-2 text-gray-500" />
                                  Configuração Geral
                                </Link>
                                <Link 
                                  to={createPageUrl("CardSettings")}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                                  Configurar Cartão
                                </Link>
                                <Link 
                                  to={createPageUrl("Community")}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Users className="w-4 h-4 mr-2 text-gray-500" />
                                  Comunidade
                                </Link>
                                <Link 
                                  to={createPageUrl("NonMembers")}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <UserPlus className="w-4 h-4 mr-2 text-gray-500" />
                                  Usuários não membros
                                </Link>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button 
                            className={`w-full flex items-center px-4 py-2 text-sm font-medium
                              ${item.active ? 'text-[#007BFF] bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}
                            onClick={() => navigate(createPageUrl(item.path))}
                          >
                            <item.icon className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{item.name}</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="flex items-center gap-3">
              <a 
                href="/Public" 
                className="bg-[#FF5722] hover:bg-[#E64A19] text-white py-1 px-3 rounded-md text-sm flex items-center gap-1 transition-colors duration-200"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Acessar o Site</span>
              </a>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="relative"
                      onClick={toggleNotifications}
                    >
                      <Bell className="h-5 w-5" />
                      {unreadNotificationsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#FF5722] text-white text-xs w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                          {unreadNotificationsCount}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{unreadNotificationsCount} novas notificações</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
                  <div className="p-3 border-b flex justify-between items-center">
                    <h3 className="font-medium" style={{fontFamily: "'Montserrat', sans-serif"}}>Notificações</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={markAllAsRead}
                      className="text-xs text-[#007BFF] hover:text-[#0069d9]"
                    >
                      Marcar todas como lidas
                    </Button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification, index) => (
                      <div 
                        key={index} 
                        className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${notification.read ? '' : 'bg-blue-50'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            notification.type === 'subscription' ? 'bg-green-100' : 
                            notification.type === 'review' ? 'bg-[#FFC107]/20' : 'bg-red-100'
                          }`}>
                            {notification.type === 'subscription' ? (
                              <Crown className="w-4 h-4 text-green-600" />
                            ) : notification.type === 'review' ? (
                              <Star className="w-4 h-4 text-[#FFC107]" />
                            ) : (
                              <CreditCard className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-xs text-gray-600">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notification.time)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{currentUser?.full_name?.[0] || 'A'}</AvatarFallback>
                  {currentUser?.avatar_url ? (
                    <AvatarImage src={currentUser.avatar_url} alt={currentUser?.full_name || 'Admin'} />
                  ) : (
                    <AvatarImage src="/placeholder-avatar.jpg" />
                  )}
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium" style={{fontFamily: "'Montserrat', sans-serif"}}>{currentUser?.full_name || 'Administrador'}</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-4 pb-3 flex flex-col md:flex-row items-center justify-between border-t pt-3 gap-3">
            <div className="flex items-center w-full md:w-auto">
              <div className="relative w-full md:w-auto mr-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar..."
                  className="pl-9 h-9 w-full md:w-64 bg-gray-50"
                />
              </div>
              <Link to={createPageUrl("SubscriptionPlansAdmin")} className="hidden sm:block">
                <Button size="sm" className="flex items-center gap-2 ml-2 bg-[#FF5722] hover:bg-[#E64A19]">
                  <Plus className="h-4 w-4" />
                  <span>Novo Plano</span>
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 h-9"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
              
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#007BFF] rounded-lg h-9">
                <Clock className="w-4 h-4" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium">Atualizado: {formatLastUpdated()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {showPendingTasks && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-[#FFC107] mr-2" />
                <h2 className="text-lg font-semibold text-amber-800" style={{fontFamily: "'Montserrat', sans-serif"}}>Pendências</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPendingTasks(false)}
                className="text-amber-700 hover:bg-amber-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {pendingTasks.map(task => (
                <div key={task.id} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm border-l-4 border-amber-400">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full ${
                      task.category === 'payment' ? 'bg-[#FF5722]/10' : 
                      task.category === 'user' ? 'bg-blue-100' : 
                      'bg-green-100'
                    }`}>
                      {task.category === 'payment' ? (
                        <DollarSign className="w-4 h-4 text-[#FF5722]" />
                      ) : task.category === 'user' ? (
                        <Users className="w-4 h-4 text-[#007BFF]" />
                      ) : (
                        <MessageSquare className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{task.title}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                          task.status === 'urgent' ? 'bg-red-500' : 'bg-amber-500'
                        }`}></span>
                        <span>{task.status === 'urgent' ? 'Urgente' : 'Pendente'}</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="bg-[#FF5722] hover:bg-[#E64A19] text-white" 
                    size="sm"
                    onClick={() => handleResolveTask(task.id)}
                  >
                    Resolver Agora
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
          <Card className="bg-gradient-to-br from-[#E1F5FE] to-[#E3F2FD] shadow-md border border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#007BFF] text-lg flex items-center gap-2" style={{fontFamily: "'Montserrat', sans-serif"}}>
                <Sun className="w-5 h-5" />
                Clube de Membros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-[#007BFF]" style={{fontFamily: "'Montserrat', sans-serif"}}>
                    {isLoading ? (
                      <span className="inline-block w-12 h-8 bg-blue-200 animate-pulse rounded"></span>
                    ) : (
                      stats.clubMembers
                    )}
                  </p>
                  <p className="text-sm text-blue-600">membros ativos</p>
                </div>
                <div className="bg-white border border-blue-100 px-3 py-1 rounded-lg shadow-sm">
                  <p className="text-[#007BFF] font-medium flex items-center">
                    {isLoading ? (
                      <span className="inline-block w-12 h-6 bg-blue-200 animate-pulse rounded"></span>
                    ) : (
                      <>
                        <ArrowUpCircle className="w-4 h-4 mr-1 text-green-600" />
                        {`${stats.conversionRate}%`}
                      </>
                    )}
                  </p>
                  <p className="text-xs text-blue-600">taxa de conversão</p>
                </div>
              </div>
              <div className="mt-3">
                <Button className="w-full mt-2 bg-[#FF5722] hover:bg-[#E64A19] flex items-center justify-center text-white">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#E0F2F1] to-[#E8F5E9] shadow-md border border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-800 text-lg flex items-center gap-2" style={{fontFamily: "'Montserrat', sans-serif"}}>
                <DollarSign className="w-5 h-5" />
                Receita Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-green-700" style={{fontFamily: "'Montserrat', sans-serif"}}>
                    {isLoading ? (
                      <span className="inline-block w-24 h-8 bg-green-200 animate-pulse rounded"></span>
                    ) : (
                      `R$ ${stats.totalRevenue.toLocaleString()}`
                    )}
                  </p>
                  <p className="text-sm text-green-600">em assinaturas</p>
                </div>
                <div className="bg-white border border-green-100 px-3 py-1 rounded-lg shadow-sm">
                  <p className="text-green-800 font-medium flex items-center">
                    {isLoading ? (
                      <span className="inline-block w-8 h-6 bg-green-200 animate-pulse rounded"></span>
                    ) : (
                      <>
                        <ArrowUpCircle className="w-4 h-4 mr-1 text-green-600" />
                        {`+${stats.monthlyGrowth}%`}
                      </>
                    )}
                  </p>
                  <p className="text-xs text-green-600">crescimento/mês</p>
                </div>
              </div>
              <div className="mt-3">
                <Button className="w-full mt-2 bg-[#FF5722] hover:bg-[#E64A19] flex items-center justify-center text-white">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#FFF8E1] to-[#FFFDE7] shadow-md border border-yellow-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-800 text-lg flex items-center gap-2" style={{fontFamily: "'Montserrat', sans-serif"}}>
                <BellRing className="w-5 h-5" />
                Taxa de Cancelamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-amber-600" style={{fontFamily: "'Montserrat', sans-serif"}}>
                    {isLoading ? (
                      <span className="inline-block w-12 h-8 bg-amber-200 animate-pulse rounded"></span>
                    ) : (
                      `${stats.cancellationRate}%`
                    )}
                  </p>
                  <p className="text-sm text-amber-700">dos assinantes</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white border border-amber-100 px-2 py-2 rounded-lg text-center shadow-sm">
                    <p className="text-amber-800 font-bold">
                      {isLoading ? (
                        <span className="inline-block w-6 h-6 bg-amber-200 animate-pulse rounded mx-auto"></span>
                      ) : (
                        stats.payments.pending
                      )}
                    </p>
                    <p className="text-xs text-amber-600">pendentes</p>
                  </div>
                  <div className="bg-white border border-red-100 px-2 py-2 rounded-lg text-center shadow-sm">
                    <p className="text-red-600 font-bold">
                      {isLoading ? (
                        <span className="inline-block w-6 h-6 bg-red-200 animate-pulse rounded mx-auto"></span>
                      ) : (
                        stats.payments.failed
                      )}
                    </p>
                    <p className="text-xs text-red-600">falhas</p>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Button className="w-full mt-2 bg-[#FF5722] hover:bg-[#E64A19] flex items-center justify-center text-white">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
          {dashboardCards.map((card, index) => (
            <Link to={createPageUrl(card.path)} key={index}>
              <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group h-full border border-gray-200 shadow-sm">
                <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-90`} />
                <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 rounded-full bg-white opacity-10" />
                <div className="relative h-full p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <p className={`text-sm font-medium ${card.textColor}`} style={{fontFamily: "'Montserrat', sans-serif"}}>{card.title}</p>
                    <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm transform transition-transform group-hover:scale-110 shadow-sm">
                      <card.icon className={`w-5 h-5 ${card.textColor}`} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className={`text-xl md:text-2xl font-bold ${card.textColor}`} style={{fontFamily: "'Montserrat', sans-serif"}}>
                      {isLoading ? (
                        <span className="inline-block w-12 h-8 bg-white/20 animate-pulse rounded"></span>
                      ) : (
                        card.value
                      )}
                    </p>
                    <div className={`flex items-center mt-2 text-xs md:text-sm ${card.textColor} opacity-80`}>
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>{card.growth}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="border border-blue-100 shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2" style={{fontFamily: "'Montserrat', sans-serif"}}>
                  <BarChart4 className="w-5 h-5 text-[#007BFF]" />
                  Receita por {timeFilter === 'day' ? 'Hora' : timeFilter === 'week' ? 'Dia' : timeFilter === 'month' ? 'Dia' : timeFilter === 'semester' ? 'Mês' : 'Mês'}
                </CardTitle>
                <Button variant="outline" size="sm" className="text-[#007BFF] border-[#007BFF] hover:bg-blue-50 flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-72">
              {isLoading ? (
                <div className="w-full h-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
                  <BarChart4 className="w-12 h-12 text-gray-300" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
                              <p className="font-bold">{`${label}`}</p>
                              <p className="text-[#007BFF]">{`Receita: R$ ${payload[0].value.toLocaleString()}`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="receita" 
                      name="Receita (R$)" 
                      stroke="#007BFF" 
                      strokeWidth={2}
                      activeDot={{ r: 8, fill: "#007BFF", stroke: "white", strokeWidth: 2 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border border-green-100 shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2" style={{fontFamily: "'Montserrat', sans-serif"}}>
                  <Sparkles className="w-5 h-5 text-[#FF5722]" />
                  Crescimento de Membros
                </CardTitle>
                <Button variant="outline" size="sm" className="text-[#007BFF] border-[#007BFF] hover:bg-blue-50 flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-72">
              {isLoading ? (
                <div className="w-full h-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
                  <BarChart4 className="w-12 h-12 text-gray-300" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={membershipData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
                              <p className="font-bold">{`${label}`}</p>
                              <p className="text-green-600">{`Novos: ${payload[0].value}`}</p>
                              <p className="text-red-500">{`Cancelamentos: ${payload[1].value}`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="novos" name="Novos Membros" fill="#4ade80" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cancelamentos" name="Cancelamentos" fill="#f87171" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border border-[#007BFF]/20 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2" style={{fontFamily: "'Montserrat', sans-serif"}}>
                <PieChart className="w-5 h-5 text-[#007BFF]" />
                Prestadores por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent className="h-72 flex items-center justify-center">
              {isLoading || serviceTypeData.length === 0 ? (
                <div className="w-full h-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
                  <PieChart className="w-12 h-12 text-gray-300" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={serviceTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      onClick={handlePieChartClick}
                      className="cursor-pointer"
                    >
                      {serviceTypeData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
                              <p className="font-bold text-gray-800">{`${payload[0].name}`}</p>
                              <p className="text-[#007BFF]">{`${payload[0].value} prestadores`}</p>
                              <p className="text-gray-500 text-xs mt-1">Clique para mais detalhes</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border border-[#FF5722]/20 shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2" style={{fontFamily: "'Montserrat', sans-serif"}}>
                  <Activity className="w-5 h-5 text-[#FF5722]" />
                  Atividade Recente
                </CardTitle>
                <div className="flex gap-2 items-center">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] h-8 text-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="confirmed">Confirmados</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="rejected">Recusados</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="text-[#007BFF] border-[#007BFF] hover:bg-blue-50 flex items-center gap-1 h-8">
                    <Download className="w-4 h-4" />
                    <span>Exportar</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="payments">
                <TabsList className="mb-4 bg-gray-100">
                  <TabsTrigger value="payments" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Pagamentos
                  </TabsTrigger>
                  <TabsTrigger value="members" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white">
                    <Users className="w-4 h-4 mr-1" />
                    Novos Membros
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white">
                    <Star className="w-4 h-4 mr-1" />
                    Avaliações
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="payments" className="space-y-4">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-gray-200 animate-pulse w-8 h-8"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div>
                            <div className="h-3 bg-gray-200 animate-pulse rounded w-20"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div>
                          <div className="h-3 bg-gray-200 animate-pulse rounded w-24"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-3">
                          <Checkbox id={`payment-${i}`} className="border-gray-300" />
                          <div className={`p-2 rounded-full ${i % 3 === 0 ? 'bg-green-100' : i % 3 === 1 ? 'bg-[#FFC107]/20' : 'bg-red-100'}`}>
                            <DollarSign className={`w-4 h-4 ${i % 3 === 0 ? 'text-green-600' : i % 3 === 1 ? 'text-[#FFC107]' : 'text-red-600'}`} />
                          </div>
                          <div>
                            <p className="font-medium">Pagamento de Plano {i % 3 === 0 ? 'confirmado' : i % 3 === 1 ? 'pendente' : 'recusado'}</p>
                            <p className="text-sm text-gray-500">ID: #2023{i}45</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium">R$ {(Math.random() * 100 + 50).toFixed(2)}</p>
                            <p className="text-sm text-gray-500">há {Math.floor(Math.random() * 5) + 1} horas</p>
                          </div>
                          {i % 3 === 1 && (
                            <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9]">
                              Confirmar
                            </Button>
                          )}
                          {i % 3 === 1 && (
                            <Button size="sm" variant="outline" className="text-[#FF5722] border-[#FF5722] hover:bg-[#FF5722]/10">
                              Lembrete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="members" className="space-y-4">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-gray-200 animate-pulse w-8 h-8"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div>
                            <div className="h-3 bg-gray-200 animate-pulse rounded w-20"></div>
                          </div>
                        </div>
                        <div className="h-3 bg-gray-200 animate-pulse rounded w-24"></div>
                      </div>
                    ))
                  ) : (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-3">
                          <Checkbox id={`member-${i}`} className="border-gray-300" />
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Users className="w-4 h-4 text-[#007BFF]" />
                          </div>
                          <div>
                            <p className="font-medium">Novo membro registrado</p>
                            <p className="text-sm text-gray-500">Usuário {Math.floor(Math.random() * 1000) + 1}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <p className="text-sm text-gray-500">há {Math.floor(Math.random() * 12) + 1} horas</p>
                          <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9]">
                            Detalhes
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="reviews" className="space-y-4">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-gray-200 animate-pulse w-8 h-8"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div>
                            <div className="h-3 bg-gray-200 animate-pulse rounded w-20"></div>
                          </div>
                        </div>
                        <div className="h-3 bg-gray-200 animate-pulse rounded w-24"></div>
                      </div>
                    ))
                  ) : (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-3">
                          <Checkbox id={`review-${i}`} className="border-gray-300" />
                          <div className="bg-[#FFC107]/20 p-2 rounded-full">
                            <Star className="w-4 h-4 text-[#FFC107]" />
                          </div>
                          <div>
                            <p className="font-medium">Nova avaliação {Math.floor(Math.random() * 5) + 1} estrelas</p>
                            <p className="text-sm text-gray-500">Praia {i + 1}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <p className="text-sm text-gray-500">há {Math.floor(Math.random() * 24) + 1} horas</p>
                          <Button size="sm" variant="outline" className="text-[#007BFF] border-[#007BFF] hover:bg-blue-50">
                            Ver
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {showProfileImageDialog && (
        <ProfileImageDialog 
          open={showProfileImageDialog} 
          onOpenChange={setShowProfileImageDialog} 
        />
      )}
      
      {showNameDialog && (
        <NameDialog 
          open={showNameDialog} 
          onOpenChange={setShowNameDialog} 
        />
      )}
      
      {showEmailDialog && (
        <EmailDialog 
          open={showEmailDialog} 
          onOpenChange={setShowEmailDialog} 
        />
      )}
      
      {showPasswordDialog && (
        <PasswordDialog 
          open={showPasswordDialog} 
          onOpenChange={setShowPasswordDialog} 
        />
      )}
    </div>
  );
}

const formatTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInMinutes = Math.floor((now - past) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutos`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)} horas`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)} dias`;
  }
};
