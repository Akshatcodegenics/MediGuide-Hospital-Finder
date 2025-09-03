
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getHospitalById, getNearbyPlaces } from "@/data/hospitals";
import { Hospital, NearbyPlace } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";


// Import our components
import { HospitalHeader } from "@/components/hospital-detail/HospitalHeader";
import { InfoTab } from "@/components/hospital-detail/InfoTab";
import { AppointmentTab } from "@/components/hospital-detail/AppointmentTab";
import { MapTab } from "@/components/hospital-detail/MapTab";
import { NearbyPlacesTab } from "@/components/hospital-detail/NearbyPlacesTab";
import { SidebarInfo } from "@/components/hospital-detail/SidebarInfo";
import { AIChatAssistant } from "@/components/hospital-detail/AIChatAssistant";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const HospitalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [pharmacies, setPharmacies] = useState<NearbyPlace[]>([]);
  const [hotels, setHotels] = useState<NearbyPlace[]>([]);
  const [foodPlaces, setFoodPlaces] = useState<NearbyPlace[]>([]);
  const [activeTab, setActiveTab] = useState("info");
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("distance"); // New state for sorting

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      const hospitalId = parseInt(id);
      const hospitalData = getHospitalById(hospitalId);
      
      if (hospitalData) {
        // Add a small delay to simulate API fetch for a smoother animation
        setTimeout(() => {
          setHospital(hospitalData);
          
          // Fetch nearby places for this hospital - get more items for better visuals
          const pharmacyPlaces = getNearbyPlaces(hospitalId, 'pharmacy');
          const hotelPlaces = getNearbyPlaces(hospitalId, 'hotel');
          const foodSpots = getNearbyPlaces(hospitalId, 'food');
          
          // Make copies of the arrays to simulate more data
          const morePharmacies = [...pharmacyPlaces, ...pharmacyPlaces.map(place => ({
            ...place,
            id: place.id + 100,
            distance: place.distance + Math.random() * 2,
            name: place.name + " Branch"
          }))];
          
          const moreHotels = [...hotelPlaces, ...hotelPlaces.map(place => ({
            ...place,
            id: place.id + 200,
            distance: place.distance + Math.random() * 4,
            name: "The " + place.name
          }))];
          
          const moreFoodPlaces = [...foodSpots, ...foodSpots.map(place => ({
            ...place,
            id: place.id + 300,
            distance: place.distance + Math.random() * 3,
            name: place.name + " Cafe"
          }))];
          
          setPharmacies(morePharmacies);
          setHotels(moreHotels);
          setFoodPlaces(moreFoodPlaces);
          setIsLoading(false);
        }, 800);
      }
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hospital details...</p>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-600">Hospital not found</p>
          <Link to="/">
            <Button variant="outline" className="mt-4">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Return to Hospital List
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/">
          <Button variant="ghost" className="mb-4 group">
            <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Hospital List
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants} className="col-span-2">
          <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-100 overflow-hidden">
            <HospitalHeader hospital={hospital} />
            
            <CardContent>
              <Tabs defaultValue="info" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-8">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="appointment">Book Appointment</TabsTrigger>
                  <TabsTrigger value="map">Map</TabsTrigger>
                  <TabsTrigger value="nearby">Nearby Places</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info">
                  <InfoTab hospital={hospital} />
                </TabsContent>
                
                <TabsContent value="appointment">
                  <AppointmentTab hospital={hospital} />
                </TabsContent>
                
                <TabsContent value="map">
                  <MapTab hospital={hospital} />
                </TabsContent>
                
                <TabsContent value="nearby">
                  <NearbyPlacesTab 
                    pharmacies={pharmacies}
                    hotels={hotels}
                    foodPlaces={foodPlaces}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants} className="col-span-1">
          <SidebarInfo hospital={hospital} />
        </motion.div>
      </motion.div>
      
      {/* AI Chat Assistant */}
      {hospital && <AIChatAssistant hospital={hospital} />}
    </div>
  );
};

export default HospitalDetail;
