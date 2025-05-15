import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, BookOpen, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function GuideCard({ guide }) {
  const navigate = useNavigate();
  
  const getCategoryColor = (category) => {
    const colors = {
      "gastronomia": "bg-orange-100 text-orange-800",
      "hospedagem": "bg-blue-100 text-blue-800",
      "passeios": "bg-green-100 text-green-800",
      "eventos": "bg-purple-100 text-purple-800",
      "cultura": "bg-pink-100 text-pink-800",
      "compras": "bg-yellow-100 text-yellow-800",
      "familia": "bg-teal-100 text-teal-800",
      "noturno": "bg-indigo-100 text-indigo-800",
      "geral": "bg-gray-100 text-gray-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };
  
  const getCategoryLabel = (category) => {
    const labels = {
      "gastronomia": "Gastronomia",
      "hospedagem": "Hospedagem",
      "passeios": "Passeios",
      "eventos": "Eventos",
      "cultura": "Cultura",
      "compras": "Compras",
      "familia": "Família",
      "noturno": "Vida Noturna",
      "geral": "Geral"
    };
    return labels[category] || category;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className="relative h-40">
        <img 
          src={guide.cover_image_url} 
          alt={guide.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute top-2 right-2">
          <Badge className={getCategoryColor(guide.category)}>
            {getCategoryLabel(guide.category)}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 p-3 text-white">
          <h3 className="text-lg font-bold">{guide.title}</h3>
        </div>
      </div>
      
      <CardContent className="p-4">
        <p className="text-sm text-gray-600 line-clamp-2">{guide.description}</p>
        
        <div className="flex items-center mt-3">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarFallback>{guide.user.full_name[0]}</AvatarFallback>
            {guide.user.avatar_url && (
              <AvatarImage src={guide.user.avatar_url} alt={guide.user.full_name} />
            )}
          </Avatar>
          <span className="text-sm">{guide.user.full_name}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <Heart className="h-4 w-4 mr-1 fill-red-500 text-red-500" />
          <span>{guide.likes_count}</span>
        </div>
        
        <Button className="text-[#007BFF]" variant="ghost">
          Ler Guia
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}