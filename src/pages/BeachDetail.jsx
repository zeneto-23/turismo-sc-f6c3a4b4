import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Beach } from "@/api/entities";
import { City } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function BeachDetail() {
  const navigate = useNavigate();
  const [beach, setBeach] = useState(null);
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const beachId = urlParams.get('id');

  useEffect(() => {
    loadData();
  }, [beachId]);

  const loadData = async () => {
    if (!beachId) {
      navigate(createPageUrl("PublicBeaches"));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Carregar dados da praia
      const beachData = await Beach.get(beachId);
      setBeach(beachData);

      // Carregar dados da cidade com tratamento de erro
      if (beachData?.city_id) {
        try {
          const cityData = await City.get(beachData.city_id);
          setCity(cityData);
        } catch (cityError) {
          console.error("Erro ao carregar cidade:", cityError);
          
          // Tentar buscar todas as cidades e encontrar a correta
          try {
            const allCities = await City.list();
            const matchingCity = allCities.find(c => c.id === beachData.city_id);
            
            if (matchingCity) {
              setCity(matchingCity);
            } else {
              // Criar objeto cidade com dados mínimos
              setCity({
                id: beachData.city_id,
                name: beachData.city_name || "Cidade não encontrada",
                state: "Santa Catarina"
              });
            }
          } catch (listError) {
            console.error("Erro ao listar cidades:", listError);
            // Usar dados básicos da cidade
            setCity({
              id: beachData.city_id,
              name: beachData.city_name || "Cidade não encontrada",
              state: "Santa Catarina"
            });
          }
        }
      }

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError(error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os detalhes da praia. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error || !beach) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ops! Algo deu errado
          </h2>
          <p className="text-gray-600 mb-6">
            Não foi possível carregar os detalhes desta praia.
          </p>
          <Button 
            onClick={() => navigate(createPageUrl("PublicBeaches"))}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Voltar para lista de praias
          </Button>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate(createPageUrl("PublicBeaches"))}
          >
            ← Voltar para praias
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">
            {beach.name}
          </h1>
          {city && (
            <p className="text-gray-600 mt-2">
              {city.name}, Santa Catarina
            </p>
          )}
        </div>

        {/* Resto do conteúdo da praia */}
        {/* ... mantenha o resto do seu JSX existente ... */}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderContent()}
    </div>
  );
}