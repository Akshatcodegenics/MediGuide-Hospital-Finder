const express = require('express');
const router = express.Router();

// Mock hospital data with enhanced information
const hospitals = [
  {
    id: 1,
    name: "Apollo Hospital Delhi",
    address: "Sarita Vihar, Delhi, 110076",
    contact: "+91-11-2692-5858",
    email: "info@apollodelhi.com",
    website: "https://www.apollohospitals.com",
    rating: 4.5,
    specialties: ["Cardiology", "Oncology", "Neurology", "Orthopedics"],
    facilities: ["Emergency Care", "ICU", "Pharmacy", "Laboratory", "Radiology"],
    coordinates: { lat: 28.6139, lng: 77.2090 },
    established: 1996,
    bedCount: 695,
    doctorCount: 150,
    emergencyAvailable: true,
    insuranceAccepted: ["CGHS", "ECHS", "Mediclaim", "Cashless"],
    timings: {
      opd: "8:00 AM - 8:00 PM",
      emergency: "24/7"
    },
    images: ["/api/placeholder/hospital1-1.jpg", "/api/placeholder/hospital1-2.jpg"]
  },
  {
    id: 2,
    name: "Fortis Hospital Mumbai",
    address: "Mulund Goregaon Link Road, Mumbai, 400078",
    contact: "+91-22-6754-4444",
    email: "info@fortismumbai.com",
    website: "https://www.fortishealthcare.com",
    rating: 4.3,
    specialties: ["Cardiac Surgery", "Gastroenterology", "Pulmonology", "Nephrology"],
    facilities: ["Cath Lab", "Emergency Care", "Blood Bank", "Pharmacy", "Cafeteria"],
    coordinates: { lat: 19.0760, lng: 72.8777 },
    established: 2007,
    bedCount: 315,
    doctorCount: 85,
    emergencyAvailable: true,
    insuranceAccepted: ["Star Health", "HDFC ERGO", "ICICI Lombard", "Cashless"],
    timings: {
      opd: "9:00 AM - 7:00 PM",
      emergency: "24/7"
    },
    images: ["/api/placeholder/hospital2-1.jpg", "/api/placeholder/hospital2-2.jpg"]
  },
  {
    id: 5,
    name: "AIIMS Delhi",
    address: "Ansari Nagar, New Delhi, 110029",
    contact: "+91-11-2658-8500",
    email: "info@aiims.edu",
    website: "https://www.aiims.edu",
    rating: 4.8,
    specialties: ["All Specialties", "Research", "Medical Education", "Trauma Care"],
    facilities: ["Trauma Center", "Research Labs", "Medical College", "Super Specialty"],
    coordinates: { lat: 28.5672, lng: 77.2100 },
    established: 1956,
    bedCount: 2478,
    doctorCount: 500,
    emergencyAvailable: true,
    insuranceAccepted: ["CGHS", "ECHS", "ESI", "Government Schemes"],
    timings: {
      opd: "8:00 AM - 2:00 PM",
      emergency: "24/7"
    },
    images: ["/api/placeholder/hospital5-1.jpg", "/api/placeholder/hospital5-2.jpg"]
  },
  {
    id: 20,
    name: "Sterling Hospital Ahmedabad",
    address: "Off Gurukul Road, Memnagar, Ahmedabad, 380052",
    contact: "+91-79-6677-0000",
    email: "info@sterlinghospitals.com",
    website: "https://www.sterlinghospitals.com",
    rating: 4.2,
    specialties: ["Cardiology", "Oncology", "Orthopedics", "Gastroenterology"],
    facilities: ["Heart Institute", "Cancer Center", "Joint Replacement", "Pharmacy"],
    coordinates: { lat: 23.0225, lng: 72.5714 },
    established: 2001,
    bedCount: 400,
    doctorCount: 120,
    emergencyAvailable: true,
    insuranceAccepted: ["Star Health", "HDFC ERGO", "Bajaj Allianz", "Cashless"],
    timings: {
      opd: "8:30 AM - 8:00 PM",
      emergency: "24/7"
    },
    images: ["/api/placeholder/hospital20-1.jpg", "/api/placeholder/hospital20-2.jpg"]
  }
];

// GET /api/hospitals - Get all hospitals
router.get('/', (req, res) => {
  const { 
    specialty, 
    location, 
    rating, 
    emergency, 
    insurance,
    page = 1, 
    limit = 10,
    sortBy = 'rating',
    sortOrder = 'desc'
  } = req.query;

  let filteredHospitals = [...hospitals];

  // Filter by specialty
  if (specialty) {
    filteredHospitals = filteredHospitals.filter(hospital =>
      hospital.specialties.some(s => 
        s.toLowerCase().includes(specialty.toLowerCase())
      )
    );
  }

  // Filter by location
  if (location) {
    filteredHospitals = filteredHospitals.filter(hospital =>
      hospital.address.toLowerCase().includes(location.toLowerCase())
    );
  }

  // Filter by minimum rating
  if (rating) {
    filteredHospitals = filteredHospitals.filter(hospital =>
      hospital.rating >= parseFloat(rating)
    );
  }

  // Filter by emergency availability
  if (emergency === 'true') {
    filteredHospitals = filteredHospitals.filter(hospital =>
      hospital.emergencyAvailable
    );
  }

  // Filter by insurance
  if (insurance) {
    filteredHospitals = filteredHospitals.filter(hospital =>
      hospital.insuranceAccepted.some(ins =>
        ins.toLowerCase().includes(insurance.toLowerCase())
      )
    );
  }

  // Sort hospitals
  filteredHospitals.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    } else {
      return aValue > bValue ? 1 : -1;
    }
  });

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedHospitals = filteredHospitals.slice(startIndex, endIndex);

  res.json({
    hospitals: paginatedHospitals,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(filteredHospitals.length / limit),
      totalHospitals: filteredHospitals.length,
      hasNext: endIndex < filteredHospitals.length,
      hasPrev: startIndex > 0
    },
    filters: {
      specialty,
      location,
      rating,
      emergency,
      insurance
    }
  });
});

// GET /api/hospitals/:id - Get hospital by ID
router.get('/:id', (req, res) => {
  const hospitalId = parseInt(req.params.id);
  const hospital = hospitals.find(h => h.id === hospitalId);

  if (!hospital) {
    return res.status(404).json({
      error: 'Hospital not found',
      message: `Hospital with ID ${hospitalId} does not exist`
    });
  }

  // Add additional details for single hospital view
  const hospitalDetails = {
    ...hospital,
    departments: [
      { name: "Emergency", floor: "Ground Floor", contact: hospital.contact },
      { name: "OPD", floor: "1st Floor", contact: hospital.contact },
      { name: "IPD", floor: "2nd-5th Floor", contact: hospital.contact },
      { name: "ICU", floor: "6th Floor", contact: hospital.contact }
    ],
    amenities: [
      "Free WiFi", "Parking", "Cafeteria", "ATM", "Pharmacy", 
      "Blood Bank", "Ambulance Service", "Patient Rooms"
    ],
    visitingHours: {
      general: "10:00 AM - 12:00 PM, 4:00 PM - 7:00 PM",
      icu: "11:00 AM - 12:00 PM, 5:00 PM - 6:00 PM"
    }
  };

  res.json(hospitalDetails);
});

// GET /api/hospitals/:id/doctors - Get doctors for a hospital
router.get('/:id/doctors', (req, res) => {
  const hospitalId = parseInt(req.params.id);
  const hospital = hospitals.find(h => h.id === hospitalId);

  if (!hospital) {
    return res.status(404).json({
      error: 'Hospital not found'
    });
  }

  // Mock doctors data
  const doctors = [
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      specialty: "Cardiology",
      experience: 15,
      qualification: "MD, DM Cardiology",
      availability: ["Monday", "Wednesday", "Friday"],
      timings: "10:00 AM - 2:00 PM",
      consultationFee: 800,
      rating: 4.7
    },
    {
      id: 2,
      name: "Dr. Priya Sharma",
      specialty: "Neurology",
      experience: 12,
      qualification: "MD, DM Neurology",
      availability: ["Tuesday", "Thursday", "Saturday"],
      timings: "9:00 AM - 1:00 PM",
      consultationFee: 900,
      rating: 4.5
    },
    {
      id: 3,
      name: "Dr. Amit Patel",
      specialty: "Orthopedics",
      experience: 18,
      qualification: "MS Orthopedics",
      availability: ["Monday", "Tuesday", "Thursday"],
      timings: "11:00 AM - 3:00 PM",
      consultationFee: 700,
      rating: 4.6
    }
  ];

  res.json({
    hospitalId,
    hospitalName: hospital.name,
    doctors
  });
});

// GET /api/hospitals/search/specialties - Get all available specialties
router.get('/search/specialties', (req, res) => {
  const allSpecialties = [...new Set(
    hospitals.flatMap(hospital => hospital.specialties)
  )].sort();

  res.json({
    specialties: allSpecialties,
    count: allSpecialties.length
  });
});

// GET /api/hospitals/search/locations - Get all available locations
router.get('/search/locations', (req, res) => {
  const locations = hospitals.map(hospital => {
    const addressParts = hospital.address.split(',');
    return {
      id: hospital.id,
      name: hospital.name,
      city: addressParts[addressParts.length - 2]?.trim() || 'Unknown',
      fullAddress: hospital.address,
      coordinates: hospital.coordinates
    };
  });

  const cities = [...new Set(locations.map(loc => loc.city))].sort();

  res.json({
    locations,
    cities,
    count: locations.length
  });
});

module.exports = router;
