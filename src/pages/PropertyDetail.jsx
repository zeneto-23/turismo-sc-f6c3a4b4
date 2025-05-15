import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Property } from "@/api/entities";
import { PropertyCategory } from "@/api/entities";
import { City } from "@/api/entities";
import { Realtor } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Bed, 
  Bath, 
  Car, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowLeft,
  Heart,
  Share2,
  Square,
  Building2,
  Tag,
  CheckSquare,
  DollarSign,
  Ruler,
  Calendar,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

export default function PropertyDetail() {
  const [property, setProperty] = useState(null);
  const [category, setCategory] = useState(null);
  const [city, setCity] = useState(null);
  const [realtor, setRealtor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const navigate = useNavigate();

  useEffect(() => {
    loadProperty();
  }, []);

  const loadProperty = async () => {
    try {
      setIsLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const propertyId = urlParams.get('id');

      if (!propertyId) {
        navigate(createPageUrl("Properties"));
        return;
      }

      const propertyData = await Property.get(propertyId);
      setProperty(propertyData);

      // Incrementar contador de visualizações
      try {
        await Property.update(propertyId, { 
          views_count: (propertyData.views_count || 0) + 1 
        });
      } catch (e) {
        console.log("Não foi possível atualizar contador de visualizações");
      }

      // Carregar categorias
      if (propertyData.category_id) {
        try {
          const categoryData = await PropertyCategory.get(propertyData.category_id);
          setCategory(categoryData);
        } catch (e) {
          console.log("Não foi possível carregar a categoria");
        }
      }

      // Carregar cidade
      if (propertyData.city_id) {
        try {
          const cityData = await City.get(propertyData.city_id);
          setCity(cityData);
        } catch (e) {
          console.log("Não foi possível carregar a cidade");
        }
      }

      // Carregar dados do corretor
      if (propertyData.realtor_id) {
        try {
          const realtorData = await Realtor.get(propertyData.realtor_id);
          setRealtor(realtorData);
        } catch (e) {
          console.log("Não foi possível carregar dados do corretor");
        }
      }
    } catch (error) {
      console.error("Erro ao carregar imóvel:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPropertyType = (type) => {
    switch(type) {
      case "sale": return "Venda";
      case "rent": return "Aluguel";
      case "temporary": return "Temporada";
      default: return "Venda";
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "Sob consulta";
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando detalhes do imóvel...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6 text-center">
        <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Imóvel não encontrado</h2>
        <p className="text-gray-600 mb-6">O imóvel que você está procurando não está disponível.</p>
        <Button onClick={() => navigate(createPageUrl("Properties"))}>
          Voltar para listagem
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Header com imagem principal */}
      <div className="relative h-[40vh] bg-gray-200">
        {property.main_image_url ? (
          <img 
            src={property.main_image_url} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Home className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                <div className="flex items-center text-white/80">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {property.address || property.neighborhood || city?.name || "Endereço não informado"}
                  </span>
                </div>
              </div>
              <div>
                <Badge className={property.property_type === 'rent' ? 'bg-purple-600' : 'bg-blue-600'} size="lg">
                  {getPropertyType(property.property_type)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-4 left-4 bg-white/80 hover:bg-white text-gray-800 rounded-full"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Conteúdo principal */}
      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {formatCurrency(property.price)}
                {property.property_type === 'rent' && <span className="text-lg font-normal">/mês</span>}
              </h2>
              {property.condo_fee > 0 && (
                <p className="text-gray-600">
                  Condomínio: {formatCurrency(property.condo_fee)}
                  {property.iptu > 0 && ` • IPTU: ${formatCurrency(property.iptu)}/ano`}
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Heart className="h-4 w-4" />
                Favoritar
              </Button>
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
            </div>
          </div>
          
          {/* Características principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 border-t border-b border-gray-100 py-4">
            {property.area > 0 && (
              <div className="flex items-center gap-2">
                <Square className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-lg font-bold">{property.area} m²</p>
                  <p className="text-sm text-gray-600">Área</p>
                </div>
              </div>
            )}
            
            {property.bedrooms > 0 && (
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-lg font-bold">{property.bedrooms}</p>
                  <p className="text-sm text-gray-600">
                    {property.bedrooms === 1 ? "Quarto" : "Quartos"}
                    {property.suites > 0 && ` (${property.suites} suíte${property.suites > 1 ? 's' : ''})`}
                  </p>
                </div>
              </div>
            )}
            
            {property.bathrooms > 0 && (
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-lg font-bold">{property.bathrooms}</p>
                  <p className="text-sm text-gray-600">
                    {property.bathrooms === 1 ? "Banheiro" : "Banheiros"}
                  </p>
                </div>
              </div>
            )}
            
            {property.parking_spots > 0 && (
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-lg font-bold">{property.parking_spots}</p>
                  <p className="text-sm text-gray-600">
                    {property.parking_spots === 1 ? "Vaga" : "Vagas"}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="mb-6">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="features">Características</TabsTrigger>
              <TabsTrigger value="location">Localização</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3">Sobre este imóvel</h3>
                <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                    Informações do imóvel
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex justify-between">
                      <span>Tipo:</span>
                      <span className="font-medium">{category?.name || "Não informado"}</span>
                    </li>
                    {property.floor && (
                      <li className="flex justify-between">
                        <span>Andar:</span>
                        <span className="font-medium">{property.floor}</span>
                      </li>
                    )}
                    {property.is_new && (
                      <li className="flex justify-between">
                        <span>Condição:</span>
                        <span className="font-medium">Novo</span>
                      </li>
                    )}
                    <li className="flex justify-between">
                      <span>Publicado em:</span>
                      <span className="font-medium">
                        {format(new Date(property.created_date), "dd/MM/yyyy")}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Código:</span>
                      <span className="font-medium">#{property.id.substring(0, 8)}</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                    Valores
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex justify-between">
                      <span>{property.property_type === 'rent' ? 'Aluguel:' : 'Valor:'}</span>
                      <span className="font-medium">{formatCurrency(property.price)}</span>
                    </li>
                    {property.condo_fee > 0 && (
                      <li className="flex justify-between">
                        <span>Condomínio:</span>
                        <span className="font-medium">{formatCurrency(property.condo_fee)}</span>
                      </li>
                    )}
                    {property.iptu > 0 && (
                      <li className="flex justify-between">
                        <span>IPTU (anual):</span>
                        <span className="font-medium">{formatCurrency(property.iptu)}</span>
                      </li>
                    )}
                    {property.property_type === 'rent' && (
                      <li className="flex justify-between">
                        <span>Total mensal:</span>
                        <span className="font-medium">
                          {formatCurrency((property.price || 0) + (property.condo_fee || 0))}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="features">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">Comodidades e Diferenciais</h3>
                  {property.amenities && property.amenities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {property.amenities.map((amenity, index) => {
                        // Mapear IDs para labels
                        const amenitiesLabels = {
                          pool: "Piscina",
                          gym: "Academia",
                          barbecue: "Churrasqueira",
                          playground: "Playground",
                          security: "Segurança 24h",
                          elevator: "Elevador",
                          furnished: "Mobiliado",
                          balcony: "Sacada",
                          laundry: "Lavanderia",
                          party_room: "Salão de festas",
                          pet_friendly: "Aceita pets"
                        };
                        
                        const label = amenitiesLabels[amenity] || amenity;
                        
                        return (
                          <div key={index} className="flex items-center">
                            <CheckSquare className="h-5 w-5 text-green-600 mr-2" />
                            <span>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-600">Não há informações sobre comodidades.</p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="location">
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-2">Localização</h3>
                <p className="flex items-center text-lg">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  {property.address || property.neighborhood || "Endereço não informado"}
                  {city && `, ${city.name}`}
                </p>
                
                <div className="aspect-[16/9] bg-gray-200 rounded-lg mt-4">
                  {/* Aqui poderia ser inserido um iframe do Google Maps */}
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-gray-400" />
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-700">
                    Para mais informações sobre a localização exata deste imóvel, entre em contato com o anunciante.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Card do anunciante */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Informações de Contato</h3>
          
          {realtor ? (
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                {realtor.logo_url ? (
                  <img 
                    src={realtor.logo_url} 
                    alt={realtor.company_name} 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-blue-600" />
                )}
              </div>
              
              <div className="flex-grow">
                <h4 className="font-bold text-lg">{realtor.company_name}</h4>
                {realtor.creci && <p className="text-sm text-gray-600">CRECI: {realtor.creci}</p>}
                
                <div className="mt-2 space-y-1">
                  {property.realtor_phone && (
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-600" />
                      {property.realtor_phone || realtor.phone}
                    </p>
                  )}
                  
                  <p className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-600" />
                    {realtor.email}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0">
                <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
                  Entrar em Contato
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Phone className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Informações de contato não disponíveis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}