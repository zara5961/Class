// Initialize the map
var map = L.map("map", {
  center: [37.09, -95.71], // Center the map to the US
  zoom: 5
});

// Create tile layers for different base maps
var streetMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Map data © OpenStreetMap contributors"
});

var topoMap = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
  attribution: "Map data © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)"
});

// Add the street map to the map by default
streetMap.addTo(map);

// Create layer groups for earthquakes and tectonic plates
var earthquakeLayer = L.layerGroup();
var tectonicPlatesLayer = L.layerGroup();

// Fetch the earthquake GeoJSON data from the USGS
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(earthquakeUrl).then(function(data) {

  // Function to set marker color based on earthquake depth
  function getColor(depth) {
    return depth > 90 ? "#ea2c2c" :
           depth > 70 ? "#ea822c" :
           depth > 50 ? "#ee9c00" :
           depth > 30 ? "#eecc00" :
           depth > 10 ? "#d4ee00" :
                        "#98ee00";
  }

  // Function to create circle markers
  function createMarkers(feature, latlng) {
    return L.circleMarker(latlng, {
      radius: feature.properties.mag * 4, // Set marker size based on magnitude
      fillColor: getColor(feature.geometry.coordinates[2]), // Color based on depth
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    });
  }

  // Add GeoJSON layer to the earthquakeLayer group
  L.geoJSON(data, {
    pointToLayer: createMarkers, // Use createMarkers for each point
    onEachFeature: function(feature, layer) {
      layer.bindPopup(
        `<h3>Magnitude: ${feature.properties.mag}</h3>
         <p>Location: ${feature.properties.place}</p>
         <p>Depth: ${feature.geometry.coordinates[2]} km</p>`
      );
    }
  }).addTo(earthquakeLayer);

  // Add the earthquakeLayer group to the map
  earthquakeLayer.addTo(map);
});

// Fetch the tectonic plates GeoJSON data from GitHub
var tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

d3.json(tectonicPlatesUrl).then(function(data) {

  // Add tectonic plates data to the tectonicPlatesLayer group
  L.geoJSON(data, {
    style: function() {
      return {
        color: "orange",
        weight: 2
      };
    }
  }).addTo(tectonicPlatesLayer);

  // Add the tectonicPlatesLayer group to the map
  tectonicPlatesLayer.addTo(map);
});

// Create a legend control object
var legend = L.control({ position: "bottomright" });

legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "info legend");
  var depths = [-10, 10, 30, 50, 70, 90];
  var labels = [];

  // Loop through the intervals of depth and generate a label with a colored square for each interval
  for (var i = 0; i < depths.length; i++) {
    div.innerHTML +=
      "<i style='background: " + getColor(depths[i] + 1) + "'></i> " +
      depths[i] + (depths[i + 1] ? "&ndash;" + depths[i + 1] + "<br>" : "+");
  }

  return div;
};

// Add the legend to the map
legend.addTo(map);

// Create base maps and overlay objects
var baseMaps = {
  "Street Map": streetMap,
  "Topographic Map": topoMap
};

var overlayMaps = {
  "Earthquakes": earthquakeLayer,
  "Tectonic Plates": tectonicPlatesLayer
};

// Add a control for switching between base maps and overlays
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(map);
