
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LogOut, LayoutDashboard, 
  Users, Building2, Waves, Store, Wrench, Star, Inbox, 
  Settings, CreditCard, Crown, Menu, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }) {
  const location = useLocation();
  const currentPageName = location.pathname.split("/").pop();

  const handleAdminLogout = () => {
    localStorage.removeItem("isAdmin");
    window.location.href = createPageUrl("Public");
  };

  const adminMenuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "Dashboard" },
    { name: "Cidades", icon: Building2, path: "Cities" },
    { name: "Praias", icon: Waves, path: "Beaches" },
    { name: "Comércios", icon: Store, path: "Businesses" },
    { name: "Prestadores", icon: Wrench, path: "ServiceProviders" },
    { name: "Turistas", icon: Users, path: "Tourists" },
    { name: "Avaliações", icon: Star, path: "Reviews" },
    { name: "Anunciantes", icon: Inbox, path: "Advertisers" },
    { name: "Planos", icon: Crown, path: "SubscriptionPlans" },
    { name: "Configurações", icon: Settings, path: "CardSettings" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <div className="text-xl font-bold text-blue-600">TurismoSC</div>
        </div>
        <div className="py-2">
          <nav className="space-y-1 px-2">
            {adminMenuItems.map((item) => (
              <Link
                key={item.path}
                to={createPageUrl(item.path)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium group transition-colors
                  ${currentPageName === item.path ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${currentPageName === item.path ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="py-1">
          <h4 className="px-3 text-sm font-semibold text-gray-500 uppercase mb-1">Gestão Comercial</h4>
          <div className="space-y-1">
            <Link
              to={createPageUrl("DynamicPricing")}
              className={`px-3 py-2 rounded-md flex items-center text-sm hover:bg-gray-700 transition-colors ${
                currentPageName === "DynamicPricing" ? "bg-gray-700 text-white" : "text-gray-300"
              }`}
            >
              <Tag className="w-4 h-4 mr-2" />
              <span>Preços e Promoções</span>
            </Link>
          </div>
        </div>
        <div className="px-3 py-2 mt-4 border-t">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleAdminLogout}
            className="w-full justify-start text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair do Admin
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-lg font-medium text-gray-800">
                {adminMenuItems.find(item => item.path === currentPageName)?.name || "Dashboard"}
              </h1>
            </div>
            <Link to={createPageUrl("Public")} className="text-sm text-blue-600">
              Ver site
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
