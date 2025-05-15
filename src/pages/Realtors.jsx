
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Realtor } from "@/api/entities";
import { City } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  Loader2,
  CreditCard,
  Pencil,
  Trash2,
  Plus
} from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { User } from "@/api/entities";

export default function Realtors() {
  const [realtors, setRealtors] = useState([]);
  const [cities, setCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Garante que apenas admin possa carregar todos os corretores
      const user = await User.me();
      if (user.role !== 'admin') {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para ver esta página.",
          variant: "destructive"
        });
        navigate(createPageUrl("Public")); // Ou para o dashboard do corretor
        return;
      }

      const [realtorsData, citiesData] = await Promise.all([
        Realtor.list('-created_date'), // Ordenar por mais recentes pode ajudar a ver os pendentes
        City.list()
      ]);
      
      setRealtors(realtorsData || []);
      setCities(citiesData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as imobiliárias",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await Realtor.update(id, { status: "approved" });
      toast({
        title: "Sucesso",
        description: "Imobiliária aprovada com sucesso",
      });
      loadData();
    } catch (error) {
      console.error("Erro ao aprovar imobiliária:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar a imobiliária",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (id) => {
    try {
      await Realtor.update(id, { status: "rejected" });
      toast({
        title: "Sucesso",
        description: "Imobiliária rejeitada com sucesso",
      });
      loadData();
    } catch (error) {
      console.error("Erro ao rejeitar imobiliária:", error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a imobiliária",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (id) => {
    navigate(createPageUrl(`RealtorDetail?id=${id}`));
  };

  const getCityName = (cityId) => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : "N/A";
  };

  const getStatusBadge = (realtor) => {
    // A prioridade é o status do perfil da imobiliária (pending, approved, rejected)
    // O status da assinatura é secundário para a aprovação do perfil
    switch(realtor.status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 border border-green-300">Aprovado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-300">Pendente</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 border border-red-300">Rejeitado</Badge>;
      default:
        // Se não tiver status, considera como pendente por segurança
        return <Badge className="bg-gray-100 text-gray-700 border border-gray-300">Pendente (Status Desconhecido)</Badge>;
    }
  };

  const getSubscriptionBadge = (status) => {
    switch(status) {
      case "active":
        return <Badge className="bg-green-500">Ativo</Badge>;
      case "trial":
        return <Badge className="bg-blue-500">Teste</Badge>;
      case "expired":
        return <Badge className="bg-red-500">Expirado</Badge>;
      default:
        return <Badge className="bg-gray-500">Sem plano</Badge>;
    }
  };

  const filteredRealtors = realtors
    .filter(realtor => 
      (statusFilter === "all" || realtor.status === statusFilter) &&
      (searchTerm === "" || 
        realtor.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        realtor.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDelete = async (id) => {
      if (!confirm("Tem certeza que deseja excluir esta imobiliária? Esta ação não pode ser desfeita.")) {
        return;
      }
      
      try {
        await Realtor.delete(id);
        toast({
          title: "Sucesso",
          description: "Imobiliária excluída com sucesso",
        });
        loadData();
      } catch (error) {
        console.error("Erro ao excluir imobiliária:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir a imobiliária",
          variant: "destructive"
        });
      }
    };
  
    const handleEdit = (id) => {
      navigate(createPageUrl(`RealtorDetail?id=${id}&tab=details`));
    };
  
    const handleManageSubscription = (id) => {
      navigate(createPageUrl(`RealtorDetail?id=${id}&tab=subscription`));
    };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BackButton pageName="Dashboard" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Building2 className="mr-3 h-8 w-8 text-blue-600" />
          Gerenciamento de Imobiliárias
        </h1>
        
        <Button 
          onClick={() => navigate(createPageUrl("RealtorCreate"))}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Imobiliária
        </Button>
      </div>
      
      <Card className="mb-6 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="w-full md:w-auto flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Buscar por nome, email ou CRECI..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="status-filter" className="text-sm font-medium">Status:</Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger id="status-filter" className="w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" /> Pendentes
                    </div>
                  </SelectItem>
                  <SelectItem value="approved">
                    <div className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Aprovados
                    </div>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <div className="flex items-center">
                      <XCircle className="mr-2 h-4 w-4 text-red-500" /> Rejeitados
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="ml-3 text-lg text-gray-600">Carregando imobiliárias...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Nome da Imobiliária</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>CRECI</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-[300px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRealtors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Nenhuma imobiliária encontrada.</p>
                    {statusFilter !== "all" && <p className="text-sm text-gray-400 mt-1">Tente remover o filtro de status.</p>}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRealtors.map((realtor) => (
                  <TableRow key={realtor.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium py-3">
                      <div className="flex items-center">
                        {realtor.logo_url ? (
                          <img src={realtor.logo_url} alt="Logo" className="h-8 w-8 rounded-full mr-3 object-cover"/>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                            <Building2 className="h-4 w-4" />
                          </div>
                        )}
                        {realtor.company_name}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                        <span>{realtor.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                        <span>{realtor.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                        {getCityName(realtor.city_id)}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">{realtor.creci || "N/A"}</TableCell>
                    <TableCell className="py-3">{getStatusBadge(realtor)}</TableCell>
                    <TableCell className="text-right py-3">
                      <div className="flex justify-end items-center gap-2">
                        {realtor.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-500 hover:bg-red-100 hover:text-red-600"
                              onClick={() => handleReject(realtor.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                              onClick={() => handleApprove(realtor.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                          </>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleManageSubscription(realtor.id)}
                          title="Gerenciar Assinatura"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(realtor.id)}
                          title="Editar Detalhes"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-500 text-red-500 hover:bg-red-100 hover:text-red-600"
                          onClick={() => handleDelete(realtor.id)}
                          title="Excluir Imobiliária"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleViewDetails(realtor.id)}
                        >
                          Detalhes
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
