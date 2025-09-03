import React, { useEffect, useState, useRef } from "react";
import { Hospital } from "@/types";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from "@/components/ui/button";
import { Compass, Locate, Layers, MoveHorizontal, Navigation, MapPin, Hotel, Pill, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different place types
const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
      <span style="color: white; font-size: 14px;">${icon}</span>
    </div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const hospitalIcon = createCustomIcon('#8b5cf6', '🏥');
const pharmacyIcon = createCustomIcon('#10b981', '💊');
const hotelIcon = createCustomIcon('#3b82f6', '🏨');
const restaurantIcon = createCustomIcon('#f97316', '🍽️');

// Mock locations for hospitals with more accurate coordinates
const hospitalLocations: Record<number, {lat: number, lng: number}> = {
  1: {lat: 28.6139, lng: 77.2090}, // Apollo Delhi
  2: {lat: 19.0760, lng: 72.8777}, // Fortis Mumbai
  5: {lat: 28.5672, lng: 77.2100}, // AIIMS Delhi
  20: {lat: 23.0225, lng: 72.5714}, // Hospital in Ahmedabad
};

interface MapTabProps {
  hospital: Hospital;
}

export const MapTab: React.FC<MapTabProps> = ({ hospital }) => {
  const [showNearby, setShowNearby] = useState<boolean>(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]);
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [nearbyPlaces, setNearbyPlaces] = useState<Array<{
    id: string;
    type: string;
    name: string;
    lat: number;
    lng: number;
    icon: L.DivIcon;
    distance: number;
    rating: string;
    priceLevel: string;
  }>>([]);
  const [nearbyHospitals, setNearbyHospitals] = useState<Array<{
    id: number;
    name: string;
    lat: number;
    lng: number;
    distance: string;
    rating: number;
    icon: L.DivIcon;
  }>>([]);
  const [showNearbyHospitals, setShowNearbyHospitals] = useState<boolean>(false);
  const maxDistance = 100; // Maximum distance in kilometers
  const { toast } = useToast();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const location = hospitalLocations[hospital.id] || { lat: 28.6139, lng: 77.2090 };

  useEffect(() => {
    setMapCenter([location.lat, location.lng]);
  }, [hospital.id, location]);

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(mapCenter, mapZoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
      
      // Add hospital marker
      L.marker([location.lat, location.lng], { icon: hospitalIcon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-purple-600 mb-1">${hospital.name}</h3>
            <p class="text-sm text-gray-600">${hospital.address || 'Address not available'}</p>
            ${hospital.contact ? `<p class="text-sm text-blue-600 mt-1">${hospital.contact}</p>` : ''}
            <div class="mt-2">
              <button class="px-2 py-1 bg-blue-500 text-white text-xs rounded">Book Appointment</button>
            </div>
          </div>
        `);
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map view when center or zoom changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(mapCenter, mapZoom);
    }
  }, [mapCenter, mapZoom]);

  // Generate nearby places
  const generateNearbyPlaces = () => {
    const generateRandomLocation = (baseLat: number, baseLng: number, maxDistanceKm: number) => {
      const maxDegrees = maxDistanceKm / 111; // 1 degree ≈ 111km
      const randomDistance = Math.random() * maxDegrees * 0.7;
      const randomAngle = Math.random() * 2 * Math.PI;
      
      return {
        lat: baseLat + (randomDistance * Math.cos(randomAngle)),
        lng: baseLng + (randomDistance * Math.sin(randomAngle))
      };
    };

    const places = [
      // Pharmacies
      ...Array(5).fill(null).map((_, i) => {
        const pos = generateRandomLocation(location.lat, location.lng, maxDistance * 0.3);
        const distance = Math.round(Math.random() * maxDistance * 0.3);
        return {
          id: `pharmacy-${i}`,
          type: 'pharmacy',
          name: `City Pharmacy ${i + 1}`,
          lat: pos.lat,
          lng: pos.lng,
          icon: pharmacyIcon,
          distance,
          rating: (3 + Math.random() * 2).toFixed(1),
          priceLevel: ['$', '$$', '$$$'][Math.floor(Math.random() * 3)]
        };
      }),
      // Hotels
      ...Array(8).fill(null).map((_, i) => {
        const pos = generateRandomLocation(location.lat, location.lng, maxDistance * 0.6);
        const distance = Math.round(Math.random() * maxDistance * 0.6);
        return {
          id: `hotel-${i}`,
          type: 'hotel',
          name: `Hotel ${['Grand', 'Royal', 'Comfort', 'Luxury', 'Budget', 'Premium', 'Elite', 'Star'][i]} Inn`,
          lat: pos.lat,
          lng: pos.lng,
          icon: hotelIcon,
          distance,
          rating: (3 + Math.random() * 2).toFixed(1),
          priceLevel: ['$', '$$', '$$$', '$$$$'][Math.floor(Math.random() * 4)]
        };
      }),
      // Restaurants
      ...Array(10).fill(null).map((_, i) => {
        const pos = generateRandomLocation(location.lat, location.lng, maxDistance);
        const distance = Math.round(Math.random() * maxDistance);
        return {
          id: `restaurant-${i}`,
          type: 'food',
          name: `${['Italian', 'Chinese', 'Indian', 'Mexican', 'Thai', 'Fast', 'Vegan', 'Seafood', 'Grill', 'Cafe'][i]} Restaurant`,
          lat: pos.lat,
          lng: pos.lng,
          icon: restaurantIcon,
          distance,
          rating: (3 + Math.random() * 2).toFixed(1),
          priceLevel: ['$', '$$', '$$$', '$$$$'][Math.floor(Math.random() * 4)]
        };
      })
    ];

    setNearbyPlaces(places);
  };

  // Generate nearby hospitals
  const generateNearbyHospitals = () => {
    const hospitals = [
      { 
        id: 101, 
        name: "City General Hospital", 
        lat: location.lat + 0.02, 
        lng: location.lng + 0.03, 
        distance: "5.2 km", 
        rating: 4.2,
        icon: createCustomIcon('#ef4444', '🏥')
      },
      { 
        id: 102, 
        name: "Community Health Center", 
        lat: location.lat - 0.03, 
        lng: location.lng - 0.01, 
        distance: "7.8 km", 
        rating: 3.9,
        icon: createCustomIcon('#ef4444', '🏥')
      },
      { 
        id: 103, 
        name: "Metro Medical Center", 
        lat: location.lat + 0.01, 
        lng: location.lng - 0.04, 
        distance: "9.1 km", 
        rating: 4.5,
        icon: createCustomIcon('#ef4444', '🏥')
      },
    ];

    setNearbyHospitals(hospitals);
  };

  useEffect(() => {
    generateNearbyPlaces();
    generateNearbyHospitals();
  }, [hospital.id]);

  const handleShowNearby = () => {
    setShowNearby(!showNearby);
    if (!showNearby && mapRef.current) {
      // Add nearby place markers
      nearbyPlaces.forEach(place => {
        L.marker([place.lat, place.lng], { icon: place.icon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold mb-1">${place.name}</h3>
              <p class="text-sm text-gray-600 capitalize">${place.type}</p>
              <div class="flex items-center mt-1">
                <span class="text-yellow-500 mr-2">★ ${place.rating}</span>
                <span class="text-purple-600">${place.distance}km</span>
              </div>
              ${place.type === 'food' ? `<p class="text-sm font-medium mt-1">${place.priceLevel} • Average cost</p>` : ''}
              ${place.type === 'hotel' ? `<p class="text-sm font-medium mt-1">${place.priceLevel} • Per night</p>` : ''}
              <button class="px-2 py-1 bg-blue-500 text-white text-xs rounded mt-2">View Details</button>
            </div>
          `);
      });
      
      toast({
        title: "Nearby places loaded!",
        description: "Showing pharmacies, hotels, and restaurants near the hospital.",
        variant: "default"
      });
    } else if (mapRef.current) {
      // Remove nearby place markers (this is simplified - in a real app you'd track markers)
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer !== mapRef.current) {
          // Remove non-hospital markers
          mapRef.current!.removeLayer(layer);
        }
      });
    }
  };

  const handleShowNearbyHospitals = () => {
    setShowNearbyHospitals(!showNearbyHospitals);
    if (!showNearbyHospitals && mapRef.current) {
      // Zoom out to show nearby hospitals
      setMapZoom(11);
      
      // Add nearby hospital markers
      nearbyHospitals.forEach(hospital => {
        L.marker([hospital.lat, hospital.lng], { icon: hospital.icon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold mb-1">${hospital.name}</h3>
              <div class="flex items-center text-sm">
                <span class="text-yellow-500 mr-2">★ ${hospital.rating}</span>
                <span class="text-blue-600">${hospital.distance}</span>
              </div>
              <button class="px-2 py-1 bg-blue-500 text-white text-xs rounded mt-2">View Hospital</button>
            </div>
          `);
      });
      
      toast({
        title: "Nearby hospitals loaded!",
        description: "Showing other hospitals in the area.",
        variant: "default"
      });
    } else {
      setMapZoom(13);
    }
  };

  const resetView = () => {
    setMapCenter([location.lat, location.lng]);
    setMapZoom(15);
    setShowNearby(false);
    setShowNearbyHospitals(false);
    
    if (mapRef.current) {
      // Clear all markers except the main hospital
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapRef.current!.removeLayer(layer);
        }
      });
      
      // Re-add the hospital marker
      L.marker([location.lat, location.lng], { icon: hospitalIcon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-purple-600 mb-1">${hospital.name}</h3>
            <p class="text-sm text-gray-600">${hospital.address || 'Address not available'}</p>
            ${hospital.contact ? `<p class="text-sm text-blue-600 mt-1">${hospital.contact}</p>` : ''}
            <div class="mt-2">
              <button class="px-2 py-1 bg-blue-500 text-white text-xs rounded">Book Appointment</button>
            </div>
          </div>
        `);
    }
  };

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <MapPin className="w-5 h-5 text-purple-600 mr-2" />
          <h2 className="text-lg font-medium">Hospital Location</h2>
        </div>
        <p className="text-gray-600">
          {hospital.name} is located at <span className="font-medium">{hospital.address}</span>.
          Explore nearby places within {maxDistance}km using the free OpenStreetMap service.
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleShowNearby}
          className={showNearby ? "bg-blue-100" : ""}
        >
          <Compass className="mr-2 h-4 w-4" />
          {showNearby ? "Hide Nearby Places" : "Show Nearby Places"}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleShowNearbyHospitals}
          className={showNearbyHospitals ? "bg-red-100" : ""}
        >
          <MoveHorizontal className="mr-2 h-4 w-4" />
          {showNearbyHospitals ? "Hide Nearby Hospitals" : "Show Nearby Hospitals"}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={resetView}
        >
          <Locate className="mr-2 h-4 w-4" />
          Reset View
        </Button>
      </div>

      {/* Legend */}
      {(showNearby || showNearbyHospitals) && (
        <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4">
          <h3 className="text-sm font-medium mb-2">Map Legend</h3>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-600 rounded-full mr-2"></div>
              <span>Selected Hospital</span>
            </div>
            {showNearbyHospitals && (
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-600 rounded-full mr-2"></div>
                <span>Other Hospitals</span>
              </div>
            )}
            {showNearby && (
              <>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-600 rounded-full mr-2"></div>
                  <span>Pharmacies</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-600 rounded-full mr-2"></div>
                  <span>Hotels</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-600 rounded-full mr-2"></div>
                  <span>Restaurants</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <div 
        ref={mapContainerRef}
        className="h-[550px] rounded-lg shadow-md overflow-hidden border border-gray-200"
        style={{ height: '550px', width: '100%' }}
      ></div>
      
      <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
        <span>Use mouse wheel to zoom, drag to pan</span>
        <span>Map data © OpenStreetMap contributors</span>
      </div>
    </motion.div>
  );
};
