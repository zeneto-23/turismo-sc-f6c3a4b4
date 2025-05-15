
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Menu, X, Search, ChevronDown, UserIcon, LogIn, LogOut, CreditCard, Building2, Waves, Store, Wrench, Calendar, Users, Crown, Star, LayoutDashboard, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/api/entities";
import { Influencer } from "@/api/entities";
import { SiteConfig } from "@/api/entities";
import { toast } from "@/components/ui/use-toast";

export function PublicHeader({ siteConfig: providedSiteConfig }) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInfluencer, setIsInfluencer] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [siteConfig, setSiteConfig] = useState(providedSiteConfig);
  const navigate = useNavigate();

  // Carregar configurações do site se não forem fornecidas
  useEffect(() => {
    const loadSiteConfig = async () => {
      if (!providedSiteConfig) {
        try {
          const configs = await SiteConfig.list();
          if (configs && configs.length > 0) {
            setSiteConfig(configs[0]);
          }
        } catch (error) {
          console.error("Erro ao carregar configurações do site:", error);
        }
      }
    };
    
    loadSiteConfig();
  }, [providedSiteConfig]);

  // Definir configuração padrão para o site
  const defaultConfig = {
    geral: {
      site_name: "Praias Catarinenses"
    },
    aparencia: {
      logo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/logo-sc.png",
      logo_height: 50
    }
  };

  // Mesclar configuração padrão com a configuração fornecida (se existir)
  const mergedConfig = {
    geral: { ...defaultConfig.geral, ...(siteConfig?.geral || {}) },
    aparencia: { ...defaultConfig.aparencia, ...(siteConfig?.aparencia || {}) }
  };

  // Definir aqui as verificações de usuário
  const isRegisteredUser = currentUser?.email === 'contato.jrsn@gmail.com' ||
    currentUser?.email === 'diskgas@gmail.com';

  const isAdmin = currentUser?.email === 'contato.jrsn@gmail.com';

  useEffect(() => {
    // Verificar se usuário está logado via localStorage
    const storedUser = localStorage.getItem('currentUser');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (storedUser && isLoggedIn) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const checkIfInfluencer = async () => {
      if (currentUser) {
        try {
          const influencers = await Influencer.filter({ user_id: currentUser.id });
          setIsInfluencer(influencers && influencers.length > 0);
        } catch (error) {
          console.error("Erro ao verificar status de influenciador:", error);
          setIsInfluencer(false);
        }
      }
    };

    checkIfInfluencer();
  }, [currentUser]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    setCurrentUser(null);
    window.location.href = '/Public';
  };

  const handleLogin = () => {
    try {
      setIsLoading(true);
      navigate(createPageUrl("UserAccount"));
    } catch (error) {
      console.error("Erro ao iniciar login:", error);
      setIsLoading(false);
      toast({
        title: "Erro ao iniciar login",
        description: "Não foi possível iniciar o processo de login. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  console.log("Logo URL:", mergedConfig.aparencia.logo_url);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <Link to={createPageUrl("Public")} className="flex items-center">
              <img
                src={mergedConfig.aparencia.logo_url}
                alt={mergedConfig.geral.site_name || "TurismoSC"}
                className="h-10 sm:h-12 md:h-14 w-auto object-contain"
              />
            </Link>

            <div className="hidden md:flex md:items-center">
              <Link to={createPageUrl("PublicCities")} className="px-3 py-2 mx-1 text-gray-700 hover:text-blue-600">Cidades</Link>
              <Link to={createPageUrl("PublicBeaches")} className="px-3 py-2 mx-1 text-gray-700 hover:text-blue-600">Praias</Link>
              <Link to={createPageUrl("PublicProperties")} className="px-3 py-2 mx-1 text-gray-700 hover:text-blue-600">Imóveis</Link>
              <Link to={createPageUrl("PublicBusinesses")} className="px-3 py-2 mx-1 text-gray-700 hover:text-blue-600">Comércios</Link>
              <Link to={createPageUrl("PublicServiceProviders")} className="px-3 py-2 mx-1 text-gray-700 hover:text-blue-600">Prestadores</Link>
              <Link to={createPageUrl("Events")} className="px-3 py-2 mx-1 text-gray-700 hover:text-blue-600">Eventos</Link>
              <Link to={createPageUrl("Community")} className="px-3 py-2 mx-1 text-gray-700 hover:text-blue-600">Comunidade</Link>
              <Link to={createPageUrl("SubscriptionPlans")} className="flex items-center px-3 py-2 mx-1 text-gray-700 hover:text-blue-600">
                <Crown className="h-4 w-4 mr-1" /> Clube
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <div className="hidden md:flex items-center gap-2">
              {currentUser ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="text-black"
                    onClick={() => setProfileOpen(!profileOpen)}
                  >
                    <span className="mr-2">Olá, {currentUser.full_name?.split(' ')[0] || 'Usuário'}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      {isRegisteredUser && (
                        <>
                          <Link to={createPageUrl("UserProfile")} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <UserIcon className="h-4 w-4 inline mr-2" />
                            Meu Perfil
                          </Link>
                          <Link to={createPageUrl("MembershipCard")} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <CreditCard className="h-4 w-4 inline mr-2" />
                            Cartão de Membro
                          </Link>
                        </>
                      )}

                      {isAdmin && (
                        <>
                          <Link to={createPageUrl("Dashboard")} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <LayoutDashboard className="h-4 w-4 inline mr-2" />
                            Dashboard
                          </Link>
                          <Link to={createPageUrl("AdminDashboard")} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <LayoutDashboard className="h-4 w-4 inline mr-2" />
                            Admin Dashboard
                          </Link>
                        </>
                      )}

                      {isInfluencer && (
                        <Link to={createPageUrl("InfluencerProfile")} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Star className="h-4 w-4 inline mr-2" />
                          Perfil de Influenciador
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        disabled={isLoading}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 inline mr-2" />
                        {isLoading ? 'Saindo...' : 'Sair'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Button
                    className="bg-blue-600 hover:bg-blue-500 text-white"
                    onClick={() => navigate(createPageUrl("Cadastro"))}
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Cadastrar Comércio
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    onClick={() => navigate(createPageUrl("RealtorSignup"))}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Cadastrar Imobiliária
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                    onClick={handleLogin}
                    disabled={isLoading}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                className="text-black hover:bg-gray-200"
                onClick={() => navigate(createPageUrl("UserAccount"))}
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Minha Conta
              </Button>
            </div>

            <button
              className="md:hidden ml-2 p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
              onClick={toggleMenu}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden px-4 py-3 space-y-1 bg-gray-800">
          <Link to={createPageUrl("PublicCities")} className="block px-3 py-2 text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
            <Building2 className="h-4 w-4 inline mr-2" />
            Cidades
          </Link>
          <Link to={createPageUrl("PublicBeaches")} className="block px-3 py-2 text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
            <Waves className="h-4 w-4 inline mr-2" />
            Praias
          </Link>
          <Link to={createPageUrl("PublicProperties")} className="block px-3 py-2 text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
            <Home className="h-4 w-4 inline mr-2" />
            Imóveis
          </Link>
          <Link to={createPageUrl("PublicBusinesses")} className="block px-3 py-2 text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
            <Store className="h-4 w-4 inline mr-2" />
            Comércios
          </Link>
          <Link to={createPageUrl("PublicServiceProviders")} className="block px-3 py-2 text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
            <Wrench className="h-4 w-4 inline mr-2" />
            Prestadores
          </Link>
          <Link to={createPageUrl("Events")} className="block px-3 py-2 text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
            <Calendar className="h-4 w-4 inline mr-2" />
            Eventos
          </Link>
          <Link to={createPageUrl("Community")} className="block px-3 py-2 text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
            <Users className="h-4 w-4 inline mr-2" />
            Comunidade
          </Link>
          <Link to={createPageUrl("SubscriptionPlans")} className="block px-3 py-2 text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
            <Crown className="h-4 w-4 inline mr-2" />
            Clube
          </Link>

          <Link to={createPageUrl("UserAccount")} className="block px-3 py-2 text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
            <UserIcon className="h-4 w-4 inline mr-2" />
            Minha Conta
          </Link>

          {!currentUser && (
            <div className="border-t border-gray-700 my-2 py-2">
              <Link to={createPageUrl("Cadastro")} className="block px-3 py-2 text-gray-300 hover:text-white font-medium" onClick={() => setIsOpen(false)}>
                <Store className="h-4 w-4 inline mr-2" />
                Cadastrar Comércio
              </Link>
              
              {/* Adicionar link de cadastro de corretor no menu mobile */}
              <Link to={createPageUrl("RealtorSignup")} className="block px-3 py-2 text-gray-300 hover:text-white font-medium" onClick={() => setIsOpen(false)}>
                <Building2 className="h-4 w-4 inline mr-2" />
                Cadastrar Imobiliária
              </Link>
              
              <button
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white font-medium"
                onClick={() => {
                  setIsOpen(false);
                  handleLogin();
                }}
                disabled={isLoading}
              >
                <LogIn className="h-4 w-4 inline mr-2" />
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          )}

          {currentUser && (
            <div className="border-t border-gray-700 my-2 py-2">
              <Link to={createPageUrl("UserProfile")} className="block px-3 py-2 text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
                <UserIcon className="h-4 w-4 inline mr-2" />
                Meu Perfil
              </Link>
              <Link to={createPageUrl("MembershipCard")} className="block px-3 py-2 text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
                <CreditCard className="h-4 w-4 inline mr-2" />
                Cartão de Membro
              </Link>
              {isInfluencer && (
                <Link to={createPageUrl("InfluencerProfile")} className="block px-3 py-2 text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
                  <Star className="h-4 w-4 inline mr-2" />
                  Perfil de Influenciador
                </Link>
              )}
              <button
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white"
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                disabled={isLoading}
              >
                <LogOut className="h-4 w-4 inline mr-2" />
                {isLoading ? 'Saindo...' : 'Sair'}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
