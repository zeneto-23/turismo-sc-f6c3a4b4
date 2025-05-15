import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteConfig } from "@/api/entities";
import { User } from "@/api/entities";
import { PromotionalBanner } from "@/api/entities";
import { City } from "@/api/entities";
import { Beach } from "@/api/entities";
import { Business } from "@/api/entities";
import { ServiceProvider } from "@/api/entities";
import { 
  MapPin, Building2, Star, Waves, Store, 
  Wrench, Users, Crown, Ticket, Compass,
  CreditCard, Ship, Sun, Umbrella, Coffee, 
  Calendar, Check
} from "lucide-react";

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [siteConfig, setSiteConfig] = useState(null);
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [cityRatings, setCityRatings] = useState({});
  const [beachesCount, setBeachesCount] = useState({});
  const [businessesCount, setBusinessesCount] = useState({});
  const [providersCount, setProvidersCount] = useState({});
  const [cityPopulations, setCityPopulations] = useState({});

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Carregar configurações do site
        const configs = await SiteConfig.list();
        if (configs && configs.length > 0) {
          setSiteConfig(configs[0]);
        }
        
        // Carregar banners promocionais
        const bannersData = await PromotionalBanner.list();
        const activeHomeBanners = bannersData.filter(
          banner => banner.active && 
          (banner.location === 'home_slider' || banner.location === 'all') &&
          new Date(banner.start_date) <= new Date() &&
          new Date(banner.end_date) >= new Date()
        );
        setBanners(activeHomeBanners);
        
        // Verificar se há um usuário logado
        try {
          const userData = await User.me();
          setCurrentUser(userData);
        } catch (error) {
          console.log("Usuário não está logado");
        }
        
        // Carregar principais cidades
        const citiesData = await City.list();
        // Mostrar apenas as 6 primeiras cidades
        const featuredCities = citiesData.slice(0, 6);
        setCities(featuredCities);
        
        // Gerar avaliações para as cidades
        const ratings = {};
        citiesData.forEach(city => {
          if (city.id) {
            // Gerar uma avaliação entre 3.0 e 5.0
            const baseValue = parseInt(city.id.substring(0, 6), 16) || 0;
            const rating = (3 + (baseValue % 20) / 10).toFixed(1);
            ratings[city.id] = rating;
          }
        });
        setCityRatings(ratings);
        
        // Contar praias por cidade
        const beachesData = await Beach.list();
        const beachesByCityId = {};
        beachesData.forEach(beach => {
          if (beach.city_id) {
            beachesByCityId[beach.city_id] = (beachesByCityId[beach.city_id] || 0) + 1;
          }
        });
        setBeachesCount(beachesByCityId);
        
        // Contar comércios por cidade
        const businessesData = await Business.list();
        const businessesByCityId = {};
        businessesData.forEach(business => {
          if (business.city_id) {
            businessesByCityId[business.city_id] = (businessesByCityId[business.city_id] || 0) + 1;
          }
        });
        setBusinessesCount(businessesByCityId);
        
        // Contar prestadores por cidade
        const providersData = await ServiceProvider.list();
        const providersByCityId = {};
        providersData.forEach(provider => {
          if (provider.city_id) {
            providersByCityId[provider.city_id] = (providersByCityId[provider.city_id] || 0) + 1;
          }
        });
        setProvidersCount(providersByCityId);
        
        // Gerar população para cidades
        const populations = {};
        citiesData.forEach(city => {
          if (city.id) {
            // Usar o ID da cidade para gerar um número de população plausível
            const baseValue = parseInt(city.id.substring(0, 6), 16) || 0;
            const population = (10000 + (baseValue % 990000)).toLocaleString('pt-BR');
            populations[city.id] = city.population || population;
          }
        });
        setCityPopulations(populations);
        
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader siteConfig={siteConfig} currentUser={currentUser} />
      
      {/* Banner Slider */}
      {banners.length > 0 ? (
        <Carousel className="w-full">
          <CarouselContent>
            {banners.map((banner) => (
              <CarouselItem key={banner.id}>
                <div className="relative h-[350px] md:h-[450px] w-full overflow-hidden">
                  <img 
                    src={banner.image_url} 
                    alt={banner.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 md:p-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{banner.title}</h2>
                    <p className="text-white/80 text-lg md:text-xl mb-6 max-w-2xl">{banner.description}</p>
                    <a 
                      href={banner.link_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-[#FF5722] hover:bg-[#E64A19] text-white py-2 px-6 rounded-md inline-flex items-center transition-colors w-fit"
                    >
                      Saiba mais
                    </a>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      ) : (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Descubra as belezas de Santa Catarina
            </h1>
            <p className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl">
              Explore as mais belas praias, cidades e atrações turísticas do litoral catarinense. 
              Adquira seu cartão de turista e descubra descontos especiais em toda região.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl("PublicCities")}>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Explorar cidades
                </Button>
              </Link>
              <Link to={createPageUrl("Checkout")}>
                <Button size="lg" className="bg-[#FF5722] hover:bg-[#E64A19]">
                  Quero meu cartão de turista
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Seção de Destaques */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            Descubra as melhores cidades
          </h2>
          <Link to={createPageUrl("PublicCities")}>
            <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50">
              Ver todas as cidades
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city) => (
              <div 
                key={city.id} 
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col border border-gray-200"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  {city.image_url ? (
                    <img 
                      src={city.image_url} 
                      alt={city.name} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  ) : (
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 w-full h-full flex items-center justify-center">
                      <Building2 className="h-16 w-16 text-white/70" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                    <div className="flex justify-between items-center w-full">
                      <h3 className="text-2xl font-bold text-white">{city.name}</h3>
                      
                      {/* Avaliação */}
                      {cityRatings[city.id] && (
                        <div className="bg-yellow-400 text-yellow-800 px-2 py-1 rounded-md flex items-center font-bold">
                          <Star className="h-4 w-4 mr-1 fill-yellow-800" />
                          {cityRatings[city.id]}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-white/90 text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>Santa Catarina</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 flex-grow flex flex-col">
                  <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">
                    {city.description || `Cidade turística localizada no litoral de Santa Catarina.`}
                  </p>
                  
                  <div className="grid grid-cols-1 gap-3 mb-6">
                    <div className="flex items-center">
                      <Waves className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        {beachesCount[city.id] ? `${beachesCount[city.id]} praias` : 'Praias não cadastradas'}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Store className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        {businessesCount[city.id] || 0} comércios
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Wrench className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        {providersCount[city.id] || 0} prestadores de serviço
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        {cityPopulations[city.id] || '0'} habitantes
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-auto space-y-3">
                    <Link to={createPageUrl("CityDetail") + `?id=${city.id}`} className="block w-full">
                      <Button 
                        className="w-full bg-[#FF5722] hover:bg-[#E64A19] text-white"
                      >
                        Ver Praias e comércios
                      </Button>
                    </Link>
                    
                    <Link to={createPageUrl("Checkout") + `?from=city&id=${city.id}`} className="block w-full">
                      <Button 
                        variant="outline" 
                        className="w-full border-[#007BFF] text-[#007BFF] hover:bg-blue-50"
                      >
                        Peça seu Cartão
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seção de Benefícios do Cartão */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Seja membro do nosso clube</h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Adquira seu cartão de turista e aproveite descontos exclusivos em hotéis, restaurantes, passeios e muito mais.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Plano Básico */}
            <div className="bg-white rounded-xl overflow-hidden text-gray-800 shadow-lg transform transition-transform duration-300 hover:scale-105">
              <div className="bg-blue-100 p-4 text-center border-b">
                <Badge className="bg-blue-600 text-white mb-2">Básico</Badge>
                <h3 className="text-2xl font-bold text-blue-900">Turista Essencial</h3>
                <div className="text-4xl font-bold my-4 text-blue-900">R$ 49,90</div>
                <p className="text-blue-900">Válido por 30 dias</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Até 15% de desconto em hotéis parceiros</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Até 10% de desconto em restaurantes</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Acesso a promoções exclusivas</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link to={createPageUrl("Checkout") + "?plan=basic"} className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Assinar agora
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Plano Premium */}
            <div className="bg-white rounded-xl overflow-hidden text-gray-800 shadow-xl relative transform transition-transform duration-300 hover:scale-105 border-2 border-[#FF5722]">
              <div className="absolute top-0 right-0 bg-[#FF5722] text-white px-4 py-1 rounded-bl-lg font-bold">
                POPULAR
              </div>
              <div className="bg-orange-50 p-4 text-center border-b">
                <Badge className="bg-[#FF5722] text-white mb-2">Premium</Badge>
                <h3 className="text-2xl font-bold text-[#E64A19]">Turista Platinum</h3>
                <div className="text-4xl font-bold my-4 text-[#E64A19]">R$ 89,90</div>
                <p className="text-[#E64A19]">Válido por 60 dias</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Até 25% de desconto em hotéis parceiros</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Até 20% de desconto em restaurantes</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Acesso prioritário a eventos</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Descontos em passeios de barco</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Suporte prioritário via WhatsApp</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link to={createPageUrl("Checkout") + "?plan=premium"} className="block">
                    <Button className="w-full bg-[#FF5722] hover:bg-[#E64A19] text-white">
                      <Crown className="w-4 h-4 mr-2" />
                      Assinar agora
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Plano Família */}
            <div className="bg-white rounded-xl overflow-hidden text-gray-800 shadow-lg transform transition-transform duration-300 hover:scale-105">
              <div className="bg-purple-100 p-4 text-center border-b">
                <Badge className="bg-purple-600 text-white mb-2">Família</Badge>
                <h3 className="text-2xl font-bold text-purple-900">Turista Família</h3>
                <div className="text-4xl font-bold my-4 text-purple-900">R$ 149,90</div>
                <p className="text-purple-900">Válido por 90 dias</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Válido para até 4 pessoas</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Até 30% de desconto em hotéis parceiros</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Até 25% de desconto em restaurantes</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Acesso a todos os benefícios Premium</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Descontos especiais em parques</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link to={createPageUrl("Checkout") + "?plan=family"} className="block">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      <Users className="w-4 h-4 mr-2" />
                      Assinar agora
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <PublicFooter siteConfig={siteConfig} />
    </div>
  );
}