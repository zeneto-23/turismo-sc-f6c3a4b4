
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Property } from "@/api/entities";
import { PropertyCategory } from "@/api/entities";
import { City } from "@/api/entities";
import { Realtor } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadFile } from "@/api/integrations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Upload,
  Image as ImageIcon,
  Plus,
  X,
  Loader2
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import BackButton from "@/components/ui/BackButton";

export default function PropertyForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [realtor, setRealtor] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [property, setProperty] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    price: "",
    property_type: "sale", // Definindo um valor padrão
    city_id: "",
    address: "",
    neighborhood: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    parking_spots: "",
    features: [],
    main_image_url: "",
    images: [],
    realtor_id: "", // Será preenchido no loadInitialData
    condo_fee: "",
    iptu: ""
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      console.log("PropertyForm: Iniciando carregamento de dados");
      
      // Verificar se há usuário logado no localStorage
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) {
        console.log("PropertyForm: Usuário não encontrado no localStorage");
        toast({
          title: "Erro de Autenticação",
          description: "Você precisa estar logado para acessar esta página.",
          variant: "destructive"
        });
        navigate(createPageUrl("UserAccount"));
        return;
      }
      
      const localUserData = JSON.parse(storedUser);
      console.log("PropertyForm: Usuário do localStorage:", localUserData);
      
      let realtorData = null;
      
      // Se temos realtor_id no localUserData, tentamos carregar diretamente
      if (localUserData.realtor_id) {
        try {
          console.log("PropertyForm: Tentando carregar imobiliária pelo ID:", localUserData.realtor_id);
          realtorData = await Realtor.get(localUserData.realtor_id);
          console.log("PropertyForm: Imobiliária carregada por ID:", realtorData);
        } catch (error) {
          console.error("PropertyForm: Erro ao carregar imobiliária por ID:", error);
        }
      }
      
      // Se não conseguimos carregar pelo ID, tentamos pelo email
      if (!realtorData && localUserData.email) {
        try {
          console.log("PropertyForm: Tentando buscar imobiliárias pelo email:", localUserData.email);
          const realtors = await Realtor.list();
          
          // Busca case-insensitive para evitar problemas com maiúsculas/minúsculas
          const matchedRealtor = realtors.find(r => 
            r.email && r.email.trim().toLowerCase() === localUserData.email.trim().toLowerCase()
          );
          
          if (matchedRealtor) {
            realtorData = matchedRealtor;
            console.log("PropertyForm: Imobiliária encontrada por email:", realtorData);
            
            // Atualizar o localStorage
            if (localUserData.realtor_id !== realtorData.id) {
              localUserData.realtor_id = realtorData.id;
              localStorage.setItem('currentUser', JSON.stringify(localUserData));
              console.log("PropertyForm: currentUser atualizado no localStorage");
            }
          } else {
            console.log("PropertyForm: Nenhuma imobiliária encontrada para o email:", localUserData.email);
          }
        } catch (error) {
          console.error("PropertyForm: Erro ao buscar imobiliárias por email:", error);
        }
      }
      
      if (!realtorData) {
        console.error("PropertyForm: Imobiliária não encontrada");
        toast({
          title: "Erro",
          description: "Imobiliária não encontrada. Por favor, faça login novamente.",
          variant: "destructive"
        });
        navigate(createPageUrl("UserAccount"));
        return;
      }
      
      setRealtor(realtorData);
      setFormData(prev => ({ ...prev, realtor_id: realtorData.id }));
      console.log("PropertyForm: Imobiliária definida:", realtorData.company_name);

      // Carregar categorias e cidades
      console.log("PropertyForm: Carregando categorias e cidades");
      try {
        const categoriesData = await PropertyCategory.list();
        setCategories(categoriesData || []);
        console.log("PropertyForm: Categorias carregadas:", categoriesData?.length || 0);
      } catch (err) {
        console.error("PropertyForm: Erro ao carregar categorias:", err);
      }
      
      try {
        const citiesData = await City.list();
        setCities(citiesData || []);
        console.log("PropertyForm: Cidades carregadas:", citiesData?.length || 0);
      } catch (err) {
        console.error("PropertyForm: Erro ao carregar cidades:", err);
      }

      // Verificar se é edição
      const urlParams = new URLSearchParams(window.location.search);
      const propertyId = urlParams.get('id');
      if (propertyId) {
        const propertyData = await Property.get(propertyId);
        setProperty(propertyData);
        setFormData(prev => ({ ...prev, ...propertyData, realtor_id: realtorData.id }));
        setMainImage(propertyData.main_image_url);
        setGalleryImages(propertyData.images || []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados necessários.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true); // Inicia loading específico para upload
    try {
      const result = await UploadFile({ file });
      
      if (result && result.file_url) {
        if (type === 'main') {
          setMainImage(result.file_url);
          setFormData(prev => ({ ...prev, main_image_url: result.file_url }));
        } else {
          setGalleryImages(prev => [...prev, result.file_url]);
          setFormData(prev => ({ 
            ...prev, 
            images: [...(prev.images || []), result.file_url] 
          }));
        }
        toast({ title: "Sucesso", description: "Imagem enviada." });
      } else {
        throw new Error("URL da imagem não retornada.");
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro de Upload",
        description: "Não foi possível fazer upload da imagem. " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false); // Finaliza loading específico para upload
    }
  };

  const removeImage = (index, type) => {
    if (type === 'main') {
      setMainImage(null);
      setFormData(prev => ({ ...prev, main_image_url: "" }));
    } else {
      const newGallery = [...galleryImages];
      newGallery.splice(index, 1);
      setGalleryImages(newGallery);
      setFormData(prev => ({ ...prev, images: newGallery }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!realtor || !formData.realtor_id) {
      toast({
        title: "Erro de Identificação da Imobiliária",
        description: "Não foi possível identificar a imobiliária. Por favor, recarregue a página ou faça login novamente.",
        variant: "destructive"
      });
      return;
    }

    // REMOVIDA a verificação de status aprovado para permitir qualquer imobiliária cadastrar
    
    // Validações básicas
    if (!formData.title || !formData.price || !formData.category_id || !formData.city_id) {
      toast({
        title: "Campos Obrigatórios",
        description: "Título, Preço, Categoria e Cidade são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        condo_fee: formData.condo_fee ? parseFloat(formData.condo_fee) : null, // Usar null se vazio
        iptu: formData.iptu ? parseFloat(formData.iptu) : null, // Usar null se vazio
        area: formData.area ? parseFloat(formData.area) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        parking_spots: formData.parking_spots ? parseInt(formData.parking_spots) : null,
        floor: formData.floor ? formData.floor.toString() : null,
        status: "active" // Novo imóvel entra como ativo por padrão
      };

      console.log("Dados a serem enviados para a API:", propertyData);

      if (property && property.id) {
        await Property.update(property.id, propertyData);
        toast({
          title: "Sucesso",
          description: "Imóvel atualizado com sucesso!"
        });
      } else {
        await Property.create(propertyData);
        toast({
          title: "Sucesso",
          description: "Imóvel cadastrado com sucesso!"
        });
      }

      navigate(createPageUrl("Properties")); // Modificado para ir à lista de imóveis
    } catch (error) {
      console.error("Erro ao salvar imóvel:", error);
      const errorDetails = error.response?.data?.detail || error.message;
      toast({
        title: "Erro ao Salvar",
        description: `Não foi possível salvar o imóvel: ${errorDetails}. Verifique os campos e tente novamente.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <BackButton />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {property ? "Editar Imóvel" : "Novo Imóvel"}
        </h1>

        {isLoading && !categories.length && !cities.length && (
            <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="mt-2 text-gray-600">Carregando dados do formulário...</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título do Anúncio *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Apartamento novo com 3 quartos"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o imóvel detalhadamente"
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length > 0 ? categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      )) : <SelectItem value={null} disabled>Carregando categorias...</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="property_type">Tipo de Negócio *</Label>
                  <Select
                    value={formData.property_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, property_type: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Venda</SelectItem>
                      <SelectItem value="rent">Aluguel</SelectItem>
                      <SelectItem value="temporary">Temporada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Localização */}
          <Card>
            <CardHeader>
              <CardTitle>Localização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <Select
                    value={formData.city_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, city_id: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.length > 0 ? cities.map(city => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      )) : <SelectItem value={null} disabled>Carregando cidades...</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Características */}
          <Card>
            <CardHeader>
              <CardTitle>Características</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="area">Área (m²)</Label>
                  <Input
                    id="area"
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="bedrooms">Quartos</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Banheiros</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="parking_spots">Vagas</Label>
                  <Input
                    id="parking_spots"
                    type="number"
                    value={formData.parking_spots}
                    onChange={(e) => setFormData(prev => ({ ...prev, parking_spots: e.target.value }))}
                  />
                </div>
                 <div>
                  <Label htmlFor="floor">Andar</Label>
                  <Input
                    id="floor"
                    type="text"
                    value={formData.floor}
                    onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valores */}
          <Card>
            <CardHeader>
              <CardTitle>Valores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Valor *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0,00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="condo_fee">Condomínio</Label>
                  <Input
                    id="condo_fee"
                    type="number"
                    value={formData.condo_fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, condo_fee: e.target.value }))}
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <Label htmlFor="iptu">IPTU</Label>
                  <Input
                    id="iptu"
                    type="number"
                    value={formData.iptu}
                    onChange={(e) => setFormData(prev => ({ ...prev, iptu: e.target.value }))}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Imagens */}
          <Card>
            <CardHeader>
              <CardTitle>Imagens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Imagem Principal *</Label>
                <div className="mt-2">
                  {mainImage ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <img 
                        src={mainImage} 
                        alt="Imagem principal" 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeImage(0, 'main')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'main')}
                        className="hidden"
                        id="main-image"
                      />
                      <Label 
                        htmlFor="main-image"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <ImageIcon className="h-8 w-8 mb-2 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Clique para fazer upload da imagem principal
                        </span>
                        {isLoading && formData.main_image_url === "" && <Loader2 className="mt-2 h-5 w-5 animate-spin" />}
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Galeria de Fotos</Label>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {galleryImages.map((image, index) => (
                    <div key={index} className="relative h-32">
                      <img 
                        src={image} 
                        alt={`Foto ${index + 1}`} 
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 p-1 h-auto"
                        onClick={() => removeImage(index, 'gallery')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="border-2 border-dashed rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                          for (const file of e.target.files) {
                              const tempEvent = { target: { files: [file] } };
                              handleImageUpload(tempEvent, 'gallery');
                          }
                      }}
                      className="hidden"
                      id="gallery-image"
                    />
                    <Label 
                      htmlFor="gallery-image"
                      className="cursor-pointer flex flex-col items-center h-full justify-center"
                    >
                      <Plus className="h-8 w-8 mb-2 text-gray-400" />
                      <span className="text-sm text-gray-600 text-center">
                        Adicionar fotos à galeria
                      </span>
                       {isLoading && <Loader2 className="mt-2 h-5 w-5 animate-spin" />}
                    </Label>
                  </div>
                </div>
              </div>

              {realtor && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {realtor.logo_url ? (
                      <img 
                        src={realtor.logo_url} 
                        alt={realtor.company_name}
                        className="w-12 h-12 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <Building2 className="w-12 h-12 text-gray-400 mr-3" />
                    )}
                    <div>
                      <h3 className="font-medium">{realtor.company_name}</h3>
                      {realtor.creci && <p className="text-sm text-gray-500">CRECI: {realtor.creci}</p>}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl("Properties"))}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {property ? "Atualizar Imóvel" : "Cadastrar Imóvel"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
