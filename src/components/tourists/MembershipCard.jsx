import React from "react";
import { QrCode, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MembershipCard({ user, subscription, plan }) {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="perspective-1000">
      <div className="card-container transform-style-3d transition-transform duration-700 w-full h-56 md:h-64">
        {/* Frente do cartão */}
        <div className="bg-gradient-to-br from-[#007BFF] to-[#005cbf] rounded-xl shadow-xl overflow-hidden p-6 text-white relative">
          {/* Destaque para membros Premium */}
          {plan?.is_featured && (
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
            <p className="text-xl font-medium tracking-wide">{user?.full_name || "Membro"}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-auto">
            <div>
              <p className="text-blue-100 text-xs uppercase tracking-wider mb-1">Nº do Cartão</p>
              <p className="font-medium">{user?.id?.substring(0, 8)?.toUpperCase() || "********"}</p>
            </div>
            <div>
              <p className="text-blue-100 text-xs uppercase tracking-wider mb-1">Plano</p>
              <p className="font-medium">{plan?.name || "Padrão"}</p>
            </div>
            <div>
              <p className="text-blue-100 text-xs uppercase tracking-wider mb-1">Validade</p>
              <p className="font-medium">{subscription?.end_date ? formatDate(subscription.end_date) : "31/12/2025"}</p>
            </div>
          </div>
          
          {/* Elementos decorativos */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-blue-400 opacity-20"></div>
          <div className="absolute right-10 -top-6 w-20 h-20 rounded-full bg-blue-300 opacity-20"></div>
        </div>
        
        {/* Verso do cartão */}
        <div className="absolute inset-0 bg-white rounded-xl shadow-xl overflow-hidden p-6 backface-hidden transform-3d rotate-y-180 flex flex-col justify-between border border-gray-200">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-800">Cartão de Membro</h3>
            <Badge 
              style={{ backgroundColor: plan?.badge_color || "#007BFF" }} 
              className="text-white"
            >
              {plan?.discount_percentage || 5}% de desconto
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
              <p className="text-sm font-medium text-green-600">
                Ativo até {subscription?.end_date ? formatDate(subscription.end_date) : "31/12/2025"}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estilos para efeito 3D */}
      <style jsx>{`
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
        .rotate-y-180 {
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