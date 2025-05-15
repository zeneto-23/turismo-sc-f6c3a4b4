
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Property } from "@/api/entities";
import { PropertyCategory } from "@/api/entities";
import { City } from "@/api/entities";
import { Realtor } from "@/api/entities";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PropertyCard from "@/components/properties/PropertyCard";
import { Card, CardContent } from "@/components/ui/card";
import {
  Home,
  Search,
  MapPin,
  Filter,
  ChevronDown,
  Check,
  RefreshCw,
  Bed,
  Bath,
  Car,
  Square,
  Building2,
  DollarSign,
  SlidersHorizontal,
  ArrowUpDown
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function PublicProperties() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [realtors, setRealtors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [bedroomsFilter, setBedroomsFilter] = useState("all");
  const [bathroomsFilter, setBathroomsFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [
    properties, 
    searchTerm, 
    selectedCity, 
    selectedCategory, 
    selectedType, 
    priceRange, 
    bedroomsFilter, 
    bathroomsFilter,
    sortBy
  ]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [propertiesData, categoriesData, citiesData, realtorsData] = await Promise.all([
        Property.list(),
        PropertyCategory.list(),
        City.list(),
        Realtor.list()
      ]);
      
      // Only show active properties with images in public view
      const activeProperties = propertiesData?.filter(p => 
        p.status === "active" && p.main_image_url
      ) || [];
      
      setProperties(activeProperties);
      setFilteredProperties(activeProperties);
      setCategories(categoriesData || []);
      setCities(citiesData || []);
      setRealtors(realtorsData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProperties = () => {
    let results = [...properties];
    
    // Text search
    if (searchTerm) {
      results = results.filter(property => 
        property.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        property.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // City filter
    if (selectedCity !== "all") {
      results = results.filter(property => property.city_id === selectedCity);
    }
    
    // Category filter
    if (selectedCategory !== "all") {
      results = results.filter(property => property.category_id === selectedCategory);
    }
    
    // Property type filter
    if (selectedType !== "all") {
      results = results.filter(property => property.property_type === selectedType);
    }
    
    // Price range filter
    if (priceRange.min) {
      results = results.filter(property => 
        property.price >= parseFloat(priceRange.min)
      );
    }
    
    if (priceRange.max) {
      results = results.filter(property => 
        property.price <= parseFloat(priceRange.max)
      );
    }
    
    // Bedrooms filter
    if (bedroomsFilter !== "all") {
      if (bedroomsFilter === "4+") {
        results = results.filter(property => property.bedrooms >= 4);
      } else {
        results = results.filter(property => 
          property.bedrooms === parseInt(bedroomsFilter)
        );
      }
    }
    
    // Bathrooms filter
    if (bathroomsFilter !== "all") {
      if (bathroomsFilter === "3+") {
        results = results.filter(property => property.bathrooms >= 3);
      } else {
        results = results.filter(property => 
          property.bathrooms === parseInt(bathroomsFilter)
        );
      }
    }
    
    // Sorting
    switch(sortBy) {
      case "price_asc":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        results.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        results.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
      case "oldest":
        results.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        break;
      default:
        break;
    }
    
    setFilteredProperties(results);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "";
  };

  const getCityName = (cityId) => {
    const city = cities.find(city => city.id === cityId);
    return city?.name || "";
  };

  const getRealtorName = (realtorId) => {
    const realtor = realtors.find(r => r.id === realtorId);
    return realtor?.company_name || "Imobiliária não informada";
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCity("all");
    setSelectedCategory("all");
    setSelectedType("all");
    setPriceRange({ min: "", max: "" });
    setBedroomsFilter("all");
    setBathroomsFilter("all");
    setSortBy("newest");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[50vh]">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600" />
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      <section className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Substituir o breadcrumb por uma navegação simples */}
          <div className="mb-4 text-sm">
            <Link to={createPageUrl("Public")} className="text-white opacity-75 hover:opacity-100">
              Home
            </Link>
            {" > "}
            <span className="text-white">Imóveis</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Encontre o imóvel dos seus sonhos</h1>
          <p className="text-lg opacity-90 max-w-3xl">
            Explore nossa seleção de imóveis em Santa Catarina para compra, venda ou aluguel
          </p>
          
          <div className="bg-white rounded-lg shadow-lg mt-8 p-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-10 h-12"
                  placeholder="Busque por localização, título, etc..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Todas as cidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as cidades</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Select value={selectedType} onValueChange={setSelectedType} className="flex-1">
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="sale">Venda</SelectItem>
                    <SelectItem value="rent">Aluguel</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button className="h-12 w-12 p-0" onClick={resetFilters} title="Resetar filtros">
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow p-6 mb-6 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Filtros</h3>
                  <Button variant="ghost" size="sm" onClick={resetFilters} title="Limpar filtros">
                    Limpar
                  </Button>
                </div>
                
                <Accordion type="single" collapsible defaultValue="category">
                  <AccordionItem value="category">
                    <AccordionTrigger>Categoria</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div 
                          className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 ${selectedCategory === "all" ? "bg-blue-50 text-blue-600" : ""}`}
                          onClick={() => setSelectedCategory("all")}
                        >
                          <Check className={`mr-2 h-4 w-4 ${selectedCategory === "all" ? "opacity-100" : "opacity-0"}`} />
                          <span>Todas categorias</span>
                        </div>
                        {categories.map(category => (
                          <div 
                            key={category.id}
                            className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 ${selectedCategory === category.id ? "bg-blue-50 text-blue-600" : ""}`}
                            onClick={() => setSelectedCategory(category.id)}
                          >
                            <Check className={`mr-2 h-4 w-4 ${selectedCategory === category.id ? "opacity-100" : "opacity-0"}`} />
                            <span>{category.name}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="price">
                    <AccordionTrigger>Preço</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <label className="text-sm text-gray-600">Valor mínimo</label>
                        <Input
                          placeholder="R$ Min"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                          type="number"
                        />
                        
                        <label className="text-sm text-gray-600">Valor máximo</label>
                        <Input
                          placeholder="R$ Máx"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                          type="number"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="features">
                    <AccordionTrigger>Características</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <label className="text-sm text-gray-600">Quartos</label>
                        <div className="flex flex-wrap gap-2">
                          <Badge 
                            onClick={() => setBedroomsFilter("all")}
                            className={`cursor-pointer ${bedroomsFilter === "all" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                          >
                            Todos
                          </Badge>
                          <Badge 
                            onClick={() => setBedroomsFilter("1")}
                            className={`cursor-pointer ${bedroomsFilter === "1" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                          >
                            1
                          </Badge>
                          <Badge 
                            onClick={() => setBedroomsFilter("2")}
                            className={`cursor-pointer ${bedroomsFilter === "2" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                          >
                            2
                          </Badge>
                          <Badge 
                            onClick={() => setBedroomsFilter("3")}
                            className={`cursor-pointer ${bedroomsFilter === "3" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                          >
                            3
                          </Badge>
                          <Badge 
                            onClick={() => setBedroomsFilter("4+")}
                            className={`cursor-pointer ${bedroomsFilter === "4+" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                          >
                            4+
                          </Badge>
                        </div>
                        
                        <label className="text-sm text-gray-600">Banheiros</label>
                        <div className="flex flex-wrap gap-2">
                          <Badge 
                            onClick={() => setBathroomsFilter("all")}
                            className={`cursor-pointer ${bathroomsFilter === "all" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                          >
                            Todos
                          </Badge>
                          <Badge 
                            onClick={() => setBathroomsFilter("1")}
                            className={`cursor-pointer ${bathroomsFilter === "1" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                          >
                            1
                          </Badge>
                          <Badge 
                            onClick={() => setBathroomsFilter("2")}
                            className={`cursor-pointer ${bathroomsFilter === "2" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                          >
                            2
                          </Badge>
                          <Badge 
                            onClick={() => setBathroomsFilter("3+")}
                            className={`cursor-pointer ${bathroomsFilter === "3+" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                          >
                            3+
                          </Badge>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
            
            {/* Mobile Filters */}
            <div className="lg:hidden mb-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      Ordenar
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56">
                    <div className="space-y-2">
                      <div 
                        className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 ${sortBy === "newest" ? "bg-blue-50 text-blue-600" : ""}`}
                        onClick={() => setSortBy("newest")}
                      >
                        <Check className={`mr-2 h-4 w-4 ${sortBy === "newest" ? "opacity-100" : "opacity-0"}`} />
                        <span>Mais recentes</span>
                      </div>
                      <div 
                        className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 ${sortBy === "oldest" ? "bg-blue-50 text-blue-600" : ""}`}
                        onClick={() => setSortBy("oldest")}
                      >
                        <Check className={`mr-2 h-4 w-4 ${sortBy === "oldest" ? "opacity-100" : "opacity-0"}`} />
                        <span>Mais antigos</span>
                      </div>
                      <div 
                        className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 ${sortBy === "price_asc" ? "bg-blue-50 text-blue-600" : ""}`}
                        onClick={() => setSortBy("price_asc")}
                      >
                        <Check className={`mr-2 h-4 w-4 ${sortBy === "price_asc" ? "opacity-100" : "opacity-0"}`} />
                        <span>Menor preço</span>
                      </div>
                      <div 
                        className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 ${sortBy === "price_desc" ? "bg-blue-50 text-blue-600" : ""}`}
                        onClick={() => setSortBy("price_desc")}
                      >
                        <Check className={`mr-2 h-4 w-4 ${sortBy === "price_desc" ? "opacity-100" : "opacity-0"}`} />
                        <span>Maior preço</span>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              {showMobileFilters && (
                <Card className="mt-4">
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Categoria</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas categorias" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas categorias</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Preço mínimo</label>
                        <Input
                          placeholder="R$ Min"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                          type="number"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Preço máximo</label>
                        <Input
                          placeholder="R$ Máx"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                          type="number"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Quartos</label>
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          onClick={() => setBedroomsFilter("all")}
                          className={`cursor-pointer ${bedroomsFilter === "all" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                        >
                          Todos
                        </Badge>
                        <Badge 
                          onClick={() => setBedroomsFilter("1")}
                          className={`cursor-pointer ${bedroomsFilter === "1" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                        >
                          1
                        </Badge>
                        <Badge 
                          onClick={() => setBedroomsFilter("2")}
                          className={`cursor-pointer ${bedroomsFilter === "2" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                        >
                          2
                        </Badge>
                        <Badge 
                          onClick={() => setBedroomsFilter("3")}
                          className={`cursor-pointer ${bedroomsFilter === "3" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                        >
                          3
                        </Badge>
                        <Badge 
                          onClick={() => setBedroomsFilter("4+")}
                          className={`cursor-pointer ${bedroomsFilter === "4+" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                        >
                          4+
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={resetFilters}>
                        Limpar filtros
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Property Listings */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {filteredProperties.length} imóveis encontrados
                </h2>
                
                <div className="hidden lg:flex items-center gap-2">
                  <p className="text-sm text-gray-600">Ordenar por:</p>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Mais recentes</SelectItem>
                      <SelectItem value="oldest">Mais antigos</SelectItem>
                      <SelectItem value="price_asc">Menor preço</SelectItem>
                      <SelectItem value="price_desc">Maior preço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {filteredProperties.length === 0 ? (
                <div className="text-center bg-white rounded-lg shadow p-8">
                  <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum imóvel encontrado</h3>
                  <p className="text-gray-600 mb-6">
                    Tente modificar seus filtros ou busque por outros termos.
                  </p>
                  <Button onClick={resetFilters}>Limpar todos os filtros</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map(property => (
                    <PropertyCard 
                      key={property.id}
                      property={property}
                      category={getCategoryName(property.category_id)}
                      city={getCityName(property.city_id)}
                      realtor={realtors.find(r => r.id === property.realtor_id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      <PublicFooter />
    </div>
  );
}
