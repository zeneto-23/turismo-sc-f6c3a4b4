import React, { useState, useEffect } from "react";
import { User, LocalGuide, SavedGuide, City, Beach, UserProfile } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import {
  Compass, Map, Search, Filter, MapPin, Plus, BookMarked, User as UserIcon,
  Heart, EyeOff, Eye, Calendar, DollarSign, Clock, Star, ChevronRight, 
  Bookmark, BookmarkCheck, ThumbsUp, MessageCircle, Building2, Waves, 
  ShieldCheck, Utensils, Hotel, Ship, CalendarDays, Palette, ShoppingBag,
  Users, Moon, Globe, Menu, ChevronDown, ArrowUpRight
} from "lucide-react";

import CreateGuideModal from "../components/guides/CreateGuideModal";
import GuideCard from "../components/guides/GuideCard";
import GuideDetailModal from "../components/guides/GuideDetailModal";

export default function LocalGuides() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [cities, setCities] = useState([]);
  const [beaches, setBeaches] = useState([]);
  const [users, setUsers] = useState([]);
  const [savedGuides, setSavedGuides] = useState([]);
  const [activeTab, setActiveTab] = useState("discover");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateGuideOpen, setIsCreateGuideOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [isGuideDetailOpen, setIsGuideDetailOpen] = useState(false);

  // Filtros
  const [locationFilter, setLocationFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState(false);

  useEffect(() => {
    loadCurrentUser();
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [guides, searchTerm, locationFilter, categoryFilter, verifiedFilter]);

  const loadCurrentUser = async () => {
    try {
      const userData = await User.me();
      setCurrentUser(userData);
      
      if (userData) {
        const profiles = await UserProfile.filter({ user_id: userData.id });
        if (profiles.length > 0) {
          setUserProfile(profiles[0]);
        }
        
        // Carregar guias salvos pelo usuário
        const saved = await SavedGuide.filter({ user_id: userData.id });
        setSavedGuides(saved);
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [guidesData, citiesData, beachesData, usersData] = await Promise.all([
        LocalGuide.list("-created_date"),
        City.list(),
        Beach.list(),
        loadAllUsers()
      ]);
      
      setGuides(guidesData);
      setFilteredGuides(guidesData);
      setCities(citiesData);
      setBeaches(beachesData);
      
      // loadAllUsers já define o estado de users
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadAllUsers = async () => {
    try {
      const allUsers = await User.list();
      
      // Para cada usuário, buscar o perfil
      const usersWithProfiles = await Promise.all(
        allUsers.map(async (user) => {
          try {
            const profiles = await UserProfile.filter({ user_id: user.id });
            return {
              ...user,
              profile: profiles.length > 0 ? profiles[0] : null
            };
          } catch (error) {
            return { ...user, profile: null };
          }
        })
      );
      
      setUsers(usersWithProfiles);
      return usersWithProfiles;
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      return [];
    }
  };

  const applyFilters = () => {
    let filtered = [...guides];
    
    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(guide => 
        guide.title.toLowerCase().includes(term) ||
        guide.description.toLowerCase().includes(term) ||
        (guide.tags && guide.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }
    
    // Filtro de localização
    if (locationFilter !== "all") {
      if (locationFilter.startsWith("city_")) {
        const cityId = locationFilter.replace("city_", "");
        filtered = filtered.filter(guide => 
          guide.location_type === "city" && guide.location_id === cityId
        );
      } else if (locationFilter.startsWith("beach_")) {
        const beachId = locationFilter.replace("beach_", "");
        filtered = filtered.filter(guide => 
          guide.location_type === "beach" && guide.location_id === beachId
        );
      } else if (locationFilter === "cities") {
        filtered = filtered.filter(guide => guide.location_type === "city");
      } else if (locationFilter === "beaches") {
        filtered = filtered.filter(guide => guide.location_type === "beach");
      } else if (locationFilter === "regions") {
        filtered = filtered.filter(guide => guide.location_type === "region");
      }
    }
    
    // Filtro de categoria
    if (categoryFilter !== "all") {
      filtered = filtered.filter(guide => guide.category === categoryFilter);
    }
    
    // Filtro de verificação
    if (verifiedFilter) {
      filtered = filtered.filter(guide => guide.is_verified);
    }
    
    setFilteredGuides(filtered);
  };

  const handleGuideSubmit = async (guideData) => {
    try {
      await LocalGuide.create({
        user_id: currentUser.id,
        ...guideData,
        is_verified: false,
        likes_count: 0,
        saves_count: 0,
        views_count: 0
      });
      
      // Recarregar guias
      const newGuides = await LocalGuide.list("-created_date");
      setGuides(newGuides);
      setFilteredGuides(newGuides);
      setIsCreateGuideOpen(false);
    } catch (error) {
      console.error("Erro ao criar guia:", error);
      alert("Ocorreu um erro ao criar o guia local.");
    }
  };

  const handleSaveGuide = async (guideId) => {
    if (!currentUser) {
      alert("Faça login para salvar este guia.");
      return;
    }
    
    try {
      // Verificar se já está salvo
      const existing = savedGuides.find(sg => sg.guide_id === guideId);
      
      if (existing) {
        // Remover dos salvos
        await SavedGuide.delete(existing.id);
        const updated = savedGuides.filter(sg => sg.id !== existing.id);
        setSavedGuides(updated);
      } else {
        // Adicionar aos salvos
        const savedGuide = await SavedGuide.create({
          user_id: currentUser.id,
          guide_id: guideId,
          saved_at: new Date().toISOString()
        });
        setSavedGuides([...savedGuides, savedGuide]);
      }
      
      // Atualizar contagem de salvos no guia
      const guide = guides.find(g => g.id === guideId);
      if (guide) {
        const newCount = existing ? guide.saves_count - 1 : guide.saves_count + 1;
        await LocalGuide.update(guideId, { saves_count: Math.max(0, newCount) });
        
        // Atualizar guias localmente
        const updatedGuides = guides.map(g => {
          if (g.id === guideId) {
            return { ...g, saves_count: Math.max(0, newCount) };
          }
          return g;
        });
        
        setGuides(updatedGuides);
        setFilteredGuides(applyFilters);
      }
    } catch (error) {
      console.error("Erro ao salvar/remover guia:", error);
    }
  };

  const handleLikeGuide = async (guideId) => {
    if (!currentUser) {
      alert("Faça login para curtir este guia.");
      return;
    }
    
    try {
      // Simplificado: apenas incrementa a contagem de curtidas
      // Em um sistema real, você rastrearia quais usuários curtiram
      const guide = guides.find(g => g.id === guideId);
      if (guide) {
        const newCount = guide.likes_count + 1;
        await LocalGuide.update(guideId, { likes_count: newCount });
        
        // Atualizar guias localmente
        const updatedGuides = guides.map(g => {
          if (g.id === guideId) {
            return { ...g, likes_count: newCount };
          }
          return g;
        });
        
        setGuides(updatedGuides);
        setFilteredGuides(applyFilters);
      }
    } catch (error) {
      console.error("Erro ao curtir guia:", error);
    }
  };

  const incrementViews = async (guideId) => {
    try {
      const guide = guides.find(g => g.id === guideId);
      if (guide) {
        const newCount = guide.views_count + 1;
        await LocalGuide.update(guideId, { views_count: newCount });
        
        // Atualizar guias localmente
        const updatedGuides = guides.map(g => {
          if (g.id === guideId) {
            return { ...g, views_count: newCount };
          }
          return g;
        });
        
        setGuides(updatedGuides);
      }
    } catch (error) {
      console.error("Erro ao incrementar visualizações:", error);
    }
  };

  const handleViewGuide = (guide) => {
    setSelectedGuide(guide);
    setIsGuideDetailOpen(true);
    incrementViews(guide.id);
  };

  const getLocationName = (guide) => {
    if (guide.location_type === "city") {
      const city = cities.find(c => c.id === guide.location_id);
      return city ? city.name : "Cidade não encontrada";
    } else if (guide.location_type === "beach") {
      const beach = beaches.find(b => b.id === guide.location_id);
      return beach ? beach.name : "Praia não encontrada";
    } else if (guide.location_type === "region") {
      return "Região";
    }
    return "Local não especificado";
  };

  const getUserById = (userId) => {
    return users.find(u => u.id === userId) || null;
  };

  const isGuideSaved = (guideId) => {
    return savedGuides.some(sg => sg.guide_id === guideId);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "gastronomia": return <Utensils className="w-5 h-5" />;
      case "hospedagem": return <Hotel className="w-5 h-5" />;
      case "passeios": return <Ship className="w-5 h-5" />;
      case "eventos": return <CalendarDays className="w-5 h-5" />;
      case "cultura": return <Palette className="w-5 h-5" />;
      case "compras": return <ShoppingBag className="w-5 h-5" />;
      case "familia": return <Users className="w-5 h-5" />;
      case "noturno": return <Moon className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "gastronomia": return "text-amber-600 bg-amber-100";
      case "hospedagem": return "text-blue-600 bg-blue-100";
      case "passeios": return "text-cyan-600 bg-cyan-100";
      case "eventos": return "text-purple-600 bg-purple-100";
      case "cultura": return "text-pink-600 bg-pink-100";
      case "compras": return "text-emerald-600 bg-emerald-100";
      case "familia": return "text-indigo-600 bg-indigo-100";
      case "noturno": return "text-violet-600 bg-violet-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      gastronomia: "Gastronomia",
      hospedagem: "Hospedagem",
      passeios: "Passeios",
      eventos: "Eventos",
      cultura: "Cultura",
      compras: "Compras",
      familia: "Família",
      noturno: "Vida Noturna",
      geral: "Geral"
    };
    return labels[category] || category;
  };

  const getMySavedGuides = () => {
    if (!savedGuides.length) return [];
    
    return guides.filter(guide => 
      savedGuides.some(sg => sg.guide_id === guide.id)
    );
  };

  const getMyGuides = () => {
    if (!currentUser) return [];
    return guides.filter(guide => guide.user_id === currentUser.id);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full p-6 text-center">
          <div className="mb-6">
            <Map className="w-12 h-12 mx-auto text-blue-500" />
            <h1 className="text-2xl font-bold mt-4">Guias Locais TurismoSC</h1>
            <p className="text-gray-600 mt-2">
              Faça login para descobrir dicas autênticas dos moradores locais e compartilhar suas próprias recomendações sobre Santa Catarina.
            </p>
          </div>
          <Button 
            onClick={() => User.login()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Entrar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Guias Locais</h1>
          <p className="text-gray-600">
            Descubra recomendações autênticas de moradores locais para aproveitar o melhor de Santa Catarina
          </p>
        </div>
        
        {/* Barra de ações */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Buscar guias por título, descrição ou tags..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={() => setIsCreateGuideOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Criar Guia Local
          </Button>
        </div>
        
        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Localização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Localizações</SelectItem>
              <SelectItem value="cities">Todas as Cidades</SelectItem>
              <SelectItem value="beaches">Todas as Praias</SelectItem>
              <SelectItem value="regions">Todas as Regiões</SelectItem>
              
              {cities.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="px-2 py-1.5 text-sm font-semibold">Cidades</div>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={`city_${city.id}`}>
                      {city.name}
                    </SelectItem>
                  ))}
                </>
              )}
              
              {beaches.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="px-2 py-1.5 text-sm font-semibold">Praias</div>
                  {beaches.map(beach => (
                    <SelectItem key={beach.id} value={`beach_${beach.id}`}>
                      {beach.name}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              <SelectItem value="gastronomia">Gastronomia</SelectItem>
              <SelectItem value="hospedagem">Hospedagem</SelectItem>
              <SelectItem value="passeios">Passeios</SelectItem>
              <SelectItem value="eventos">Eventos</SelectItem>
              <SelectItem value="cultura">Cultura</SelectItem>
              <SelectItem value="compras">Compras</SelectItem>
              <SelectItem value="familia">Família</SelectItem>
              <SelectItem value="noturno">Vida Noturna</SelectItem>
              <SelectItem value="geral">Geral</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="verified-filter"
              checked={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="verified-filter" className="text-sm text-gray-700 flex items-center">
              <ShieldCheck className="w-4 h-4 text-blue-600 mr-1" />
              Verificados
            </label>
          </div>
        </div>
        
        {/* Abas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="discover">Descobrir</TabsTrigger>
            <TabsTrigger value="saved">Salvos</TabsTrigger>
            <TabsTrigger value="my-guides">Meus Guias</TabsTrigger>
          </TabsList>
          
          <TabsContent value="discover" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredGuides.length === 0 ? (
              <div className="text-center py-12">
                <Compass className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhum guia encontrado</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Não encontramos guias que correspondam aos seus filtros de busca.
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setLocationFilter("all");
                    setCategoryFilter("all");
                    setVerifiedFilter(false);
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGuides.map(guide => {
                  const user = getUserById(guide.user_id);
                  const locationName = getLocationName(guide);
                  const isSaved = isGuideSaved(guide.id);
                  
                  return (
                    <Card key={guide.id} className="overflow-hidden h-full hover:shadow-lg transition-all">
                      <div 
                        className="relative aspect-video cursor-pointer" 
                        onClick={() => handleViewGuide(guide)}
                      >
                        <img 
                          src={guide.cover_image_url || `https://source.unsplash.com/random/800x600/?${guide.category},travel`} 
                          alt={guide.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                        
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="flex justify-between items-center">
                            <Badge className={`${getCategoryColor(guide.category)}`}>
                              <div className="flex items-center gap-1">
                                {getCategoryIcon(guide.category)}
                                <span>{getCategoryLabel(guide.category)}</span>
                              </div>
                            </Badge>
                            
                            {guide.is_verified && (
                              <Badge className="bg-blue-100 text-blue-800">
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Verificado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <div 
                          className="font-bold text-lg mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => handleViewGuide(guide)}
                        >
                          {guide.title}
                        </div>
                        
                        <div className="flex items-center text-gray-600 text-sm mb-3">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          <span>{locationName}</span>
                        </div>
                        
                        <p className="text-gray-600 line-clamp-2 mb-4">{guide.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={user?.profile?.avatar_url} />
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                {user?.full_name?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-700">{user?.full_name || 'Usuário'}</span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-gray-500">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleLikeGuide(guide.id)}
                            >
                              <ThumbsUp className="h-4 w-4" />
                              <span className="sr-only">Curtir</span>
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${isSaved ? 'text-yellow-500' : 'text-gray-500'}`}
                              onClick={() => handleSaveGuide(guide.id)}
                            >
                              {isSaved ? (
                                <BookmarkCheck className="h-4 w-4 fill-yellow-500" />
                              ) : (
                                <Bookmark className="h-4 w-4" />
                              )}
                              <span className="sr-only">Salvar</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
                        <div className="flex justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              <span>{guide.likes_count || 0}</span>
                            </div>
                            <div className="flex items-center">
                              <Bookmark className="h-3 w-3 mr-1" />
                              <span>{guide.saves_count || 0}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            <span>{guide.views_count || 0} visualizações</span>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="saved" className="mt-6">
            {!currentUser ? (
              <div className="text-center py-12">
                <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Faça login para ver seus guias salvos</h3>
                <Button 
                  onClick={() => User.login()}
                  className="mt-4"
                >
                  Entrar
                </Button>
              </div>
            ) : savedGuides.length === 0 ? (
              <div className="text-center py-12">
                <BookMarked className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhum guia salvo ainda</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Salve os guias que você gostou para acessá-los facilmente mais tarde.
                </p>
                <Button 
                  onClick={() => setActiveTab("discover")}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Descobrir Guias
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getMySavedGuides().map(guide => {
                  const user = getUserById(guide.user_id);
                  const locationName = getLocationName(guide);
                  
                  return (
                    <Card key={guide.id} className="overflow-hidden hover:shadow-lg transition-all">
                      <div 
                        className="relative aspect-video cursor-pointer" 
                        onClick={() => handleViewGuide(guide)}
                      >
                        <img 
                          src={guide.cover_image_url || `https://source.unsplash.com/random/800x600/?${guide.category},travel`} 
                          alt={guide.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                        
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="flex justify-between items-center">
                            <Badge className={`${getCategoryColor(guide.category)}`}>
                              <div className="flex items-center gap-1">
                                {getCategoryIcon(guide.category)}
                                <span>{getCategoryLabel(guide.category)}</span>
                              </div>
                            </Badge>
                            
                            {guide.is_verified && (
                              <Badge className="bg-blue-100 text-blue-800">
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Verificado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <div 
                          className="font-bold text-lg mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => handleViewGuide(guide)}
                        >
                          {guide.title}
                        </div>
                        
                        <div className="flex items-center text-gray-600 text-sm mb-3">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          <span>{locationName}</span>
                        </div>
                        
                        <p className="text-gray-600 line-clamp-2 mb-4">{guide.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={user?.profile?.avatar_url} />
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                {user?.full_name?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-700">{user?.full_name || 'Usuário'}</span>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveGuide(guide.id)}
                            className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                          >
                            <BookmarkCheck className="h-4 w-4 mr-1" />
                            Remover
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-guides" className="mt-6">
            {!currentUser ? (
              <div className="text-center py-12">
                <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Faça login para ver seus guias</h3>
                <Button 
                  onClick={() => User.login()}
                  className="mt-4"
                >
                  Entrar
                </Button>
              </div>
            ) : getMyGuides().length === 0 ? (
              <div className="text-center py-12">
                <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Você ainda não criou nenhum guia</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Compartilhe seu conhecimento local criando guias para ajudar turistas a descobrirem os melhores lugares.
                </p>
                <Button 
                  onClick={() => setIsCreateGuideOpen(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Guia Local
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getMyGuides().map(guide => {
                  const locationName = getLocationName(guide);
                  const isSaved = isGuideSaved(guide.id);
                  
                  return (
                    <Card key={guide.id} className="overflow-hidden hover:shadow-lg transition-all">
                      <div 
                        className="relative aspect-video cursor-pointer" 
                        onClick={() => handleViewGuide(guide)}
                      >
                        <img 
                          src={guide.cover_image_url || `https://source.unsplash.com/random/800x600/?${guide.category},travel`} 
                          alt={guide.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                        
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="flex justify-between items-center">
                            <Badge className={`${getCategoryColor(guide.category)}`}>
                              <div className="flex items-center gap-1">
                                {getCategoryIcon(guide.category)}
                                <span>{getCategoryLabel(guide.category)}</span>
                              </div>
                            </Badge>
                            
                            {guide.is_verified && (
                              <Badge className="bg-blue-100 text-blue-800">
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Verificado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <div 
                          className="font-bold text-lg mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => handleViewGuide(guide)}
                        >
                          {guide.title}
                        </div>
                        
                        <div className="flex items-center text-gray-600 text-sm mb-3">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          <span>{locationName}</span>
                        </div>
                        
                        <p className="text-gray-600 line-clamp-2 mb-4">{guide.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => handleViewGuide(guide)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Visualizar
                          </Button>
                          
                          <div className="flex items-center gap-3 text-gray-500">
                            <div className="flex items-center">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              <span>{guide.likes_count || 0}</span>
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              <span>{guide.views_count || 0}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modal para criar guia */}
      {isCreateGuideOpen && (
        <CreateGuideModal
          user={currentUser}
          onClose={() => setIsCreateGuideOpen(false)}
          onSubmit={handleGuideSubmit}
          cities={cities}
          beaches={beaches}
        />
      )}
      
      {/* Modal para visualizar detalhes do guia */}
      {isGuideDetailOpen && selectedGuide && (
        <GuideDetailModal
          guide={selectedGuide}
          user={getUserById(selectedGuide.user_id)}
          currentUser={currentUser}
          isSaved={isGuideSaved(selectedGuide.id)}
          locationName={getLocationName(selectedGuide)}
          onClose={() => setIsGuideDetailOpen(false)}
          onSave={() => handleSaveGuide(selectedGuide.id)}
          onLike={() => handleLikeGuide(selectedGuide.id)}
          getCategoryIcon={getCategoryIcon}
          getCategoryColor={getCategoryColor}
          getCategoryLabel={getCategoryLabel}
        />
      )}
    </div>
  );
}