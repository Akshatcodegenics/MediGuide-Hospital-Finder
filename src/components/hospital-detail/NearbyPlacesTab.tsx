
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, Compass } from "lucide-react";
import { NearbyPlace } from "@/types";
import { PlacesFilter } from "./nearby-places/PlacesFilter";
import { PlacesList } from "./nearby-places/PlacesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import mapScreenshot from "@/assets/map-screenshot.jpg";

interface NearbyPlacesTabProps {
  pharmacies: NearbyPlace[];
  hotels: NearbyPlace[];
  foodPlaces: NearbyPlace[];
}

export const NearbyPlacesTab: React.FC<NearbyPlacesTabProps> = ({
  pharmacies,
  hotels,
  foodPlaces,
}) => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("distance");
  
  // Filter places based on maximum distance
  const filteredPharmacies = pharmacies.filter(place => place.distance <= maxDistance);
  const filteredHotels = hotels.filter(place => place.distance <= maxDistance);
  const filteredFoodPlaces = foodPlaces.filter(place => place.distance <= maxDistance);
  
  // Sort places based on selected criteria
  const sortPlaces = (places: NearbyPlace[]) => {
    const sorted = [...places];
    
    switch(sortBy) {
      case 'distance':
        return sorted.sort((a, b) => a.distance - b.distance);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'price_asc':
        return sorted.sort((a, b) => {
          // Using ID as pseudo-price level for sorting
          const priceA = a.id % 4 + 1;
          const priceB = b.id % 4 + 1;
          return priceA - priceB;
        });
      case 'price_desc':
        return sorted.sort((a, b) => {
          const priceA = a.id % 4 + 1;
          const priceB = b.id % 4 + 1;
          return priceB - priceA;
        });
      case 'popularity':
        return sorted.sort((a, b) => {
          // Using ID for pseudo-popularity
          const popA = 65 + (a.id % 36);
          const popB = 65 + (b.id % 36);
          return popB - popA;
        });
      default:
        return sorted;
    }
  };
  
  const sortedPharmacies = sortPlaces(filteredPharmacies);
  const sortedHotels = sortPlaces(filteredHotels);
  const sortedFoodPlaces = sortPlaces(filteredFoodPlaces);
  
  // Removed 3D view animation to keep UI simple and lightweight
  
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg text-white mb-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold mb-1">Explore Nearby Venues</h2>
            <p className="text-blue-100">Find pharmacies, hotels, and restaurants near this hospital</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white">
              {sortedPharmacies.length + sortedHotels.length + sortedFoodPlaces.length} Places Found
            </Badge>
            <Badge className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white">
              Within {maxDistance}km
            </Badge>
          </div>
        </div>
      </motion.div>
      
      <PlacesFilter
        maxDistance={maxDistance}
        setMaxDistance={setMaxDistance}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + sortBy + maxDistance}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <PlacesList
            activeTab={activeTab}
            filteredPharmacies={sortedPharmacies}
            filteredHotels={sortedHotels}
            filteredFoodPlaces={sortedFoodPlaces}
          />
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-blue-100 mt-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Need directions?</h3>
            <p className="text-sm text-gray-600">View all nearby places on the map</p>
          </div>
          <Button 
            variant="outline" 
            className="bg-white"
          >
            <MapPin className="w-4 h-4 mr-2" /> 
            Open Map View
          </Button>
        </div>
      </motion.div>

      {/* Area Screenshots Gallery */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-100 mt-8">
        <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
          <MapPin className="w-6 h-6 mr-2 text-purple-600" />
          Area Screenshots & Views
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Pharmacy Area Screenshot */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <img 
              src={mapScreenshot}
              alt="Nearby pharmacies screenshot"
              className="w-full h-32 object-cover"
            />
            <div className="p-3">
              <h4 className="font-medium text-gray-800 mb-1">Pharmacy District</h4>
              <p className="text-sm text-gray-600">{filteredPharmacies.length} pharmacies nearby</p>
            </div>
          </div>

          {/* Hotel Area Screenshot */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <img 
              src={mapScreenshot}
              alt="Nearby hotels screenshot"
              className="w-full h-32 object-cover"
            />
            <div className="p-3">
              <h4 className="font-medium text-gray-800 mb-1">Hotel Zone</h4>
              <p className="text-sm text-gray-600">{filteredHotels.length} hotels available</p>
            </div>
          </div>

          {/* Restaurant Area Screenshot */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <img 
              src={mapScreenshot}
              alt="Nearby restaurants screenshot"
              className="w-full h-32 object-cover"
            />
            <div className="p-3">
              <h4 className="font-medium text-gray-800 mb-1">Dining Area</h4>
              <p className="text-sm text-gray-600">{filteredFoodPlaces.length} restaurants found</p>
            </div>
          </div>
        </div>

        {/* Aerial View Screenshot */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <img 
            src={mapScreenshot}
            alt="Aerial view of hospital surroundings"
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h4 className="font-medium text-gray-800 mb-2">Aerial View - Hospital Surroundings</h4>
            <p className="text-sm text-gray-600 mb-3">
              Complete overview of all nearby facilities within {maxDistance}km radius of the hospital.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="font-medium text-green-800">{filteredPharmacies.length}</div>
                <div className="text-xs text-green-600">Pharmacies</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-800">{filteredHotels.length}</div>
                <div className="text-xs text-blue-600">Hotels</div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <div className="font-medium text-orange-800">{filteredFoodPlaces.length}</div>
                <div className="text-xs text-orange-600">Restaurants</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
