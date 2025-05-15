
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { SiteConfig } from "@/api/entities";
import { Business } from "@/api/entities";
import { Realtor } from "@/api/entities";
import { 
  User, 
  Mail, 
  Key, 
  Store, 
  Shield, 
  LogIn,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Admin user hardcoded
const ADMIN_USER = {
  id: 'admin-1',
  email: 'contato.jrsn@gmail.com',
  password: '123456',
  full_name: 'Praias Catarinenses',
  role: 'admin',
  is_approved: true,
  is_active: true
};

export default function UserAccount() {
  const [siteConfig, setSiteConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ 
    email: '', 
    password: '' 
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar configurações do site
        const configs = await SiteConfig.list();
        if (configs && configs.length > 0) {
          setSiteConfig(configs[0]);
        }
        
        // Verificar se há usuário logado
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    loadData();
  }, []);

  const handleLogout = () => {
    // Limpar ambos storages
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('isLoggedIn');
    
    setCurrentUser(null);
    window.location.href = '/Public';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Tentando login com:", loginForm.email);
      
      // Primeiro verificar se é uma conta de administrador
      if (loginForm.email === 'contato.jrsn@gmail.com' && loginForm.password === '123456') {
        const adminUser = {
          id: 'admin-1',
          email: 'contato.jrsn@gmail.com',
          role: 'admin',
          full_name: 'Administrador'
        };
        
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        localStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', JSON.stringify(adminUser));
        sessionStorage.setItem('isLoggedIn', 'true');
        
        navigate(createPageUrl("Dashboard"));
        return;
      }

      // Verificar imobiliárias - NÃO usar .filter({}) que retorna muitos resultados
      console.log("Verificando imobiliária com email:", loginForm.email);
      const realtors = await Realtor.list();
      const realtor = realtors.find(r => 
        r.email && r.email.trim().toLowerCase() === loginForm.email.trim().toLowerCase()
      );
      
      if (realtor) {
        console.log("Imobiliária encontrada:", realtor);
        const realtorData = {
          id: realtor.id,
          email: realtor.email,
          full_name: realtor.company_name,
          role: 'realtor',
          realtor_id: realtor.id,
          status: realtor.status
        };

        localStorage.setItem('currentUser', JSON.stringify(realtorData));
        localStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', JSON.stringify(realtorData));
        sessionStorage.setItem('isLoggedIn', 'true');
        
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo, ${realtor.company_name}!`
        });

        navigate(createPageUrl("RealtorDashboard"));
        return;
      }

      // Verificar clientes de imobiliária
      console.log("Verificando negócio com email:", loginForm.email);
      const businesses = await Business.list();
      const business = businesses.find(b => 
        b.business_email && b.business_email.trim().toLowerCase() === loginForm.email.trim().toLowerCase()
      );

      if (business) {
        console.log("Negócio encontrado:", business);
        const businessData = {
          id: business.id,
          email: business.business_email,
          full_name: business.business_name,
          role: 'business',
          business_id: business.id,
          status: business.status
        };

        localStorage.setItem('currentUser', JSON.stringify(businessData));
        localStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', JSON.stringify(businessData));
        sessionStorage.setItem('isLoggedIn', 'true');
        
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo, ${business.business_name}!`
        });

        navigate(createPageUrl("BusinessProfile"));
        return;
      }

      throw new Error("Email não encontrado. Por favor, verifique suas credenciais.");

    } catch (error) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader siteConfig={siteConfig} currentUser={currentUser} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{currentUser ? "Minha Conta" : "Acesso"}</CardTitle>
              <CardDescription>
                {currentUser ? `Bem-vindo, ${currentUser.full_name}!` : "Faça login para acessar sua conta"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {currentUser ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <User className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-medium">{currentUser.full_name}</h3>
                    <p className="text-gray-500">{currentUser.email}</p>
                    <Badge className="mt-2">
                      {currentUser.role === 'admin' ? 'Administrador' : currentUser.role === 'business' ? 'Comerciante' : 'Corretor'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        if (currentUser.role === 'admin') {
                          navigate('/Dashboard');
                        } else if (currentUser.role === 'business') {
                          navigate('/BusinessProfile');
                        } else if (currentUser.role === 'realtor') {
                          navigate('/RealtorDashboard');
                        }
                      }}
                    >
                      <Store className="mr-2 h-4 w-4" />
                      {currentUser.role === 'admin' ? 'Acessar Dashboard' : currentUser.role === 'business' ? 'Meu Comércio' : 'Dashboard do Corretor'}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleLogout}
                    >
                      Sair da Conta
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="seu@email.com"
                      value={loginForm.email}
                      onChange={handleInputChange}
                      className={formErrors.email ? "border-red-500" : ""}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="password">Senha</Label>
                    </div>
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      placeholder="Sua senha"
                      value={loginForm.password}
                      onChange={handleInputChange}
                      className={formErrors.password ? "border-red-500" : ""}
                    />
                    {formErrors.password && (
                      <p className="text-red-500 text-xs">{formErrors.password}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Entrar
                      </>
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Não tem uma conta?{" "}
                      <Link to={createPageUrl("Cadastro")} className="text-blue-600 hover:underline">
                        Cadastre-se
                      </Link>
                    </p>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <PublicFooter siteConfig={siteConfig} />
    </div>
  );
}
