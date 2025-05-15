
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Tourist } from "@/api/entities";
import { UserProfile as UserProfileEntity } from "@/api/entities";
import { Review } from "@/api/entities";
import { Post } from "@/api/entities";
import { City } from "@/api/entities";
import { Beach } from "@/api/entities";
import { Business } from "@/api/entities";
import { UserSubscription } from "@/api/entities";
import { SubscriptionPlan } from "@/api/entities";
import { UserConnection } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { 
  User as UserIcon, 
  Mail, 
  MapPin, 
  Calendar, 
  Star, 
  MessageSquare, 
  Pencil, 
  Crown, 
  Users, 
  Instagram, 
  Facebook, 
  Youtube, 
  Globe, 
  PlusCircle, 
  MinusCircle,
  Heart,
  Camera,
  ImageIcon,
  Edit,
  Save,
  X,
  ChevronLeft,
  Upload,
  Info,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BackButton } from "@/components/ui/BackButton";
import PostCard from "@/components/community/PostCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast"

export default function UserProfile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    bio: "",
    location: "",
    avatar_url: "",
    cover_url: "",
    interests: [],
    is_local: false,
    social_links: {
      instagram: "",
      facebook: "",
      twitter: "",
      youtube: ""
    },
    travel_style: []
  });
  const [newInterest, setNewInterest] = useState("");
  const [newTravelStyle, setNewTravelStyle] = useState("");
  const [userPosts, setUserPosts] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewEntities, setReviewEntities] = useState({});
  const [userStats, setUserStats] = useState({
    posts: 0,
    reviews: 0,
    following: 0,
    followers: 0
  });
  const [userSubscription, setUserSubscription] = useState(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingStatus, setFollowingStatus] = useState({
    loading: false,
    error: null
  });
  
  const profileImageInputRef = useRef(null);
  const coverImageInputRef = useRef(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState({ profile: false, cover: false });
  const [uploadError, setUploadError] = useState({ profile: null, cover: null });
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  
  const navigate = useNavigate();
 
  const travelStyles = [
    { value: "aventura", label: "Aventura" },
    { value: "relaxamento", label: "Relaxamento" },
    { value: "cultural", label: "Cultural" },
    { value: "gastronomico", label: "Gastronômico" },
    { value: "ecologico", label: "Ecológico" },
    { value: "festa", label: "Festa" },
    { value: "familia", label: "Família" },
    { value: "romantico", label: "Romântico" },
    { value: "esportivo", label: "Esportivo" },
    { value: "low_cost", label: "Econômico" }
  ];

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

    setCurrentUser(user);
  }, [navigate]);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      setProfileError(null);
      
      try {
        console.log("Carregando dados do usuário logado...");
        const loggedUser = await User.me();
        
        console.log("Carregando perfil do usuário...");
        const profileData = await UserProfileEntity.filter({ user_id: loggedUser.id });
        
        try {
          const citiesData = await City.list();
          setCities(citiesData || []);
        } catch (cityError) {
          console.error("Erro ao carregar cidades:", cityError);
        }
        
        if (profileData && profileData.length > 0) {
          console.log("Perfil encontrado:", profileData[0]);
          setUserProfile(profileData[0]);
          setIsOwnProfile(true);
          
          setEditedProfile({
            bio: profileData[0].bio || "",
            location: profileData[0].location || "",
            avatar_url: profileData[0].avatar_url || "",
            cover_url: profileData[0].cover_url || "",
            interests: profileData[0].interests || [],
            is_local: profileData[0].is_local || false,
            social_links: profileData[0].social_links || {
              instagram: "",
              facebook: "",
              twitter: "",
              youtube: ""
            },
            travel_style: profileData[0].travel_style || []
          });
          
          if (profileData[0].avatar_url) {
            setProfileImagePreview(profileData[0].avatar_url);
          }
          
          if (profileData[0].cover_url) {
            setCoverImagePreview(profileData[0].cover_url);
          }
          
        } else {
          console.log("Perfil não encontrado, criando novo perfil para o usuário");
          const newProfile = await UserProfileEntity.create({
            user_id: loggedUser.id,
            bio: "",
            location: "",
            interests: [],
            is_local: false,
            social_links: {
              instagram: "",
              facebook: "",
              twitter: "",
              youtube: ""
            },
            travel_style: [],
            following_count: 0,
            followers_count: 0,
            posts_count: 0,
            reviews_count: 0,
            privacy_settings: {
              show_email: false,
              show_location: true,
              show_social_links: true
            }
          });
          
          setUserProfile(newProfile);
          setEditedProfile({
            bio: "",
            location: "",
            avatar_url: "",
            cover_url: "",
            interests: [],
            is_local: false,
            social_links: {
              instagram: "",
              facebook: "",
              twitter: "",
              youtube: ""
            },
            travel_style: []
          });
          setIsOwnProfile(true);
        }
        
        
        
        try {
          const postsData = await Post.filter({ user_id: loggedUser.id });
          setUserPosts(postsData || []);
          
          const reviewsData = await Review.filter({ user_id: loggedUser.id });
          setUserReviews(reviewsData || []);
          
          setUserStats({
            posts: postsData?.length || 0,
            reviews: reviewsData?.length || 0,
            following: 0,
            followers: 0
          });
          
          if (reviewsData && reviewsData.length > 0) {
            const entityMap = {};
            
            for (const review of reviewsData) {
              if (!entityMap[review.entity_id]) {
                try {
                  if (review.entity_type === "city") {
                    const cityData = await City.filter({ id: review.entity_id });
                    if (cityData && cityData.length > 0) {
                      entityMap[review.entity_id] = {
                        type: "city",
                        name: cityData[0].name,
                        data: cityData[0]
                      };
                    }
                  } else if (review.entity_type === "beach") {
                    const beachData = await Beach.filter({ id: review.entity_id });
                    if (beachData && beachData.length > 0) {
                      entityMap[review.entity_id] = {
                        type: "beach",
                        name: beachData[0].name,
                        data: beachData[0]
                      };
                    }
                  } else if (review.entity_type === "business") {
                    const businessData = await Business.filter({ id: review.entity_id });
                    if (businessData && businessData.length > 0) {
                      entityMap[review.entity_id] = {
                        type: "business",
                        name: businessData[0].name,
                        data: businessData[0]
                      };
                    }
                  }
                } catch (err) {
                  console.error(`Erro ao carregar entidade ${review.entity_type} com ID ${review.entity_id}:`, err);
                }
              }
            }
            
            setReviewEntities(entityMap);
          }
          
          const subscriptionData = await UserSubscription.filter({ user_id: loggedUser.id });
          if (subscriptionData && subscriptionData.length > 0) {
            const activeSubscriptions = subscriptionData.filter(sub => 
              sub.status === "active" && new Date(sub.end_date) >= new Date()
            ).sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
            
            if (activeSubscriptions.length > 0) {
              setUserSubscription(activeSubscriptions[0]);
              
              const plansData = await SubscriptionPlan.list();
              const userPlan = plansData.find(p => p.id === activeSubscriptions[0].plan_id);
              if (userPlan) {
                setSubscriptionPlan(userPlan);
              }
            }
          }
          
        } catch (dataErr) {
          console.error("Erro ao carregar dados associados:", dataErr);
        }
        
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        setProfileError("Não foi possível carregar os dados do perfil. Por favor, tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  const handlePasswordChange = async (newPassword) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) return;
  
      // Encontrar e atualizar usuário na lista
      // const userIndex = AUTHORIZED_USERS.findIndex(u => u.id === currentUser.id);
      // if (userIndex > -1) {
      //   AUTHORIZED_USERS[userIndex] = {
      //     ...AUTHORIZED_USERS[userIndex],
      //     password: newPassword,
      //     must_change_password: false
      //   };
  
        // Atualizar usuário no localStorage
        // localStorage.setItem('currentUser', JSON.stringify(AUTHORIZED_USERS[userIndex]));
  
        toast({
          title: "Senha alterada com sucesso",
          description: "Sua nova senha foi salva."
        });
      // }
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setUploadError({ ...uploadError, profile: 'Por favor, selecione um arquivo de imagem válido.' });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { 
      setUploadError({ ...uploadError, profile: 'A imagem deve ter no máximo 5MB.' });
      return;
    }
    
    setUploadError({ ...uploadError, profile: null });
    
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setIsUploading({ ...isUploading, profile: true });
    try {
      const { file_url } = await UploadFile({ file });
      setEditedProfile({
        ...editedProfile,
        avatar_url: file_url
      });
      console.log("Foto de perfil enviada com sucesso:", file_url);
    } catch (error) {
      console.error("Erro ao fazer upload da imagem de perfil:", error);
      setUploadError({ ...uploadError, profile: 'Erro ao enviar a imagem. Tente novamente.' });
    } finally {
      setIsUploading({ ...isUploading, profile: false });
    }
  };

  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setUploadError({ ...uploadError, cover: 'Por favor, selecione um arquivo de imagem válido.' });
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB
      setUploadError({ ...uploadError, cover: 'A imagem deve ter no máximo 10MB.' });
      return;
    }
    
    setUploadError({ ...uploadError, cover: null });
    
    const reader = new FileReader();
    reader.onload = () => {
      setCoverImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setIsUploading({ ...isUploading, cover: true });
    try {
      const { file_url } = await UploadFile({ file });
      setEditedProfile({
        ...editedProfile,
        cover_url: file_url
      });
      console.log("Foto de capa enviada com sucesso:", file_url);
    } catch (error) {
      console.error("Erro ao fazer upload da imagem de capa:", error);
      setUploadError({ ...uploadError, cover: 'Erro ao enviar a imagem. Tente novamente.' });
    } finally {
      setIsUploading({ ...isUploading, cover: false });
    }
  };

  const handleAddCustomTravelStyle = () => {
    if (newTravelStyle.trim() && !editedProfile.travel_style.includes(newTravelStyle.trim())) {
      setEditedProfile({
        ...editedProfile,
        travel_style: [...editedProfile.travel_style, newTravelStyle.trim()]
      });
      setNewTravelStyle("");
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !editedProfile.interests.includes(newInterest.trim())) {
      setEditedProfile({
        ...editedProfile,
        interests: [...editedProfile.interests, newInterest.trim()]
      });
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interest) => {
    setEditedProfile({
      ...editedProfile,
      interests: editedProfile.interests.filter(i => i !== interest)
    });
  };

  const handleToggleTravelStyle = (style) => {
    if (editedProfile.travel_style.includes(style)) {
      setEditedProfile({
        ...editedProfile,
        travel_style: editedProfile.travel_style.filter(s => s !== style)
      });
    } else {
      setEditedProfile({
        ...editedProfile,
        travel_style: [...editedProfile.travel_style, style]
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      console.log("Salvando perfil:", editedProfile);
      
      if (userProfile) {
        const updatedProfile = await UserProfileEntity.update(userProfile.id, {
          ...userProfile,
          bio: editedProfile.bio,
          location: editedProfile.location,
          avatar_url: editedProfile.avatar_url,
          cover_url: editedProfile.cover_url,
          interests: editedProfile.interests,
          is_local: editedProfile.is_local,
          social_links: editedProfile.social_links,
          travel_style: editedProfile.travel_style
        });
        
        setUserProfile(updatedProfile);
        setIsEditing(false);
        
        setProfileImagePreview(editedProfile.avatar_url);
        setCoverImagePreview(editedProfile.cover_url);
        
        alert("Perfil atualizado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert("Ocorreu um erro ao atualizar o perfil. Tente novamente.");
    }
  };

  const handleFollowToggle = async () => {
    if (!isOwnProfile) {
      setFollowingStatus({ loading: true, error: null });
      
      try {
        if (isFollowing) {
          setIsFollowing(false);
        } else {
          setIsFollowing(true);
        }
      } catch (error) {
        console.error("Erro ao alterar status de seguir:", error);
        setFollowingStatus({ 
          loading: false, 
          error: "Não foi possível atualizar o status de seguir. Tente novamente." 
        });
      } finally {
        setFollowingStatus({ loading: false, error: null });
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="mb-4">
        <BackButton />
      </div>
      
      {isLoading ? (
        <div className="space-y-6">
          <div className="h-40 md:h-64 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3">
              <div className="h-80 bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
            <div className="w-full md:w-2/3">
              <div className="h-32 bg-gray-200 animate-pulse rounded-lg mb-4"></div>
              <div className="h-40 bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
          </div>
        </div>
      ) : profileError ? (
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <p className="text-red-500 mb-4">{profileError}</p>
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Tentar Novamente
          </Button>
        </div>
      ) : (
        <>
          <div className="relative mb-20 md:mb-24">
            <div className="h-40 md:h-64 w-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg overflow-hidden">
              {isEditing ? (
                coverImagePreview ? (
                  <img 
                    src={coverImagePreview} 
                    alt="Preview da capa" 
                    className="w-full h-full object-cover"
                  />
                ) : userProfile?.cover_url ? (
                  <img 
                    src={userProfile.cover_url} 
                    alt="Capa do perfil" 
                    className="w-full h-full object-cover"
                  />
                ) : null
              ) : userProfile?.cover_url ? (
                <img 
                  src={userProfile.cover_url} 
                  alt="Capa do perfil" 
                  className="w-full h-full object-cover"
                />
              ) : null}
              
              {isEditing && (
                <div className="absolute top-3 right-3">
                  <Button 
                    variant="secondary"
                    className="flex items-center gap-2 bg-white/90 backdrop-blur-sm"
                    onClick={() => coverImageInputRef.current?.click()}
                    disabled={isUploading.cover}
                  >
                    {isUploading.cover ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    <span>{coverImagePreview ? "Trocar Capa" : "Adicionar Capa"}</span>
                  </Button>
                  <input
                    type="file"
                    ref={coverImageInputRef}
                    onChange={handleCoverImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}
              
              {uploadError.cover && (
                <div className="absolute bottom-2 right-2 bg-red-50 p-2 rounded-md text-sm text-red-600 border border-red-200">
                  {uploadError.cover}
                </div>
              )}
            </div>
            
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
              <div className="relative">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white rounded-full overflow-hidden relative">
                  {isEditing ? (
                    profileImagePreview ? (
                      <img 
                        src={profileImagePreview} 
                        alt="Preview do perfil" 
                        className="w-full h-full object-cover"
                      />
                    ) : userProfile?.avatar_url ? (
                      <AvatarImage src={userProfile.avatar_url} alt={currentUser?.full_name} />
                    ) : (
                      <AvatarFallback className="text-3xl md:text-4xl bg-blue-100 text-blue-800">
                        {currentUser?.full_name?.[0] || 'U'}
                      </AvatarFallback>
                    )
                  ) : userProfile?.avatar_url ? (
                    <AvatarImage src={userProfile.avatar_url} alt={currentUser?.full_name} />
                  ) : (
                    <AvatarFallback className="text-3xl md:text-4xl bg-blue-100 text-blue-800">
                      {currentUser?.full_name?.[0] || 'U'}
                    </AvatarFallback>
                  )}
                  
                  {isEditing && (
                    <Button 
                      size="sm"
                      variant="secondary"
                      className="absolute bottom-0 right-0 rounded-full p-1 shadow-md"
                      onClick={() => profileImageInputRef.current?.click()}
                    >
                      {isUploading.profile ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </Avatar>
                
                <input
                  type="file"
                  ref={profileImageInputRef}
                  onChange={handleProfileImageChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {uploadError.profile && (
                  <div className="absolute -bottom-10 -right-24 md:-right-32 bg-red-50 p-2 rounded-md text-xs text-red-600 border border-red-200 w-48">
                    {uploadError.profile}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 order-2 md:order-1">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Sobre</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Biografia</label>
                        <Textarea
                          placeholder="Conte um pouco sobre você..."
                          value={editedProfile.bio || ""}
                          onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Cidade</label>
                        <Select 
                          value={selectedCity} 
                          onValueChange={(value) => {
                            setSelectedCity(value);
                            const city = cities.find(c => c.id === value);
                            if (city) {
                              setEditedProfile({
                                ...editedProfile, 
                                location: city.name
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione sua cidade" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.length > 0 ? (
                              cities.map((city) => (
                                <SelectItem key={city.id} value={city.id}>
                                  {city.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>
                                Nenhuma cidade disponível
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        
                        <div className="mt-2">
                          <label className="block text-sm font-medium mb-1">Ou digite sua localização</label>
                          <Input
                            placeholder="Sua cidade/estado"
                            value={editedProfile.location || ""}
                            onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is_local"
                          checked={editedProfile.is_local}
                          onChange={(e) => setEditedProfile({...editedProfile, is_local: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="is_local" className="text-sm">Sou morador local</label>
                      </div>
                    </div>
                  ) : (
                    <>
                      {userProfile?.bio ? (
                        <p>{userProfile.bio}</p>
                      ) : (
                        <p className="text-gray-500 italic">
                          {isOwnProfile ? "Adicione uma biografia editando seu perfil." : "Usuário não adicionou uma biografia."}
                        </p>
                      )}
                      
                      {userProfile?.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{userProfile.location}</span>
                          {userProfile.is_local && (
                            <Badge variant="outline" className="ml-1 text-xs">Morador Local</Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Membro desde {formatDate(currentUser?.created_date)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>Interesses</span>
                    {isEditing && (
                      <div className="flex items-center">
                        <Input
                          placeholder="Novo interesse"
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          className="text-sm w-32 mr-2"
                        />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleAddInterest}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2">
                      {editedProfile.interests && editedProfile.interests.length > 0 ? (
                        editedProfile.interests.map((interest, index) => (
                          <Badge key={index} variant="outline" className="pl-2 flex items-center gap-1">
                            {interest}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-5 w-5 p-0 ml-1 text-gray-500 hover:text-red-500"
                              onClick={() => handleRemoveInterest(interest)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">Adicione seus interesses</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {userProfile?.interests && userProfile.interests.length > 0 ? (
                        userProfile.interests.map((interest, index) => (
                          <Badge key={index} variant="outline">
                            {interest}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">
                          {isOwnProfile ? "Adicione seus interesses editando seu perfil." : "Usuário não adicionou interesses."}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Estilo de Viagem</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {travelStyles.map((style) => (
                          <div key={style.value} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`style-${style.value}`}
                              checked={editedProfile.travel_style?.includes(style.value)}
                              onChange={() => handleToggleTravelStyle(style.value)}
                              className="mr-2 rounded border-gray-300"
                            />
                            <label htmlFor={`style-${style.value}`}>{style.label}</label>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center">
                        <Input
                            placeholder="Novo estilo"
                            value={newTravelStyle}
                            onChange={(e) => setNewTravelStyle(e.target.value)}
                            className="text-sm w-32 mr-2"
                        />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleAddCustomTravelStyle}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {editedProfile.travel_style && editedProfile.travel_style.some(style => 
                        !travelStyles.map(s => s.value).includes(style)
                      ) && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Estilos personalizados:</p>
                          <div className="flex flex-wrap gap-2">
                            {editedProfile.travel_style
                              .filter(style => !travelStyles.map(s => s.value).includes(style))
                              .map((style, index) => (
                                <Badge key={index} variant="outline" className="pl-2 flex items-center gap-1">
                                  {style}
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-5 w-5 p-0 ml-1 text-gray-500 hover:text-red-500"
                                    onClick={() => setEditedProfile({
                                      ...editedProfile,
                                      travel_style: editedProfile.travel_style.filter(s => s !== style)
                                    })}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {userProfile?.travel_style && userProfile.travel_style.length > 0 ? (
                        userProfile.travel_style.map((style, index) => {
                          const styleData = travelStyles.find(s => s.value === style);
                          return (
                            <Badge key={index} variant="secondary">
                              {styleData ? styleData.label : style}
                            </Badge>
                          );
                        })
                      ) : (
                        <p className="text-gray-500 italic">
                          {isOwnProfile ? "Adicione seus estilos de viagem editando seu perfil." : "Usuário não definiu estilos de viagem."}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Redes Sociais</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Instagram className="h-5 w-5 text-pink-600 mr-2" />
                        <Input
                          placeholder="Seu perfil no Instagram"
                          value={editedProfile.social_links?.instagram || ""}
                          onChange={(e) => setEditedProfile({
                            ...editedProfile, 
                            social_links: {
                              ...editedProfile.social_links,
                              instagram: e.target.value
                            }
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <Facebook className="h-5 w-5 text-blue-600 mr-2" />
                        <Input
                          placeholder="Seu perfil no Facebook"
                          value={editedProfile.social_links?.facebook || ""}
                          onChange={(e) => setEditedProfile({
                            ...editedProfile, 
                            social_links: {
                              ...editedProfile.social_links,
                              facebook: e.target.value
                            }
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <Youtube className="h-5 w-5 text-red-600 mr-2" />
                        <Input
                          placeholder="Seu canal no YouTube"
                          value={editedProfile.social_links?.youtube || ""}
                          onChange={(e) => setEditedProfile({
                            ...editedProfile, 
                            social_links: {
                              ...editedProfile.social_links,
                              youtube: e.target.value
                            }
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-blue-500 mr-2" />
                        <Input
                          placeholder="Seu site pessoal"
                          value={editedProfile.social_links?.website || ""}
                          onChange={(e) => setEditedProfile({
                            ...editedProfile, 
                            social_links: {
                              ...editedProfile.social_links,
                              website: e.target.value
                            }
                          })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {userProfile?.social_links?.instagram && (
                        <a 
                          href={`https://instagram.com/${userProfile.social_links.instagram}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-700 hover:text-pink-600"
                        >
                          <Instagram className="h-5 w-5 text-pink-600 mr-2" />
                          <span>@{userProfile.social_links.instagram}</span>
                        </a>
                      )}
                      
                      {userProfile?.social_links?.facebook && (
                        <a 
                          href={`https://facebook.com/${userProfile.social_links.facebook}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-700 hover:text-blue-600"
                        >
                          <Facebook className="h-5 w-5 text-blue-600 mr-2" />
                          <span>{userProfile.social_links.facebook}</span>
                        </a>
                      )}
                      
                      {userProfile?.social_links?.youtube && (
                        <a 
                          href={`https://youtube.com/${userProfile.social_links.youtube}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-700 hover:text-red-600"
                        >
                          <Youtube className="h-5 w-5 text-red-600 mr-2" />
                          <span>{userProfile.social_links.youtube}</span>
                        </a>
                      )}
                      
                      {userProfile?.social_links?.website && (
                        <a 
                          href={userProfile.social_links.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-700 hover:text-blue-500"
                        >
                          <Globe className="h-5 w-5 text-blue-500 mr-2" />
                          <span>Site Pessoal</span>
                        </a>
                      )}
                      
                      {(!userProfile?.social_links || 
                        (!userProfile.social_links.instagram && 
                         !userProfile.social_links.facebook && 
                         !userProfile.social_links.youtube && 
                         !userProfile.social_links.website)) && (
                        <p className="text-gray-500 italic">
                          {isOwnProfile ? "Adicione suas redes sociais editando seu perfil." : "Usuário não adicionou redes sociais."}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="w-full md:w-2/3 order-1 md:order-2">
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl">{currentUser?.full_name}</CardTitle>
                      <CardDescription>{currentUser?.email}</CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {subscriptionPlan && (
                        <Badge 
                          className="bg-gradient-to-r from-amber-400 to-amber-600 text-white"
                        >
                          <Crown className="h-3 w-3 mr-1" />
                          {subscriptionPlan.name}
                        </Badge>
                      )}
                      
                      {isOwnProfile && (
                        <Button 
                          variant={isEditing ? "default" : "outline"}
                          onClick={() => {
                            if (isEditing) {
                              handleSaveProfile();
                            } else {
                              setIsEditing(true);
                            }
                          }}
                          className={isEditing ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          {isEditing ? (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Salvar
                            </>
                          ) : (
                            <>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar Perfil
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-3">
                  <div className="flex flex-wrap justify-around md:justify-start gap-4 md:gap-6">
                    <div className="text-center md:text-left">
                      <p className="text-xl md:text-2xl font-semibold">{userStats.posts}</p>
                      <p className="text-gray-500 text-sm">Publicações</p>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-xl md:text-2xl font-semibold">{userStats.reviews}</p>
                      <p className="text-gray-500 text-sm">Avaliações</p>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-xl md:text-2xl font-semibold">{userStats.followers}</p>
                      <p className="text-gray-500 text-sm">Seguidores</p>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-xl md:text-2xl font-semibold">{userStats.following}</p>
                      <p className="text-gray-500 text-sm">Seguindo</p>
                    </div>
                  </div>
                </CardContent>
                
                {isEditing && (
                  <CardFooter className="bg-blue-50 border-t border-blue-100 flex flex-col sm:flex-row justify-between py-3 gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedProfile({
                          bio: userProfile?.bio || "",
                          location: userProfile?.location || "",
                          avatar_url: userProfile?.avatar_url || "",
                          cover_url: userProfile?.cover_url || "",
                          interests: userProfile?.interests || [],
                          is_local: userProfile?.is_local || false,
                          social_links: userProfile?.social_links || {
                            instagram: "",
                            facebook: "",
                            twitter: "",
                            youtube: ""
                          },
                          travel_style: userProfile?.travel_style || []
                        });
                        setProfileImagePreview(userProfile?.avatar_url || "");
                        setCoverImagePreview(userProfile?.cover_url || "");
                        setUploadError({ profile: null, cover: null });
                      }}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full sm:w-auto"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    
                    <Button 
                      onClick={handleSaveProfile}
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                      disabled={isUploading.profile || isUploading.cover}
                    >
                      {(isUploading.profile || isUploading.cover) ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </CardFooter>
                )}
              </Card>
              
              {isEditing && (
                <Alert className="mb-6 bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle>Dicas para seu perfil</AlertTitle>
                  <AlertDescription className="text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                      <li>Adicione uma foto de perfil e capa para personalizar seu perfil</li>
                      <li>Escreva uma biografia interessante para que outras pessoas conheçam você</li>
                      <li>Marque se é um morador local para que turistas possam buscar suas dicas</li>
                      <li>Adicione seus interesses e estilo de viagem para conectar com pessoas semelhantes</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              <Tabs defaultValue="posts" className="w-full">
                <TabsList className="grid grid-cols-2 w-full mb-6">
                  <TabsTrigger value="posts">Publicações</TabsTrigger>
                  <TabsTrigger value="reviews">Avaliações</TabsTrigger>
                </TabsList>
                
                <TabsContent value="posts">
                  {userPosts.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <MessageSquare className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <h3 className="text-lg font-medium">Nenhuma publicação ainda</h3>
                      <p className="text-gray-500 mb-4">
                        {isOwnProfile ? "Você ainda não fez nenhuma publicação." : "Este usuário ainda não fez publicações."}
                      </p>
                      {isOwnProfile && (
                        <Button 
                          onClick={() => navigate(createPageUrl("Community"))}
                          className="mt-2"
                        >
                          Criar Publicação
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {userPosts.map(post => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="reviews">
                  {userReviews.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Star className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <h3 className="text-lg font-medium">Nenhuma avaliação ainda</h3>
                      <p className="text-gray-500 mb-4">
                        {isOwnProfile ? "Você ainda não fez nenhuma avaliação." : "Este usuário ainda não fez avaliações."}
                      </p>
                      {isOwnProfile && (
                        <Button 
                          onClick={() => navigate(createPageUrl("PublicBeaches"))}
                          className="mt-2"
                        >
                          Explorar Lugares
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userReviews.map(review => {
                        const entity = reviewEntities[review.entity_id];
                        return (
                          <Card key={review.id} className="overflow-hidden">
                            <div className="flex flex-col sm:flex-row">
                              <div className="w-full sm:w-1/4 h-32 bg-gray-200 flex items-center justify-center">
                                {review.image_urls && review.image_urls.length > 0 ? (
                                  <img 
                                    src={review.image_urls[0]} 
                                    alt="Imagem da avaliação" 
                                    className="w-full h-full object-cover"
                                  />
                                ) : entity?.data?.image_url ? (
                                  <img 
                                    src={entity.data.image_url} 
                                    alt={entity.name} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="h-10 w-10 text-gray-400" />
                                )}
                              </div>
                              
                              <div className="p-4 flex-1">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                  <div>
                                    <Badge variant="outline" className="mb-2">
                                      {review.entity_type === "city" ? "Cidade" :
                                       review.entity_type === "beach" ? "Praia" :
                                       review.entity_type === "business" ? "Comércio" : 
                                       "Serviço"}
                                    </Badge>
                                    <h3 className="text-lg font-semibold">
                                      {entity?.name || `${review.entity_type} #${review.entity_id}`}
                                    </h3>
                                  </div>
                                  
                                  <div className="flex items-center mt-2 sm:mt-0">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                      <Star 
                                        key={index} 
                                        className={`h-5 w-5 ${index < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                      />
                                    ))}
                                  </div>
                                </div>
                                
                                {review.comment && (
                                  <p className="mt-2 text-gray-700">{review.comment}</p>
                                )}
                                
                                {review.visit_date && (
                                  <p className="text-sm text-gray-500 mt-2">
                                    Visitado em {formatDate(review.visit_date)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
