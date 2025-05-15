
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Business } from "@/api/entities";
import { City } from "@/api/entities";
import { Beach } from "@/api/entities";
import { User } from "@/api/entities";
import { BusinessCredential } from "@/api/entities";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { UploadFile } from "@/api/integrations";
import { 
  ArrowLeft, 
  Loader2, 
  Upload,
  Store,
  Image,
  ClipboardList,
  CreditCard
} from "lucide-react";

export default function EditBusiness() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [business, setBusiness] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [cities, setCities] = useState([]);
  const [beaches, setBeaches] = useState([]);
  const [activeTab, setActiveTab] = useState("informacoes");
  
  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "",
    business_email: "",
    business_phone: "",
    city_id: "",
    beach_id: "",
    description: "",
    address: "",
    website: "",
    opening_hours: "",
    image_url: "",
    gallery: [],
    is_club_member: false,
    discount_type: "percentual",
    discount_value: 0,
    discount_description: ""
  });

  const [types] = useState([
    "restaurante", 
    "hotel", 
    "pousada", 
    "loja", 
    "bar", 
    "cafe",
    "outros"
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 1. Verificar autenticação
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) {
          navigate(createPageUrl("UserAccount"));
          return;
        }
        
        const userData = JSON.parse(currentUserStr);
        setCurrentUser(userData);
        
        // 2. Carregar cidades para o formulário
        const citiesData = await City.list();
        setCities(citiesData || []);

        // 3. Tentar carregar negócio existente
        if (userData.business_id) {
          try {
            const businessData = await Business.get(userData.business_id);
            if (businessData) {
              console.log("Negócio encontrado:", businessData);
              setBusiness(businessData);
              populateFormData(businessData);
              
              // Carregar praias se houver cidade selecionada
              if (businessData.city_id) {
                await loadBeaches(businessData.city_id);
              }
              return;
            }
          } catch (error) {
            console.error("Erro ao buscar negócio:", error);
          }
        }

        // 4. Tentar buscar por credenciais
        try {
          const credentials = await BusinessCredential.filter({
            email: userData.email
          });

          if (credentials && credentials.length > 0) {
            const businessData = await Business.get(credentials[0].business_id);
            if (businessData) {
              setBusiness(businessData);
              populateFormData(businessData);
              
              // Atualizar o ID do negócio no usuário para facilitar futuras consultas
              const updatedUser = { ...userData, business_id: businessData.id };
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
              setCurrentUser(updatedUser);
              return;
            }
          }
        } catch (error) {
          console.error("Erro ao buscar credenciais:", error);
        }

        // Se chegou aqui, é um novo cadastro
        console.log("Novo cadastro de negócio");

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar os dados. Por favor, tente novamente.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Modificada para extrair corretamente os dados do clube de membros
  const populateFormData = (businessData) => {
    // Valores básicos
    const formValues = {
      business_name: businessData.business_name || "",
      business_type: businessData.business_type || "",
      business_email: businessData.business_email || "",
      business_phone: businessData.business_phone || "",
      city_id: businessData.city_id || "",
      beach_id: businessData.beach_id || "",
      description: businessData.description || "",
      address: businessData.address || "",
      website: businessData.website || "",
      opening_hours: businessData.opening_hours || "",
      image_url: businessData.image_url || "",
      gallery: businessData.gallery || [],
      // Valores padrão para clube
      is_club_member: false,
      discount_type: "percentual",
      discount_value: 0,
      discount_description: ""
    };
    
    // Se tiver configurações de clube, sobrescrever os valores padrão
    if (businessData.club_settings) {
      formValues.is_club_member = businessData.club_settings.is_member || false;
      formValues.discount_type = businessData.club_settings.discount_type || "percentual";
      formValues.discount_value = businessData.club_settings.discount_value || 0;
      formValues.discount_description = businessData.club_settings.discount_description || "";
    }
    
    setFormData(formValues);
  };

  const loadBeaches = async (cityId) => {
    if (!cityId) {
      setBeaches([]);
      return;
    }
    
    try {
      const beachesData = await Beach.filter({ city_id: cityId });
      setBeaches(beachesData || []);
    } catch (error) {
      console.error("Erro ao carregar praias:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as praias desta cidade.",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      
      // Validar tamanho e tipo do arquivo
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Erro",
          description: "O arquivo deve ser uma imagem",
          variant: "destructive"
        });
        return;
      }

      const { file_url } = await UploadFile({ file });
      
      if (!file_url) {
        throw new Error("URL da imagem não retornada");
      }

      // Atualizar o estado e o negócio imediatamente
      setFormData(prev => ({
        ...prev,
        image_url: file_url
      }));

      // Se já existe um ID do negócio, atualizar diretamente
      if (business?.id) {
        await Business.update(business.id, {
          image_url: file_url
        });

        toast({
          title: "Sucesso",
          description: "Imagem atualizada com sucesso"
        });
      }

    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload da imagem",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "city_id") {
      loadBeaches(value);
      setFormData(prev => ({ ...prev, beach_id: "" }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      // Validar campos obrigatórios
      const requiredFields = ["business_name", "business_type", "business_email", "city_id"];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos obrigatórios",
          variant: "destructive"
        });
        return;
      }

      // Preparar dados para envio
      const dataToSave = { ...formData };
      
      // Remover propriedades específicas do clube que não fazem parte da entidade Business
      delete dataToSave.is_club_member;
      delete dataToSave.discount_type;
      delete dataToSave.discount_value;
      delete dataToSave.discount_description;
      
      // Configurar o clube de descontos separadamente
      dataToSave.club_settings = {
        is_member: formData.is_club_member || false
      };
      
      if (formData.is_club_member) {
        dataToSave.club_settings.discount_type = formData.discount_type || "percentual";
        dataToSave.club_settings.discount_value = parseFloat(formData.discount_value) || 0;
        dataToSave.club_settings.discount_description = formData.discount_description || "";
      }

      console.log("Dados a serem salvos:", dataToSave);

      let result;
      
      if (business?.id) {
        // Atualizar negócio existente
        result = await Business.update(business.id, dataToSave);
      } else {
        // Criar novo negócio
        result = await Business.create(dataToSave);
      }

      if (result) {
        // Atualizar o ID do negócio no usuário atual
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const currentUser = JSON.parse(currentUserStr);
          currentUser.business_id = result.id;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }

        toast({
          title: "Sucesso",
          description: business?.id ? "Negócio atualizado com sucesso" : "Negócio criado com sucesso"
        });

        navigate(createPageUrl("BusinessProfile"));
      }
    } catch (error) {
      console.error("Erro ao salvar negócio:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o negócio",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-600 mb-6 flex items-center hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </button>
        
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          {business ? "Editar Informações do Comércio" : "Cadastrar Novo Comércio"}
        </h1>
        
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2">Carregando...</span>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <form onSubmit={handleSubmit}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 h-auto">
                  <TabsTrigger value="informacoes" className="py-3">
                    <Store className="w-4 h-4 mr-2" />
                    Informações Básicas
                  </TabsTrigger>
                  <TabsTrigger value="imagens" className="py-3">
                    <Image className="w-4 h-4 mr-2" />
                    Imagens
                  </TabsTrigger>
                  <TabsTrigger value="produtos" className="py-3">
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Produtos/Serviços
                  </TabsTrigger>
                  <TabsTrigger value="clube" className="py-3">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Clube de Descontos
                  </TabsTrigger>
                </TabsList>
                
                <div className="p-6">
                  <TabsContent value="informacoes" className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="business_name">Nome do Comércio *</Label>
                        <Input
                          id="business_name"
                          name="business_name"
                          value={formData.business_name}
                          onChange={handleInputChange}
                          placeholder="Ex: Restaurante Mar e Sol"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="business_type">Tipo de Comércio *</Label>
                        <Select
                          value={formData.business_type}
                          onValueChange={(value) => handleSelectChange("business_type", value)}
                        >
                          <SelectTrigger id="business_type">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {types.map(type => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição do Comércio</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Descreva seu estabelecimento..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city_id">Cidade *</Label>
                        <Select
                          value={formData.city_id}
                          onValueChange={(value) => handleSelectChange("city_id", value)}
                        >
                          <SelectTrigger id="city_id">
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
                      
                      <div className="space-y-2">
                        <Label htmlFor="beach_id">Praia (opcional)</Label>
                        <Select
                          value={formData.beach_id || ""}
                          onValueChange={(value) => handleSelectChange("beach_id", value)}
                          disabled={!formData.city_id || beaches.length === 0}
                        >
                          <SelectTrigger id="beach_id">
                            <SelectValue placeholder={
                              !formData.city_id 
                                ? "Selecione uma cidade primeiro" 
                                : beaches.length === 0 
                                  ? "Sem praias disponíveis" 
                                  : "Selecione uma praia"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {beaches.map(beach => (
                              <SelectItem key={beach.id} value={beach.id}>
                                {beach.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço *</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Rua, número, bairro"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="business_phone">Telefone *</Label>
                        <Input
                          id="business_phone"
                          name="business_phone"
                          value={formData.business_phone}
                          onChange={handleInputChange}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="business_email">Email</Label>
                        <Input
                          id="business_email"
                          name="business_email"
                          type="email"
                          value={formData.business_email}
                          onChange={handleInputChange}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          placeholder="www.seuwebsite.com"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="opening_hours">Horário de Funcionamento</Label>
                        <Input
                          id="opening_hours"
                          name="opening_hours"
                          value={formData.opening_hours}
                          onChange={handleInputChange}
                          placeholder="Seg-Sex: 9h às 18h, Sáb: 9h às 13h"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="imagens" className="space-y-6 mt-0">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Imagem Principal</h3>
                      
                      <div className="flex flex-col space-y-2">
                        {formData.image_url ? (
                          <div className="relative h-48 rounded-md overflow-hidden mb-2">
                            <img
                              src={formData.image_url}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x200?text=Imagem+não+disponível';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="h-48 bg-gray-100 rounded-md flex items-center justify-center mb-2">
                            <p className="text-gray-500">Nenhuma imagem selecionada</p>
                          </div>
                        )}
                        
                        <div className="flex">
                          <input
                            type="file"
                            id="image_upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('image_upload').click()}
                            disabled={uploadingImage}
                            className="w-full"
                          >
                            {uploadingImage ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                {formData.image_url ? "Trocar Imagem" : "Enviar Imagem"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-4 bg-gray-50 p-4 rounded-md">
                        <p className="text-sm text-gray-600">
                          Adicione uma imagem principal para seu negócio. Recomendamos o tamanho de 1200x800 pixels.
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Para gerenciar mais imagens na galeria, use a página "Galeria" após salvar seu negócio.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="produtos" className="space-y-6 mt-0">
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium mb-2">Gerenciamento de Produtos</h3>
                      <p className="text-gray-600 mb-4">
                        Você pode adicionar e gerenciar seus produtos/serviços na área dedicada após salvar as informações básicas do seu negócio.
                      </p>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (business) {
                            navigate(createPageUrl("BusinessProducts"));
                          } else {
                            toast({
                              title: "Salve o negócio primeiro",
                              description: "É necessário salvar as informações básicas antes de gerenciar produtos.",
                              variant: "default"
                            });
                            setActiveTab("informacoes");
                          }
                        }}
                      >
                        {business ? "Gerenciar Produtos/Serviços" : "Salve as informações primeiro"}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="clube" className="space-y-6 mt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium">Clube de Assinantes</h3>
                        <p className="text-sm text-gray-600">
                          Ofereça descontos exclusivos para membros do clube.
                        </p>
                      </div>
                      <Switch
                        checked={formData.is_club_member}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_club_member: checked }))}
                      />
                    </div>
                    
                    {formData.is_club_member && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="discount_type">Tipo de Desconto</Label>
                            <Select
                              value={formData.discount_type || "percentual"}
                              onValueChange={(value) => handleSelectChange("discount_type", value)}
                            >
                              <SelectTrigger id="discount_type">
                                <SelectValue placeholder="Selecione o tipo de desconto" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentual">Percentual (%)</SelectItem>
                                <SelectItem value="fixo">Valor Fixo (R$)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="discount_value">
                              {formData.discount_type === "percentual" ? "Percentual de Desconto (%)" : "Valor do Desconto (R$)"}
                            </Label>
                            <Input
                              type="number"
                              id="discount_value"
                              name="discount_value"
                              value={formData.discount_value || ""}
                              onChange={handleInputChange}
                              placeholder="10"
                              min="0"
                              step={formData.discount_type === "percentual" ? "1" : "0.01"}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="discount_description">Descrição do Desconto</Label>
                          <Textarea
                            id="discount_description"
                            name="discount_description"
                            value={formData.discount_description}
                            onChange={handleInputChange}
                            placeholder="Ex: 10% de desconto em todos os produtos exceto bebidas alcoólicas"
                            rows={2}
                          />
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
              
              <div className="p-6 bg-gray-50 flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Informações"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
