//Set up the map: Use Leaflet's L.map() function to initialize the map.
var map = L.map("map", {
    center: [37.09, -95.71],  // Center of the US
    zoom: 5
  });
//  Add Tile Layer: Load the basic map using L.tileLayer(). This is to ensure the TileLayer loads without error.

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Map data © OpenStreetMap contributors"
  }).addTo(map);

//Connect to GeoJSON API: Use D3 to fetch earthquake data. For example, the past 7 days' earthquake data can be fetched using:
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

  // Add GeoJSON layer to the map with the earthquake data
  L.geoJSON(data, {
    pointToLayer: createMarkers, // Use createMarkers for each point
    onEachFeature: function(feature, layer) {
      layer.bindPopup(
        `<h3>Magnitude: ${feature.properties.mag}</h3>
         <p>Location: ${feature.properties.place}</p>
         <p>Depth: ${feature.geometry.coordinates[2]} km</p>`
      );
    }
  }).addTo(map);

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
});

