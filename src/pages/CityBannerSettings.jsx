
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { City } from '@/api/entities';
import { CityBanner } from '@/api/entities';
import { BannerCategory } from '@/api/entities';
import { User } from '@/api/entities';
import { 
  Loader2, Trash2, ExternalLink, 
  ChevronLeft, ImageIcon, RefreshCw,
  Plus, Info, Upload, X, Edit, Maximize, Check
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/use-toast';
import { UploadFile } from "@/api/integrations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CityBannerSettings() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cityBanners, setCityBanners] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Configurações de dimensões do banner
  const [bannerDimensions, setBannerDimensions] = useState({
    width: 300,
    height: 200
  });
  
  const [bannerForm, setBannerForm] = useState({
    title: '',
    category: '',
    link_url: '',
    image_url: '',
    width: 300,
    height: 200
  });

  useEffect(() => {
    checkAccessAndLoadData();
  }, []);

  useEffect(() => {
    if (selectedCityId) {
      loadBanners(selectedCityId);
    }
  }, [selectedCityId]);

  const checkAccessAndLoadData = async () => {
    try {
      const userData = await User.me();
      if (userData.role !== 'admin' && userData.email !== 'contato.jrsn@gmail.com') {
        toast({
          title: "Acesso restrito",
          description: "Você não tem permissão para acessar esta página",
          variant: "destructive"
        });
        navigate(createPageUrl("Public"));
        return;
      }
      
      await Promise.all([
        loadCities(),
        loadCategories()
      ]);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao verificar acesso:", error);
      navigate(createPageUrl("Public"));
    }
  };

  const loadCities = async () => {
    try {
      const citiesData = await City.list();
      setCities(citiesData);
      
      if (citiesData.length > 0) {
        setSelectedCityId(citiesData[0].id);
      }
      
      return citiesData;
    } catch (error) {
      console.error("Erro ao carregar cidades:", error);
      return [];
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await BannerCategory.list();
      setCategories(categoriesData || []);
      return categoriesData;
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      return [];
    }
  };

  const loadBanners = async (cityId) => {
    try {
      if (!cityId) return;
      
      const bannersData = await CityBanner.filter({ city_id: cityId }, '-created_at');
      setCityBanners(bannersData || []);
    } catch (error) {
      console.error("Erro ao carregar banners:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os banners dessa cidade",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBannerForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDimensionsChange = (type, value) => {
    setBannerDimensions(prev => ({
      ...prev,
      [type]: value
    }));
    
    setBannerForm(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setBannerForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleEditBanner = (banner) => {
    setSelectedBanner(banner);
    setBannerForm({
      title: banner.title || '',
      category: banner.category || '',
      link_url: banner.link_url || '',
      image_url: banner.image_url || '',
      width: banner.width || 300,
      height: banner.height || 200
    });
    setBannerDimensions({
      width: banner.width || 300,
      height: banner.height || 200
    });
    setShowEditModal(true);
  };
  
  const handleUpdateBanner = async (e) => {
    e.preventDefault();
    
    if (!selectedBanner) return;
    
    try {
      setIsSaving(true);
      
      let finalImageUrl = bannerForm.image_url;
      
      // Se uma nova imagem foi selecionada
      if (imageFile) {
        setIsUploading(true);
        try {
          const result = await UploadFile({ file: imageFile });
          finalImageUrl = result.file_url;
        } catch (uploadError) {
          console.error("Erro ao fazer upload da imagem:", uploadError);
          toast({
            title: "Erro no upload",
            description: "Não foi possível fazer o upload da imagem. Por favor, tente novamente.",
            variant: "destructive"
          });
          setIsSaving(false);
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }
      
      // Atualizar banner no banco
      await CityBanner.update(selectedBanner.id, {
        title: bannerForm.title,
        category: bannerForm.category,
        link_url: bannerForm.link_url,
        image_url: finalImageUrl,
        width: bannerForm.width,
        height: bannerForm.height
      });
      
      toast({
        title: "Banner atualizado",
        description: "O banner foi editado com sucesso."
      });
      
      setShowEditModal(false);
      setSelectedBanner(null);
      setImageFile(null);
      loadBanners(selectedCityId);
      
    } catch (error) {
      console.error("Erro ao atualizar banner:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o banner. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast({
        title: "Campo vazio",
        description: "Por favor, informe o nome da categoria",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsAddingCategory(true);
      
      const existingCategory = categories.find(
        c => c.name.toLowerCase() === newCategory.toLowerCase()
      );
      
      if (existingCategory) {
        toast({
          title: "Categoria já existe",
          description: "Uma categoria com esse nome já está cadastrada",
          variant: "destructive"
        });
        return;
      }
      
      const newCategoryData = await BannerCategory.create({
        name: newCategory
      });
      
      await loadCategories();
      
      setBannerForm(prev => ({
        ...prev,
        category: newCategoryData.id
      }));
      
      setNewCategory('');
      
      toast({
        title: "Sucesso",
        description: "Categoria adicionada com sucesso"
      });
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a categoria",
        variant: "destructive"
      });
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    
    if (!bannerForm.title || !bannerForm.category || !bannerForm.link_url || (!bannerForm.image_url && !imageFile) || !selectedCityId) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      setIsUploading(true);
      
      let imageUrl = bannerForm.image_url;
      
      // Se uma imagem foi selecionada para upload
      if (imageFile) {
        try {
          const result = await UploadFile({ file: imageFile });
          imageUrl = result.file_url;
        } catch (uploadError) {
          console.error("Erro ao fazer upload da imagem:", uploadError);
          toast({
            title: "Erro no upload",
            description: "Não foi possível fazer o upload da imagem.",
            variant: "destructive"
          });
          setIsSaving(false);
          setIsUploading(false);
          return;
        }
      }
      
      setIsUploading(false);

      const newBanner = await CityBanner.create({
        city_id: selectedCityId,
        category: bannerForm.category,
        title: bannerForm.title,
        image_url: imageUrl,
        link_url: bannerForm.link_url,
        width: bannerForm.width,
        height: bannerForm.height
      });

      toast({
        title: "Banner salvo!",
        description: "O banner foi adicionado com sucesso.",
      });

      setBannerForm({
        city_id: selectedCityId,
        category: "",
        title: "",
        image_url: "",
        link_url: "",
        width: 300,
        height: 200
      });
      
      setImageFile(null);
      await loadBanners(selectedCityId);
      setActiveTab("current");
    } catch (error) {
      console.error("Erro ao salvar banner:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o banner. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!bannerId) return;
    
    if (!confirm("Tem certeza que deseja excluir este banner?")) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      await CityBanner.delete(bannerId);
      
      await loadBanners(selectedCityId);
      
      toast({
        title: "Sucesso",
        description: "Banner excluído com sucesso"
      });
    } catch (error) {
      console.error("Erro ao excluir banner:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o banner",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="ml-2 text-lg text-gray-700">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        onClick={() => navigate(createPageUrl("AdminDashboard"))} 
        variant="ghost" 
        className="mb-6"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Voltar ao painel
      </Button>
      
      <h1 className="text-3xl font-bold mb-2">Banners de Publicidade por Cidade</h1>
      <p className="text-gray-600 mb-8">Gerencie os banners que serão exibidos nas páginas de cidades</p>
      
      <div className="grid gap-8">
        <div>
          <Label htmlFor="city-select">Selecione uma Cidade</Label>
          <Select 
            value={selectedCityId} 
            onValueChange={(value) => setSelectedCityId(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma cidade" />
            </SelectTrigger>
            <SelectContent>
              {cities.map(city => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedCityId && (
          <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-[400px]">
              <TabsTrigger value="current">Banners Atuais</TabsTrigger>
              <TabsTrigger value="add">Adicionar Novo Banner</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Banners Atuais</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => loadBanners(selectedCityId)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Atualizar
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cityBanners.length === 0 ? (
                    <div className="text-center py-8">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum banner</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Comece adicionando um banner para esta cidade.
                      </p>
                      <div className="mt-6">
                        <Button
                          onClick={() => setActiveTab('add')}
                          type="button"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar banner
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {cityBanners.map(banner => (
                        <div key={banner.id} className="py-4 flex items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={banner.image_url} 
                              alt={banner.title} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/100x100/EAEAEA/CCCCCC?text=Imagem';
                              }}
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0 mx-4">
                            <p className="text-sm font-medium truncate">{banner.title}</p>
                            <p className="text-xs text-gray-500">Categoria: {banner.category}</p>
                            <p className="text-xs text-gray-500">
                              Dimensões: {banner.width || 300}x{banner.height || 200}px
                            </p>
                            <a 
                              href={banner.link_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 flex items-center hover:underline"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Link
                            </a>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditBanner(banner)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteBanner(banner.id)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="add" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Novo Banner</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveBanner} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título do Banner*</Label>
                      <Input
                        id="title"
                        name="title"
                        value={bannerForm.title}
                        onChange={handleInputChange}
                        placeholder="Ex: Hotel Praia Azul"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Categoria*</Label>
                      <div className="flex gap-2">
                        <Select 
                          value={bannerForm.category}
                          onValueChange={(value) => handleSelectChange('category', value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => document.getElementById('new-category').focus()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="new-category">Nova Categoria</Label>
                      <div className="flex gap-2">
                        <Input
                          id="new-category"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="Ex: Restaurante, Hotel, Loja"
                        />
                        <Button
                          type="button"
                          onClick={handleAddCategory}
                          disabled={isAddingCategory || !newCategory.trim()}
                        >
                          {isAddingCategory ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Adicionar"
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="link_url">URL de Destino*</Label>
                      <Input
                        id="link_url"
                        name="link_url"
                        value={bannerForm.link_url}
                        onChange={handleInputChange}
                        placeholder="https://www.exemplo.com.br"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="image_upload">Imagem do Banner*</Label>
                      <Input
                        id="image_upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="mb-2"
                      />
                      
                      {!imageFile && (
                        <div>
                          <Label htmlFor="image_url">Ou URL da Imagem</Label>
                          <Input
                            id="image_url"
                            name="image_url"
                            placeholder="https://exemplo.com/imagem.jpg"
                            value={bannerForm.image_url}
                            onChange={handleInputChange}
                            className="mb-2"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Largura (px): {bannerDimensions.width}</Label>
                          <span className="text-sm text-gray-500">300px recomendado</span>
                        </div>
                        <Slider
                          defaultValue={[bannerDimensions.width]}
                          min={100}
                          max={800}
                          step={10}
                          onValueChange={(value) => handleDimensionsChange('width', value[0])}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Altura (px): {bannerDimensions.height}</Label>
                          <span className="text-sm text-gray-500">200px recomendado</span>
                        </div>
                        <Slider
                          defaultValue={[bannerDimensions.height]}
                          min={100}
                          max={600}
                          step={10}
                          onValueChange={(value) => handleDimensionsChange('height', value[0])}
                        />
                      </div>
                    </div>
                    
                    <Alert variant="info" className="mt-4">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Dica para imagens</AlertTitle>
                      <AlertDescription>
                        Use imagens com a proporção correta para melhor visualização. Tamanho recomendado: 300x200px.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex justify-end gap-2 mt-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setActiveTab('current')}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={isSaving || isUploading}
                      >
                        {(isSaving || isUploading) ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isUploading ? "Enviando..." : "Salvando..."}
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Banner
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      {/* Modal de Edição */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Banner</DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias e clique em salvar.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateBanner} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                name="title"
                value={bannerForm.title}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-category">Categoria</Label>
              <Select 
                value={bannerForm.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-link">URL de Destino</Label>
              <Input
                id="edit-link"
                name="link_url"
                value={bannerForm.link_url}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-image">Nova Imagem (opcional)</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
              />
              
              {selectedBanner?.image_url && !imageFile && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Imagem atual:</p>
                  <div className="relative w-32 h-32 bg-gray-100 rounded overflow-hidden">
                    <img 
                      src={selectedBanner.image_url} 
                      alt="Imagem atual" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
              
              {imageFile && (
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Check className="h-4 w-4 text-green-500 mr-1" />
                  Nova imagem selecionada
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Largura (px): {bannerDimensions.width}</Label>
                </div>
                <Slider
                  defaultValue={[bannerDimensions.width]}
                  min={100}
                  max={800}
                  step={10}
                  onValueChange={(value) => handleDimensionsChange('width', value[0])}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Altura (px): {bannerDimensions.height}</Label>
                </div>
                <Slider
                  defaultValue={[bannerDimensions.height]}
                  min={100}
                  max={600}
                  step={10}
                  onValueChange={(value) => handleDimensionsChange('height', value[0])}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSaving || isUploading}
              >
                {(isSaving || isUploading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploading ? "Enviando..." : "Salvando..."}
                  </>
                ) : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
