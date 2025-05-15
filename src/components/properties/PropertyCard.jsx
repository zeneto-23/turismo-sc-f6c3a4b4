
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, MapPin, DollarSign, Bed, Bath, Car, Square, Building2, Phone, MessageSquare, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PropertyCard({ property, realtor, category, city }) {
  if (!property) return null;

  const formatPrice = (price) => {
    return price?.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const propertyTypeLabels = {
    sale: "Venda",
    rent: "Aluguel",
    temporary: "Temporada"
  };
  
  const propertyTypeColors = {
    sale: "bg-blue-600",
    rent: "bg-purple-600",
    temporary: "bg-teal-600"
  };

  return (
    <Link to={createPageUrl(`PropertyDetail?id=${property.id}`)} className="block hover:no-underline group">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl border border-gray-200 hover:border-blue-400">
        <div className="relative h-56 overflow-hidden">
          {property.main_image_url ? (
            <img
              src={property.main_image_url}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Home className="w-16 h-16 text-gray-400" />
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge className={`${propertyTypeColors[property.property_type] || 'bg-gray-600'} text-white shadow`}>
              {propertyTypeLabels[property.property_type] || property.property_type}
            </Badge>
            {property.featured && <Badge className="bg-orange-500 text-white shadow">Destaque</Badge>}
          </div>
           {realtor?.logo_url && (
            <div className="absolute bottom-3 right-3 bg-white p-1.5 rounded-full shadow-lg w-12 h-12 flex items-center justify-center">
                <img src={realtor.logo_url} alt={realtor.company_name} className="max-w-full max-h-full object-contain rounded-full" />
            </div>
            )}
        </div>

        <CardContent className="p-4 flex-grow flex flex-col justify-between">
          <div>
            {category && <p className="text-xs text-blue-600 font-medium mb-1 uppercase tracking-wider">{category}</p>}
            <h3 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-2 group-hover:text-blue-700">
              {property.title}
            </h3>
            <div className="flex items-center text-gray-500 text-sm mb-3">
              <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span className="truncate">{property.neighborhood ? `${property.neighborhood}, ` : ''}{city || property.address}</span>
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold text-blue-700 mb-3">
              {formatPrice(property.price)}
            </div>

            <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-sm text-gray-600 mb-4">
              {property.area > 0 && (
                <div className="flex items-center" title="Área">
                  <Square className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                  <span>{property.area}m²</span>
                </div>
              )}
              {property.bedrooms > 0 && (
                <div className="flex items-center" title="Quartos">
                  <Bed className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                  <span>{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center" title="Banheiros">
                  <Bath className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                  <span>{property.bathrooms}</span>
                </div>
              )}
              {property.parking_spots > 0 && (
                <div className="flex items-center col-span-1" title="Vagas">
                  <Car className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                  <span>{property.parking_spots}</span>
                </div>
              )}
            </div>

            {realtor && (
              <div className="border-t pt-3 mt-3 flex items-center justify-between">
                <div className='flex items-center'>
                    {realtor.logo_url ? (
                        <img src={realtor.logo_url} alt={realtor.company_name} className="w-8 h-8 rounded-full mr-2 object-cover"/>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                            <Building2 className="w-4 h-4 text-gray-500"/>
                        </div>
                    )}
                    <span className="text-xs text-gray-500 truncate group-hover:text-gray-700">{realtor.company_name}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-pink-500">
                        <Heart className="h-4 w-4"/>
                    </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
