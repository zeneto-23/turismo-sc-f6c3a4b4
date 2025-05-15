
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Waves, 
  Store, 
  Wrench, 
  Users, 
  Star, 
  Calendar, 
  CreditCard, 
  MessageSquare, 
  BarChart, 
  Settings, 
  ChevronRight,
  Crown,
  LogOut,
  Button,
  Globe,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon
} from "@/components/ui/button";
import { Image } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [publicContent, setPublicContent] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const currentPageName = location.pathname.split("/").pop();

  const sidebarItems = [
    { 
      title: "Visão Geral", 
      path: createPageUrl("AdminDashboard"), 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      title: "Cidades", 
      path: createPageUrl("Cities"), 
      icon: <Building2 className="h-5 w-5" /> 
    },
    { 
      title: "Praias", 
      path: createPageUrl("Beaches"), 
      icon: <Waves className="h-5 w-5" /> 
    },
    { 
      title: "Comércios", 
      path: createPageUrl("Businesses"), 
      icon: <Store className="h-5 w-5" /> 
    },
    { 
      title: "Prestadores", 
      path: createPageUrl("ServiceProviders"), 
      icon: <Wrench className="h-5 w-5" /> 
    },
    { 
      title: "Turistas", 
      path: createPageUrl("Tourists"), 
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      title: "Avaliações", 
      path: createPageUrl("Reviews"), 
      icon: <Star className="h-5 w-5" /> 
    },
    { 
      title: "Eventos", 
      path: createPageUrl("EventsAdmin"), 
      icon: <Calendar className="h-5 w-5" /> 
    },
    { 
      title: "Planos de Assinatura", 
      path: createPageUrl("SubscriptionPlansAdmin"), 
      icon: <Crown className="h-5 w-5" /> 
    },
    { 
      title: "Comunidade", 
      path: createPageUrl("Community"), 
      icon: <MessageSquare className="h-5 w-5" /> 
    },
    { 
      title: "Influenciadores", 
      icon: <Users className="h-5 w-5" />,
      page: "InfluencerDashboard", 
      permission: "admin"
    },
    { 
      title: "Financeiro", 
      path: createPageUrl("FinancialDashboard"), 
      icon: <BarChart className="h-5 w-5" /> 
    },
    { 
      title: "Cartão de Membro", 
      path: createPageUrl("CardSettings"), 
      icon: <CreditCard className="h-5 w-5" /> 
    },
    { 
      title: "Configurações do Site", 
      path: createPageUrl("SiteConfiguration"), 
      icon: <Settings className="h-5 w-5" /> 
    }
  ];

  const handleNavigate = (page) => {
    navigate(createPageUrl(page));
  };

  return (
    <>
      <aside className={`min-h-screen bg-gray-800 text-white fixed top-0 left-0 z-40 transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'} h-screen`}>
        <div className="h-full flex flex-col justify-between">
          <div>
            <div className="px-4 py-6 flex items-center justify-between">
              {isOpen ? (
                <Link to={createPageUrl("AdminDashboard")} className="text-xl font-bold text-white">
                  Praias Catarinenses
                </Link>
              ) : (
                <Link to={createPageUrl("AdminDashboard")} className="flex items-center justify-center w-full">
                  <span className="text-2xl font-bold text-white">PC</span>
                </Link>
              )}
              <button
                className="text-white hover:text-gray-300"
                onClick={() => setIsOpen(!isOpen)}
              >
                <ChevronRight className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            <nav className="mt-6">
              <ul className="space-y-1 px-2">
                {sidebarItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.path || createPageUrl(item.page)}
                      onClick={() => item.page && handleNavigate(item.page)}
                      className={`flex items-center px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors group ${isActive(item.path || createPageUrl(item.page)) ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    >
                      <span className="min-w-[20px]">{item.icon}</span>
                      {isOpen && (
                        <span className="ml-3 whitespace-nowrap">{item.title}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="space-y-1">
                <Button
                  variant={location.pathname === '/CityBannerSettings' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => navigate(createPageUrl('CityBannerSettings'))}
                >
                  <Image className="mr-2 h-4 w-4" />
                  Banners de Cidades
                </Button>
              </div>
              <Collapsible
                open={publicContent}
                onOpenChange={setPublicContent}
                className="w-full"
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    <Globe className="h-5 w-5 mr-2" />
                    <span>Conteúdo Público</span>
                    {publicContent ? (
                      <ChevronUp className="h-4 w-4 ml-auto" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 ml-6">
                  <Link 
                    to={createPageUrl("SiteConfiguration")}
                    className={`w-full text-left rounded-md p-2 ${currentPageName === "SiteConfiguration" ? "bg-primary text-primary-foreground font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    <Settings className="h-4 w-4 inline-block mr-2" />
                    Configuração do Site
                  </Link>
                  <Link 
                    to={createPageUrl("ClubConfiguration")}
                    className={`w-full text-left rounded-md p-2 ${currentPageName === "ClubConfiguration" ? "bg-primary text-primary-foreground font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    <Crown className="h-4 w-4 inline-block mr-2" />
                    Config. Clube
                  </Link>
                  <Link 
                    to={createPageUrl("InfluencerCardConfig")}
                    className={`w-full text-left rounded-md p-2 ${currentPageName === "InfluencerCardConfig" ? "bg-primary text-primary-foreground font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    <Users className="h-4 w-4 inline-block mr-2" />
                    Card de Influencer
                  </Link>
                  <Link 
                    to={createPageUrl("CityBannerSettings")}
                    className={`w-full text-left rounded-md p-2 ${currentPageName === "CityBannerSettings" ? "bg-primary text-primary-foreground font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    <ImageIcon className="h-4 w-4 inline-block mr-2" />
                    Banners de Cidades
                  </Link>
                </CollapsibleContent>
              </Collapsible>
            </nav>
          </div>
          
          <div className="pb-6 px-4">
            <Link
              to={createPageUrl("Public")}
              className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              {isOpen && <span className="ml-3">Voltar para o site</span>}
            </Link>
          </div>
        </div>
      </aside>
      
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
