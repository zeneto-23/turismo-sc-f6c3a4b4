
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle, 
  Download, 
  Share2,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User } from "@/api/entities";
import { Tourist } from "@/api/entities";
import { UserSubscription } from "@/api/entities";
import { SubscriptionPlan } from "@/api/entities";

export default function MembershipCard() {
  const [userData, setUserData] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate(createPageUrl("UserAccount"));
      return;
    }

    const user = JSON.parse(storedUser);
    
    // Verificar se é um usuário real/cadastrado
    if (user.email !== 'contato.jrsn@gmail.com' && user.email !== 'diskgas@gmail.com') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isLoggedIn');
      navigate(createPageUrl("UserAccount"));
      return;
    }

    const loadData = async () => {
      try {
        // Carregar dados do usuário
        const user = await User.me();
        setUserData(user);

        // Carregar assinatura do usuário
        const userSubscriptions = await UserSubscription.filter({ user_id: user.id });
        if (userSubscriptions && userSubscriptions.length > 0) {
          const activeSub = userSubscriptions.find(sub => sub.status === "active") || userSubscriptions[0];
          setSubscription(activeSub);

          // Carregar detalhes do plano
          if (activeSub.plan_id) {
            const planData = await SubscriptionPlan.get(activeSub.plan_id);
            setPlan(planData);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const handleBackToAccount = () => {
    navigate(createPageUrl("UserAccount"));
  };

  const handleDownload = () => {
    // Implementação para download da carteirinha como imagem
    alert("Função para download da carteirinha. Esta funcionalidade será implementada em breve.");
  };

  const handleShare = () => {
    // Implementação para compartilhar a carteirinha
    alert("Função para compartilhar a carteirinha. Esta funcionalidade será implementada em breve.");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#007BFF] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Carregando sua carteirinha...</p>
        </div>
      </div>
    );
  }

  // Renderiza o cartão de membro configurado no sistema
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 text-gray-600"
          onClick={handleBackToAccount}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Minha Conta
        </Button>

        <h1 className="text-2xl font-bold text-center mb-6">Carteirinha de Membro</h1>
        
        {subscription && plan ? (
          <>
            {/* Design do cartão de membro atualizado conforme sistema */}
            <div className="mb-8 relative perspective-1000">
              <div className="card-container transform-style-3d transition-transform duration-700 w-full h-56 md:h-64">
                <div className="bg-gradient-to-br from-[#007BFF] to-[#005cbf] rounded-xl shadow-xl overflow-hidden p-6 text-white relative">
                  {/* Destaque para membros Premium */}
                  {plan.is_featured && (
                    <div className="absolute top-0 right-0">
                      <Badge className="bg-yellow-400 text-blue-900 font-bold rounded-bl-lg rounded-tr-none px-3 py-1">
                        PREMIUM
                      </Badge>
                    </div>
                  )}
                  
                  {/* Logo e título */}
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
                      <span className="text-[#007BFF] font-bold text-xl">SC</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-wide">TurismoSC Club</h2>
                      <p className="text-blue-200 text-xs">Cartão de Membro Oficial</p>
                    </div>
                  </div>
                  
                  {/* Informações do membro */}
                  <div className="mb-4">
                    <p className="text-blue-100 text-xs uppercase tracking-wider mb-1">Nome do Membro</p>
                    <p className="text-xl font-medium tracking-wide">{userData.full_name}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-auto">
                    <div>
                      <p className="text-blue-100 text-xs uppercase tracking-wider mb-1">Nº do Cartão</p>
                      <p className="font-medium">{userData.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-xs uppercase tracking-wider mb-1">Plano</p>
                      <p className="font-medium">{plan.name}</p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-xs uppercase tracking-wider mb-1">Validade</p>
                      <p className="font-medium">{formatDate(subscription.end_date)}</p>
                    </div>
                  </div>
                  
                  {/* Elementos decorativos */}
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-blue-400 opacity-20"></div>
                  <div className="absolute right-10 -top-6 w-20 h-20 rounded-full bg-blue-300 opacity-20"></div>
                </div>
                
                {/* QR Code no verso */}
                <div className="absolute inset-0 bg-white rounded-xl shadow-xl overflow-hidden p-6 backface-hidden transform-3d rotate-y-180 flex flex-col justify-between border border-gray-200">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-800">Cartão de Membro</h3>
                    <Badge 
                      style={{ backgroundColor: plan.badge_color || "#007BFF" }} 
                      className="text-white"
                    >
                      {plan.discount_percentage}% de desconto
                    </Badge>
                  </div>
                  
                  <div className="flex justify-center items-center flex-grow py-2">
                    <div className="w-32 h-32 bg-gray-100 rounded-lg p-3 flex items-center justify-center">
                      <QrCode className="w-full h-full text-[#007BFF]" />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Apresente este QR Code nos estabelecimentos parceiros</p>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <p className="text-sm font-medium text-green-600">Ativo até {formatDate(subscription.end_date)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mb-6">
              <Button 
                variant="outline" 
                className="bg-white text-[#007BFF] border-[#007BFF] flex-1"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
              <Button 
                className="bg-[#007BFF] hover:bg-blue-700 flex-1"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-[#007BFF]" />
                Como usar sua carteirinha:
              </h3>
              <ul className="text-sm text-gray-600 space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                  <span>Apresente sua carteirinha digital em estabelecimentos parceiros para obter descontos de até {plan.discount_percentage}%.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                  <span>Sua assinatura {plan.name} é válida até {formatDate(subscription.end_date)}.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                  <span>Aproveite benefícios exclusivos em praias, restaurantes, pousadas e atrações.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                  <span>Mantenha seu cartão atualizado para continuar aproveitando todos os benefícios.</span>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Nenhum plano ativo</h2>
            <p className="text-gray-500 mb-6">
              Você ainda não possui um plano de assinatura ativo para gerar sua carteirinha.
            </p>
            <Button 
              className="bg-[#007BFF] hover:bg-blue-700"
              onClick={() => navigate(createPageUrl("SubscriptionPlans"))}
            >
              Ver Planos Disponíveis
            </Button>
          </div>
        )}
      </div>
      
      {/* Estilos adicionais para efeito 3D */}
      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .transform-3d {
          transform: rotateY(180deg);
        }
        
        /* Efeito hover para virar o cartão */
        .card-container:hover {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
