import React, { useState, useEffect } from "react";
import { CityBanner } from "@/api/entities";
import { Loader2 } from "lucide-react";

export default function CityBanners({ cityId }) {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!cityId) return;
    
    const loadBanners = async () => {
      setIsLoading(true);
      try {
        // Buscar banners mais recentes primeiro, limitado a 3
        const bannersData = await CityBanner.filter({ city_id: cityId }, '-created_at', 3);
        setBanners(bannersData);
      } catch (error) {
        console.error("Erro ao carregar banners da cidade:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBanners();
  }, [cityId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return null; // Não exibir nada se não houver banners
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Parceiros e Serviços Recomendados</h2>
      
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        {banners.map((banner) => (
          <a
            key={banner.id}
            href={banner.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center bg-white rounded-lg shadow-md border border-gray-200 p-3 w-full md:w-80 h-24 no-underline transition-all duration-300 hover:shadow-lg"
          >
            <div className="w-16 h-16 flex-shrink-0 mr-3">
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-gray-500 uppercase font-medium tracking-wide truncate">{banner.category}</p>
              <h3 className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">{banner.title}</h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}