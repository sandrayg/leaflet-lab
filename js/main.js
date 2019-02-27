/* Map of GeoJSON data from MegaCities.geojson */

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var mymap = L.map('mapid', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(mymap);

    //call getData function
    getData(mymap);
};
//calculate the radius of each proportional symbol
function calcRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 1250;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

function pointToLayer(feature, latlng){
  var attribute = "yr2018";
  var year = attribute.slice(2);
  var markerOptions = { //set the markers style
	  //radius:8,
      fillColor: "#ff7800",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
  };
  var attValue = Number(feature.properties[attribute]); //determine which attribute to be represented by propotional createPropSymbols
  var attName = feature.properties.Indicator;
    console.log(attValue)

  markerOptions.radius = calcRadius(attValue); //assign the radius value in the marker option
  var layer = L.circleMarker(latlng, markerOptions);
  //build popup content string
    var popupContent = "<p><b>Country:</b> " + feature.properties.CountryName + "</p><p><b> " + attName+' in  '+year + ":</b> " + feature.properties[attribute] + "</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent);

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};
//Step 3: Add circle markers for point features to the map
function createPropSymbols(data, map){
      //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
};


//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/lab1_data.geojson", {
        dataType: "json",
        success: function(response){
            //call function to create proportional symbols
            createPropSymbols(response, map);
        }
    });
};

$(document).ready(createMap);
