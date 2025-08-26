const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Sample data for Uttarakhand flood-prone and landslide areas
const floodProneAreas = [
  {
    id: 1,
    name: "Kosi River Basin",
    coordinates: [29.5912, 79.6483],
    risk: "high",
    type: "flood",
    description: "Frequent flooding during monsoon season"
  },
  {
    id: 2,
    name: "Ramganga River",
    coordinates: [29.5121, 79.1234],
    risk: "moderate",
    type: "flood",
    description: "Moderate flood risk, especially in July-August"
  },
  {
    id: 3,
    name: "Bhimtal Lake Area",
    coordinates: [29.3444, 79.5633],
    risk: "low",
    type: "flood",
    description: "Low flood risk, but monitor during heavy rains"
  }
];

const landslideAreas = [
  {
    id: 1,
    name: "Almora-Bhimtal Highway",
    coordinates: [29.5912, 79.6483],
    risk: "high",
    type: "landslide",
    description: "Frequent landslides during monsoon, especially near curves"
  },
  {
    id: 2,
    name: "Mountain Slopes near Almora",
    coordinates: [29.5912, 79.6483],
    risk: "moderate",
    type: "landslide",
    description: "Moderate landslide risk on steep slopes"
  },
  {
    id: 3,
    name: "Bhimtal Forest Area",
    coordinates: [29.3444, 79.5633],
    risk: "low",
    type: "landslide",
    description: "Low landslide risk, mostly stable terrain"
  }
];

// Route optimization data
const routeSegments = [
  {
    id: 1,
    name: "Almora City to Highway Junction",
    start: [29.5912, 79.6483],
    end: [29.5800, 79.6400],
    distance: 2.5,
    time: 8,
    risk: "low",
    hazards: []
  },
  {
    id: 2,
    name: "Highway Junction to Kosi River Bridge",
    start: [29.5800, 79.6400],
    end: [29.5500, 79.6200],
    distance: 8.2,
    time: 15,
    risk: "moderate",
    hazards: ["flood", "landslide"]
  },
  {
    id: 3,
    name: "Kosi River Bridge to Bhimtal Approach",
    start: [29.5500, 79.6200],
    end: [29.4000, 79.5800],
    distance: 12.8,
    time: 25,
    risk: "high",
    hazards: ["flood", "landslide", "narrow_road"]
  },
  {
    id: 4,
    name: "Bhimtal Approach to Bhimtal City",
    start: [29.4000, 79.5800],
    end: [29.3444, 79.5633],
    distance: 3.5,
    time: 7,
    risk: "low",
    hazards: []
  }
];

// API Routes
app.get('/api/flood-areas', (req, res) => {
  res.json(floodProneAreas);
});

app.get('/api/landslide-areas', (req, res) => {
  res.json(landslideAreas);
});

app.get('/api/route-segments', (req, res) => {
  res.json(routeSegments);
});

// Route optimization endpoint
app.post('/api/optimize-route', (req, res) => {
  const { from, to, userLocation } = req.body;
  
  // Calculate optimal route based on current conditions
  const optimizedRoute = calculateOptimalRoute(from, to, userLocation);
  
  res.json(optimizedRoute);
});

// User location tracking
app.post('/api/update-location', (req, res) => {
  const { userId, latitude, longitude, timestamp } = req.body;
  
  // In a real app, you'd store this in a database
  console.log(`User ${userId} location updated: ${latitude}, ${longitude} at ${timestamp}`);
  
  res.json({ success: true, message: 'Location updated successfully' });
});

// Weather and hazard alerts
app.get('/api/alerts', (req, res) => {
  const currentAlerts = generateCurrentAlerts();
  res.json(currentAlerts);
});

// Helper functions
function calculateOptimalRoute(from, to, userLocation) {
  const totalDistance = 27.0; // Total distance from Almora to Bhimtal
  const baseTime = 55; // Base travel time in minutes
  
  // Calculate risk-adjusted route
  let totalRisk = 0;
  let totalTime = baseTime;
  let totalDistanceAdjusted = totalDistance;
  
  routeSegments.forEach(segment => {
    if (segment.risk === 'high') {
      totalRisk += 3;
      totalTime += 15; // Add delay for high-risk segments
    } else if (segment.risk === 'moderate') {
      totalRisk += 2;
      totalTime += 8; // Add delay for moderate-risk segments
    } else {
      totalRisk += 1;
    }
  });
  
  // Calculate safety score (0-100)
  const safetyScore = Math.max(0, 100 - (totalRisk * 15));
  
  return {
    route: routeSegments,
    summary: {
      totalDistance: totalDistanceAdjusted,
      estimatedTime: totalTime,
      safetyScore: safetyScore,
      riskLevel: totalRisk <= 3 ? 'low' : totalRisk <= 6 ? 'moderate' : 'high',
      warnings: generateWarnings(totalRisk)
    },
    alternatives: generateAlternativeRoutes(from, to)
  };
}

function generateWarnings(riskLevel) {
  const warnings = [];
  
  if (riskLevel >= 6) {
    warnings.push({
      type: 'high',
      message: 'High risk route - consider postponing travel or taking alternative route',
      icon: 'exclamation-triangle'
    });
  }
  
  if (riskLevel >= 4) {
    warnings.push({
      type: 'moderate',
      message: 'Moderate risk - exercise caution and monitor weather conditions',
      icon: 'exclamation-circle'
    });
  }
  
  return warnings;
}

function generateAlternativeRoutes(from, to) {
  return [
    {
      name: "Alternative Route A",
      distance: 32.5,
      time: 70,
      safetyScore: 85,
      description: "Longer but safer route via Ranikhet"
    },
    {
      name: "Alternative Route B", 
      distance: 35.2,
      time: 75,
      safetyScore: 90,
      description: "Safest route via Haldwani, longer distance"
    }
  ];
}

function generateCurrentAlerts() {
  return [
    {
      id: 1,
      type: 'weather',
      severity: 'moderate',
      title: 'Heavy Rain Warning',
      description: 'Heavy rainfall expected in Almora-Bhimtal region for next 24 hours',
      affectedAreas: ['Almora', 'Bhimtal', 'Kosi River Basin'],
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      type: 'landslide',
      severity: 'high',
      title: 'Landslide Alert',
      description: 'High risk of landslides on Almora-Bhimtal highway due to heavy rainfall',
      affectedAreas: ['Almora-Bhimtal Highway', 'Mountain Slopes'],
      timestamp: new Date().toISOString()
    }
  ];
}

// Serve the main HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/gettingstarted', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gettingstarted.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Flood Alert System Backend Active`);
});