
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadFile } from "@/api/integrations";
import { Loader2, Upload, Save, Waves, Check, Image, RefreshCw } from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import MembershipCard from "../components/tourists/MembershipCard";
import { format } from "date-fns";

export default function CardSettings() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("cartao");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  
  const [settings, setSettings] = useState({
    membership_card_bg_url: "",
    membership_logo_url: ""
  });

  const [previewTourist] = useState({
    id: "preview",
    subscription_date: format(new Date(), "yyyy-MM-dd")
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      setSettings({
        membership_card_bg_url: userData.membership_card_bg_url || "",
        membership_logo_url: userData.membership_logo_url || ""
      });
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    }
    setIsLoading(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingLogo(true);
    try {
      const { file_url } = await UploadFile({ file });
      setSettings(prev => ({ ...prev, membership_logo_url: file_url }));
    } catch (error) {
      console.error("Erro ao fazer upload da logo:", error);
    }
    setUploadingLogo(false);
  };

  const handleBackgroundUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingBackground(true);
    try {
      const { file_url } = await UploadFile({ file });
      setSettings(prev => ({ ...prev, membership_card_bg_url: file_url }));
    } catch (error) {
      console.error("Erro ao fazer upload do background:", error);
    }
    setUploadingBackground(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await User.updateMyUserData(settings);
      await loadUserData();
      
      const successMessage = document.getElementById("success-message");
      successMessage.classList.remove("opacity-0");
      setTimeout(() => {
        successMessage.classList.add("opacity-0");
      }, 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
    }
    
    setIsSaving(false);
  };

  const resetToDefaults = () => {
    setSettings({
      membership_card_bg_url: "",
      membership_logo_url: ""
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p className="text-gray-500">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <BackButton />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Configurações do Cartão</h1>
          <div className="transition-opacity duration-300 opacity-0" id="success-message">
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-md">
              <Check className="w-5 h-5" />
              <span>Configurações salvas com sucesso!</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personalização do Cartão de Membro</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="cartao" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="cartao">Visualização do Cartão</TabsTrigger>
                    <TabsTrigger value="config">Configurações</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="cartao" className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                      <h3 className="text-blue-800 font-medium flex items-center">
                        <Waves className="w-5 h-5 mr-2" />
                        Seu Cartão do Clube Praias Catarinenses
                      </h3>
                      <p className="text-blue-700 text-sm mt-1">
                        Este cartão é válido em todas as praias de Santa Catarina e dá acesso aos descontos exclusivos para membros do clube.
                      </p>
                    </div>
                  
                    <div className="max-w-md mx-auto">
                      <MembershipCard 
                        tourist={previewTourist}
                        user={user}
                        onClose={() => {}}
                        preview={true}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="config">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="flex items-center">
                            <Image className="w-4 h-4 mr-2" />
                            Logo do Cartão
                          </Label>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div className="col-span-2">
                              <Input
                                name="membership_logo_url"
                                value={settings.membership_logo_url}
                                onChange={handleInputChange}
                                placeholder="URL da imagem da logo"
                              />
                            </div>
                            
                            <div>
                              <div className="relative">
                                <input 
                                  type="file" 
                                  id="logo-upload" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={handleLogoUpload}
                                  disabled={uploadingLogo}
                                />
                                <label 
                                  htmlFor="logo-upload" 
                                  className="w-full flex justify-center items-center py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md cursor-pointer"
                                >
                                  {uploadingLogo ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    <Upload className="w-4 h-4 mr-2" />
                                  )}
                                  Upload Logo
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          {settings.membership_logo_url && (
                            <div className="mt-2 p-4 bg-gray-50 rounded-md">
                              <div className="aspect-[3/1] relative overflow-hidden rounded-md">
                                <img 
                                  src={settings.membership_logo_url} 
                                  alt="Logo Preview" 
                                  className="w-full h-full object-contain"
                                  onError={(e) => e.target.src = "https://via.placeholder.com/300x100?text=Logo+não+encontrada"}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2 pt-4">
                          <Label className="flex items-center">
                            <Image className="w-4 h-4 mr-2" />
                            Background do Cartão
                          </Label>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div className="col-span-2">
                              <Input
                                name="membership_card_bg_url"
                                value={settings.membership_card_bg_url}
                                onChange={handleInputChange}
                                placeholder="URL da imagem de fundo do cartão"
                              />
                            </div>
                            
                            <div>
                              <div className="relative">
                                <input 
                                  type="file" 
                                  id="bg-upload" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={handleBackgroundUpload}
                                  disabled={uploadingBackground}
                                />
                                <label 
                                  htmlFor="bg-upload" 
                                  className="w-full flex justify-center items-center py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md cursor-pointer"
                                >
                                  {uploadingBackground ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    <Upload className="w-4 h-4 mr-2" />
                                  )}
                                  Upload Background
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          {settings.membership_card_bg_url && (
                            <div className="mt-2 p-4 bg-gray-50 rounded-md">
                              <div className="aspect-video relative overflow-hidden rounded-md">
                                <img 
                                  src={settings.membership_card_bg_url} 
                                  alt="Background Preview" 
                                  className="w-full h-full object-cover"
                                  onError={(e) => e.target.src = "https://via.placeholder.com/600x400?text=Background+não+encontrado"}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={resetToDefaults}
                          className="flex items-center"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Restaurar Padrões
                        </Button>
                        
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setActiveTab("cartao")}
                          >
                            Visualizar Cartão
                          </Button>
                          
                          <Button 
                            type="submit" 
                            disabled={isSaving || uploadingLogo || uploadingBackground}
                            className="flex items-center"
                          >
                            {isSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            Salvar Configurações
                          </Button>
                        </div>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-md">
                  <h3 className="text-orange-800 font-medium">Dicas para as imagens</h3>
                  <ul className="mt-2 space-y-2 text-sm text-orange-700">
                    <li>• Logo: use uma imagem com fundo transparente (PNG)</li>
                    <li>• Logo: tamanho recomendado de 300x100 pixels</li>
                    <li>• Background: use imagens de praias de Santa Catarina</li>
                    <li>• Background: tamanho recomendado de 800x400 pixels</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-md">
                  <h3 className="text-blue-800 font-medium">Validade do Cartão</h3>
                  <p className="mt-2 text-sm text-blue-700">
                    Seu cartão do Clube Praias Catarinenses é válido em todas as praias de Santa Catarina e pode ser apresentado em qualquer estabelecimento parceiro para obter descontos exclusivos.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-md">
                  <h3 className="text-green-800 font-medium">Formas de Uso</h3>
                  <p className="mt-2 text-sm text-green-700">
                    Apresente o seu cartão digital pelo celular ou faça um print da tela para usar offline quando necessário.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
