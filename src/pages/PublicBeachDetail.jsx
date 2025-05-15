
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import BackButton from '@/components/ui/BackButton';
import { Beach } from "@/api/entities";
import { City } from "@/api/entities";
import { SiteConfig } from "@/api/entities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Waves, MapPin, Star, Droplets, Wind, Sun, Users, Check, X, Info, MapPinned, LifeBuoy, Accessibility, Moon, ArrowRightCircle } from "lucide-react";
import WeatherCard from '@/components/weather/WeatherCard';

export default function PublicBeachDetail() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [beach, setBeach] = useState(null);
  const [city, setCity] = useState(null);
  const [siteConfig, setSiteConfig] = useState(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const beachId = urlParams.get('id');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const configs = await SiteConfig.list();
        if (configs && configs.length > 0) {
          setSiteConfig(configs[0]);
        }
        
        if (!beachId) {
          navigate(createPageUrl("PublicBeaches"));
          return;
        }
        
        const beachData = await Beach.get(beachId);
        setBeach(beachData);
        
        if (beachData?.city_id) {
          const cityData = await City.get(beachData.city_id);
          setCity(cityData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados da praia:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [beachId, navigate]);
  
  const getFeatureIcon = (feature) => {
    const featureIcons = {
      "surf": <Sun className="w-5 h-5 text-yellow-500" />,
      "family": <Users className="w-5 h-5 text-blue-500" />,
      "calm": <Droplets className="w-5 h-5 text-blue-400" />,
      "structure": <LifeBuoy className="w-5 h-5 text-red-500" />,
      "natural": <Waves className="w-5 h-5 text-green-500" />
    };
    
    return featureIcons[feature] || <Info className="w-5 h-5 text-gray-500" />;
  };
  
  const getSeaTypeIcon = (seaType) => {
    switch(seaType) {
      case "calmo":
        return <Droplets className="text-blue-500" />;
      case "ondas_leves":
        return <Wind className="text-blue-400" />;
      case "ondas_medias":
      case "ondas_fortes":
        return <Wind className="text-blue-600" />;
      case "piscina_natural":
        return <Droplets className="text-emerald-500" />;
      default:
        return <Droplets className="text-blue-500" />;
    }
  };
  
  const getSeaTypeLabel = (seaType) => {
    const labels = {
      "calmo": "Mar Calmo",
      "ondas_leves": "Ondas Leves",
      "ondas_medias": "Ondas Médias",
      "ondas_fortes": "Ondas Fortes",
      "piscina_natural": "Piscina Natural"
    };
    return labels[seaType] || "Mar Calmo";
  };
  
  const formatFeaturesList = (features) => {
    return Array.isArray(features) ? features : [];
  };
  
  const formatListFromString = (str) => {
    if (!str) return [];
    return str.split(',').map(item => item.trim()).filter(Boolean);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader siteConfig={siteConfig} />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-[1280px]">
          <BackButton 
            label="Voltar para lista de praias" 
            to={createPageUrl("PublicBeaches")}
          />
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
          ) : !beach ? (
            <div className="text-center py-20">
              <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Praia não encontrada</h2>
              <p className="text-gray-600">A praia que você está procurando não existe ou foi removida.</p>
            </div>
          ) : (
            <>
              <div className="relative rounded-xl overflow-hidden mb-8">
                <img 
                  src={beach.image_url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1473&q=80"} 
                  alt={beach.name} 
                  className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover"
                />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                  <div className="flex justify-between items-end">
                    <div>
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
                        {beach.name}
                      </h1>
                      
                      <div className="flex items-center text-white/90">
                        <MapPin className="h-5 w-5 mr-1" />
                        <span>{city?.name || 'Santa Catarina'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-white font-medium">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sobre a Praia</h2>
                    <p className="text-gray-700 mb-4">
                      {beach.description || `${beach.name} é uma praia localizada em ${city?.name || 'Santa Catarina'}.`}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {formatFeaturesList(beach.features).map((feature, index) => (
                        <Badge key={index} className="bg-blue-100 text-blue-800 flex items-center gap-1">
                          {getFeatureIcon(feature)}
                          <span>{feature}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Características</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                          {getSeaTypeIcon(beach.sea_type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800 mb-1">Tipo de Mar</h3>
                          <p className="text-gray-600">{getSeaTypeLabel(beach.sea_type)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-green-100 p-3 rounded-full mr-4">
                          <Sun className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800 mb-1">Atividade Principal</h3>
                          <p className="text-gray-600">{beach.main_activity || 'Diversas atividades'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {beach.infrastructure && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                        <LifeBuoy className="mr-2 h-6 w-6 text-blue-600" />
                        Infraestrutura
                      </h2>
                      <div className="space-y-2">
                        {formatListFromString(beach.infrastructure).map((item, index) => (
                          <div key={index} className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {beach.accessibility && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                        <Accessibility className="mr-2 h-6 w-6 text-blue-600" />
                        Acessibilidade
                      </h2>
                      <div className="space-y-2">
                        {formatListFromString(beach.accessibility).map((item, index) => (
                          <div key={index} className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {beach.nightlife && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                        <Moon className="mr-2 h-6 w-6 text-blue-600" />
                        Vida Noturna
                      </h2>
                      <div className="space-y-2">
                        {formatListFromString(beach.nightlife).map((item, index) => (
                          <div key={index} className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {beach.tourist_attractions && beach.tourist_attractions.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                        <MapPinned className="mr-2 h-6 w-6 text-blue-600" />
                        Pontos Turísticos Próximos
                      </h2>
                      <div className="space-y-2">
                        {beach.tourist_attractions.map((item, index) => (
                          <div key={index} className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <WeatherCard 
                    latitude={beach.latitude} 
                    longitude={beach.longitude} 
                    cityName={city?.name} 
                  />
                  
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                      Localização
                    </h2>
                    
                    <div className="aspect-video bg-gray-100 mb-4 rounded-lg overflow-hidden">
                      {beach.latitude && beach.longitude ? (
                        <iframe
                          title={`Mapa de ${beach.name}`}
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${beach.longitude - 0.01}%2C${beach.latitude - 0.01}%2C${beach.longitude + 0.01}%2C${beach.latitude + 0.01}&layer=mapnik&marker=${beach.latitude}%2C${beach.longitude}`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                        ></iframe>
                      ) : city?.name ? (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                          <MapPin className="h-8 w-8 text-blue-500 mb-2" />
                          <p className="text-gray-600">
                            Coordenadas exatas não disponíveis.
                          </p>
                          <p className="text-gray-500 text-sm">
                            {beach.name} está localizada em {city.name}, Santa Catarina.
                          </p>
                          <a 
                            href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(beach.name + ' ' + city.name + ', Santa Catarina, Brasil')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline mt-2 text-sm flex items-center"
                          >
                            Ver no OpenStreetMap
                            <ArrowRightCircle className="h-4 w-4 ml-1" />
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <MapPin className="h-6 w-6 mr-2" />
                          Localização não disponível
                        </div>
                      )}
                    </div>
                    
                    {beach.latitude && beach.longitude && (
                      <a 
                        href={`https://www.openstreetmap.org/?mlat=${beach.latitude}&mlon=${beach.longitude}#map=15/${beach.latitude}/${beach.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm flex items-center"
                      >
                        Abrir mapa completo
                        <ArrowRightCircle className="h-4 w-4 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      
      <PublicFooter siteConfig={siteConfig} />
    </div>
  );
}
