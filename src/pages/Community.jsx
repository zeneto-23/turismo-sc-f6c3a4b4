import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Post } from "@/api/entities";
import { UserProfile } from "@/api/entities";
import { Comment } from "@/api/entities";
import { LocalGuide } from "@/api/entities";
import { Event } from "@/api/entities";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Plus,
  Search,
  MapPin,
  Calendar,
  MessageSquare,
  Heart,
  Share2,
  ThumbsUp,
  Map,
  BookOpen,
  UserPlus,
  Filter,
  Bell,
  Home,
  Compass,
  Image as ImageIcon
} from "lucide-react";

import PostCard from "../components/community/PostCard";
import CreatePostModal from "../components/community/CreatePostModal";
import EventCard from "../components/community/EventCard";
import GuideCard from "../components/guides/GuideCard";
import UserProfileCard from "../components/community/UserProfileCard";

export default function Community() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");
  const [userProfiles, setUserProfiles] = useState([]);
  const [guides, setGuides] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    users: [],
    posts: [],
    guides: [],
    events: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await User.me();
        setCurrentUser(userData);
        
        // Carregar posts para o feed
        await loadPosts();
        
        // Carregar perfis de usuários para sugestões
        await loadProfiles();
        
        // Carregar guias locais
        await loadGuides();
        
        // Carregar eventos
        await loadEvents();
        
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const loadPosts = async () => {
    try {
      // Para uma demonstração, vamos criar alguns posts mock
      const mockPosts = [
        {
          id: "1",
          user_id: "user1",
          content: "Visitei a Praia de Jurerê Internacional hoje e fiquei impressionado com a beleza do lugar! Água cristalina e areia branquinha.",
          image_urls: ["https://images.unsplash.com/photo-1583394293214-28ded15ee548?q=80&w=800&auto=format&fit=crop"],
          location_type: "beach",
          location_name: "Praia de Jurerê Internacional",
          post_type: "experience",
          likes_count: 32,
          comments_count: 5,
          created_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: {
            full_name: "Ana Silva",
            avatar_url: "https://randomuser.me/api/portraits/women/44.jpg"
          }
        },
        {
          id: "2",
          user_id: "user2",
          content: "Alguém pode recomendar um bom restaurante em Balneário Camboriú? Estou de visita à cidade e gostaria de experimentar a culinária local.",
          image_urls: [],
          location_type: "city",
          location_name: "Balneário Camboriú",
          post_type: "question",
          likes_count: 8,
          comments_count: 12,
          created_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          user: {
            full_name: "Carlos Oliveira",
            avatar_url: "https://randomuser.me/api/portraits/men/22.jpg"
          }
        },
        {
          id: "3",
          user_id: "user3",
          content: "Dica para quem vai à Praia do Rosa: cheguem cedo para conseguir um bom lugar e aproveitar o dia inteiro. Os restaurantes ficam cheios no almoço!",
          image_urls: ["https://images.unsplash.com/photo-1543731068-7e0f5beff43a?q=80&w=800&auto=format&fit=crop"],
          location_type: "beach",
          location_name: "Praia do Rosa",
          post_type: "tip",
          likes_count: 45,
          comments_count: 7,
          created_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          user: {
            full_name: "Marina Costa",
            avatar_url: "https://randomuser.me/api/portraits/women/68.jpg"
          }
        }
      ];
      
      setPosts(mockPosts);
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
    }
  };
  
  const loadProfiles = async () => {
    try {
      // Simulando perfis de usuários para sugestões
      const mockProfiles = [
        {
          id: "1",
          user_id: "user4",
          bio: "Amante de viagens e praias",
          travel_style: ["aventura", "relaxamento"],
          user: {
            full_name: "João Paulo",
            avatar_url: "https://randomuser.me/api/portraits/men/32.jpg"
          }
        },
        {
          id: "2",
          user_id: "user5",
          bio: "Fotógrafa e blogueira de viagens",
          travel_style: ["cultural", "ecologico"],
          user: {
            full_name: "Fernanda Lima",
            avatar_url: "https://randomuser.me/api/portraits/women/29.jpg"
          }
        },
        {
          id: "3",
          user_id: "user6",
          bio: "Guia local de Florianópolis",
          travel_style: ["gastronomico", "familia"],
          user: {
            full_name: "Pedro Santos",
            avatar_url: "https://randomuser.me/api/portraits/men/55.jpg"
          }
        }
      ];
      
      setUserProfiles(mockProfiles);
    } catch (error) {
      console.error("Erro ao carregar perfis:", error);
    }
  };
  
  const loadGuides = async () => {
    try {
      // Simulando guias locais
      const mockGuides = [
        {
          id: "1",
          user_id: "user7",
          title: "Melhores praias de Florianópolis",
          description: "Um guia completo das praias mais bonitas e acessíveis de Floripa",
          location_type: "city",
          location_id: "florianopolis",
          category: "passeios",
          cover_image_url: "https://images.unsplash.com/photo-1665096852979-3b18f6a29462?q=80&w=800&auto=format&fit=crop",
          likes_count: 87,
          user: {
            full_name: "Luiza Mendes",
            avatar_url: "https://randomuser.me/api/portraits/women/15.jpg"
          }
        },
        {
          id: "2",
          user_id: "user8",
          title: "Gastronomia em Balneário Camboriú",
          description: "Os melhores restaurantes e bares da cidade",
          location_type: "city",
          location_id: "balneario_camboriu",
          category: "gastronomia",
          cover_image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop",
          likes_count: 54,
          user: {
            full_name: "Ricardo Alves",
            avatar_url: "https://randomuser.me/api/portraits/men/63.jpg"
          }
        }
      ];
      
      setGuides(mockGuides);
    } catch (error) {
      console.error("Erro ao carregar guias:", error);
    }
  };
  
  const loadEvents = async () => {
    try {
      // Simulando eventos
      const mockEvents = [
        {
          id: "1",
          title: "Festival Gastronômico de Frutos do Mar",
          description: "Venha experimentar os melhores pratos de frutos do mar de Santa Catarina",
          short_description: "O maior festival gastronômico de SC",
          start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          location_name: "Florianópolis",
          image_url: "https://images.unsplash.com/photo-1559329255-2e7cb3839e37?q=80&w=800&auto=format&fit=crop",
          category: "gastronômico"
        },
        {
          id: "2",
          title: "Campeonato de Surf",
          description: "As melhores ondas e os melhores surfistas do Brasil",
          short_description: "Competição nacional de surf",
          start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          location_name: "Praia da Joaquina",
          image_url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=800&auto=format&fit=crop",
          category: "esportivo"
        }
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Simulando resultados de busca
      const filteredUsers = userProfiles.filter(profile => 
        profile.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (profile.bio && profile.bio.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      const filteredPosts = posts.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.location_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const filteredGuides = guides.filter(guide => 
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults({
        users: filteredUsers,
        posts: filteredPosts,
        guides: filteredGuides,
        events: filteredEvents
      });
      
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      // Aqui você iria criar o post no backend
      console.log("Criando post:", postData);
      
      // Simular adição do post no feed
      const newPost = {
        id: String(Math.floor(Math.random() * 1000)),
        user_id: currentUser?.id,
        content: postData.content,
        image_urls: postData.images || [],
        location_type: postData.locationType,
        location_name: postData.locationName,
        post_type: postData.type,
        likes_count: 0,
        comments_count: 0,
        created_date: new Date().toISOString(),
        user: {
          full_name: currentUser?.full_name || "Usuário",
          avatar_url: currentUser?.avatar_url
        }
      };
      
      setPosts(prevPosts => [newPost, ...prevPosts]);
      setShowCreatePost(false);
    } catch (error) {
      console.error("Erro ao criar post:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007BFF]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm py-3 sticky top-0 z-10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#007BFF]">Comunidade</h1>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                placeholder="Buscar na comunidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-64 pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={handleSearch}
                disabled={isSearching}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              onClick={() => setShowCreatePost(true)}
              className="bg-[#FF5722] hover:bg-[#E64A19] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Post
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Navegação Lateral */}
          <div className="lg:col-span-3">
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="flex items-center mb-6">
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarFallback>{currentUser?.full_name?.[0] || 'U'}</AvatarFallback>
                  {currentUser?.avatar_url && (
                    <AvatarImage src={currentUser.avatar_url} alt={currentUser?.full_name} />
                  )}
                </Avatar>
                <div>
                  <h3 className="font-medium">{currentUser?.full_name || "Usuário"}</h3>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-[#007BFF] text-sm"
                    onClick={() => navigate(createPageUrl("UserProfile"))}
                  >
                    Ver meu perfil
                  </Button>
                </div>
              </div>
              
              <nav className="space-y-1">
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveTab("feed")}
                  className={`w-full justify-start ${activeTab === "feed" ? "bg-blue-50 text-[#007BFF]" : ""}`}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Feed
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveTab("people")}
                  className={`w-full justify-start ${activeTab === "people" ? "bg-blue-50 text-[#007BFF]" : ""}`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Pessoas
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveTab("guides")}
                  className={`w-full justify-start ${activeTab === "guides" ? "bg-blue-50 text-[#007BFF]" : ""}`}
                >
                  <Compass className="h-4 w-4 mr-2" />
                  Guias
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveTab("events")}
                  className={`w-full justify-start ${activeTab === "events" ? "bg-blue-50 text-[#007BFF]" : ""}`}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Eventos
                </Button>
              </nav>
            </div>
            
            {/* Sugestões */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-4 flex items-center">
                <UserPlus className="h-4 w-4 mr-2 text-[#007BFF]" />
                Pessoas para seguir
              </h3>
              
              <div className="space-y-4">
                {userProfiles.slice(0, 3).map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-2">
                        <AvatarFallback>{profile.user.full_name[0]}</AvatarFallback>
                        {profile.user.avatar_url && (
                          <AvatarImage src={profile.user.avatar_url} alt={profile.user.full_name} />
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{profile.user.full_name}</p>
                        <p className="text-xs text-gray-500">{profile.bio?.substring(0, 20)}...</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-[#007BFF] border-[#007BFF]">
                      Seguir
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button variant="link" className="text-[#007BFF] mt-2 w-full">
                Ver mais
              </Button>
            </div>
          </div>
          
          {/* Conteúdo Principal */}
          <div className="lg:col-span-6">
            {/* Feed */}
            {activeTab === "feed" && (
              <div className="space-y-4">
                {/* Criar post card */}
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{currentUser?.full_name?.[0] || 'U'}</AvatarFallback>
                        {currentUser?.avatar_url && (
                          <AvatarImage src={currentUser.avatar_url} alt={currentUser?.full_name} />
                        )}
                      </Avatar>
                      <div 
                        className="bg-gray-100 rounded-full px-4 py-2 flex-1 text-gray-500 cursor-pointer hover:bg-gray-200 transition"
                        onClick={() => setShowCreatePost(true)}
                      >
                        O que você está pensando?
                      </div>
                    </div>
                    <div className="flex mt-3 pt-3 border-t">
                      <Button variant="ghost" onClick={() => setShowCreatePost(true)} className="flex-1">
                        <ImageIcon className="h-4 w-4 mr-2 text-green-500" />
                        Foto
                      </Button>
                      <Button variant="ghost" onClick={() => setShowCreatePost(true)} className="flex-1">
                        <MapPin className="h-4 w-4 mr-2 text-[#FF5722]" />
                        Local
                      </Button>
                      <Button variant="ghost" onClick={() => setShowCreatePost(true)} className="flex-1">
                        <MessageSquare className="h-4 w-4 mr-2 text-[#007BFF]" />
                        Texto
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {searchQuery ? (
                  <div>
                    <h2 className="text-lg font-medium mb-3">Resultados para "{searchQuery}"</h2>
                    {searchResults.posts.length > 0 ? (
                      searchResults.posts.map(post => (
                        <PostCard key={post.id} post={post} />
                      ))
                    ) : (
                      <p className="text-center py-4 text-gray-500">Nenhum post encontrado</p>
                    )}
                  </div>
                ) : (
                  posts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
              </div>
            )}
            
            {/* Pessoas */}
            {activeTab === "people" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Pessoas</h2>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    Filtrar
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(searchQuery ? searchResults.users : userProfiles).map(profile => (
                    <UserProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
                
                {(searchQuery ? searchResults.users : userProfiles).length === 0 && (
                  <p className="text-center py-8 text-gray-500">Nenhum perfil encontrado</p>
                )}
              </div>
            )}
            
            {/* Guias */}
            {activeTab === "guides" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Guias Locais</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Filter className="h-4 w-4" />
                      Filtrar
                    </Button>
                    <Button className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
                      <Plus className="h-4 w-4 mr-1" />
                      Criar Guia
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(searchQuery ? searchResults.guides : guides).map(guide => (
                    <GuideCard key={guide.id} guide={guide} />
                  ))}
                </div>
                
                {(searchQuery ? searchResults.guides : guides).length === 0 && (
                  <p className="text-center py-8 text-gray-500">Nenhum guia encontrado</p>
                )}
              </div>
            )}
            
            {/* Eventos */}
            {activeTab === "events" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Eventos</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Filter className="h-4 w-4" />
                      Filtrar
                    </Button>
                    <Button className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
                      <Plus className="h-4 w-4 mr-1" />
                      Criar Evento
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {(searchQuery ? searchResults.events : events).map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
                
                {(searchQuery ? searchResults.events : events).length === 0 && (
                  <p className="text-center py-8 text-gray-500">Nenhum evento encontrado</p>
                )}
              </div>
            )}
          </div>
          
          {/* Barra Lateral Direita */}
          <div className="lg:col-span-3">
            {/* Eventos em destaque */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-[#FF5722]" />
                Próximos Eventos
              </h3>
              
              <div className="space-y-4">
                {events.slice(0, 2).map(event => (
                  <div key={event.id} className="pb-3 border-b border-gray-100 last:border-0">
                    <div className="relative h-24 rounded-md overflow-hidden mb-2">
                      <img 
                        src={event.image_url} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {new Date(event.start_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {event.location_name}
                    </p>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="link" 
                className="text-[#007BFF] mt-2 w-full"
                onClick={() => setActiveTab("events")}
              >
                Ver todos
              </Button>
            </div>
            
            {/* Guias populares */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-[#4CAF50]" />
                Guias Populares
              </h3>
              
              <div className="space-y-4">
                {guides.slice(0, 2).map(guide => (
                  <div key={guide.id} className="pb-3 border-b border-gray-100 last:border-0">
                    <div className="relative h-24 rounded-md overflow-hidden mb-2">
                      <img 
                        src={guide.cover_image_url} 
                        alt={guide.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white/80 text-[#007BFF] text-xs px-2 py-1 rounded flex items-center">
                        <Heart className="h-3 w-3 mr-1 fill-[#007BFF]" />
                        {guide.likes_count}
                      </div>
                    </div>
                    <h4 className="font-medium text-sm">{guide.title}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center">
                        <Avatar className="h-4 w-4 mr-1">
                          <AvatarFallback>{guide.user.full_name[0]}</AvatarFallback>
                          {guide.user.avatar_url && (
                            <AvatarImage src={guide.user.avatar_url} alt={guide.user.full_name} />
                          )}
                        </Avatar>
                        <p className="text-xs text-gray-500">{guide.user.full_name}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{guide.category}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="link" 
                className="text-[#007BFF] mt-2 w-full"
                onClick={() => setActiveTab("guides")}
              >
                Ver todos
              </Button>
            </div>
            
            {/* Tendências */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-4 flex items-center">
                <Compass className="h-4 w-4 mr-2 text-purple-500" />
                Tendências
              </h3>
              
              <div className="space-y-3">
                {["#PraiasDeSC", "#TurismoSustentável", "#GastronomiaLocal", "#FlorianópolisTOP"].map((tag, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{tag}</p>
                      <p className="text-xs text-gray-500">{Math.floor(Math.random() * 100) + 10} posts</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal para criar post */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSubmit={handleCreatePost}
        user={currentUser}
      />
    </div>
  );
}