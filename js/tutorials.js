/* Leaflet tutorial exapmle script with comments*/

//initialize the map (with HTML div element ID = 'mapid'), set view to a chosen geographical coordinates (in this case,center of London) and a zoom level
var mymap = L.map('mapid').setView([51.505, -0.09], 13);

//add title layer using Mapbox Streets; not executed, using OSM instead; see below
// L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
//     attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
//     maxZoom: 18,
//     id: 'your.mapbox.project.id',
//     accessToken: 'your.mapbox.public.access.token'
// }).addTo(mymap);

//add tile layer, using OSM as provider for tiles
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { //URL string that set the template for the tile images
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);

var marker = L.marker([51.5, -0.09]).addTo(mymap); // add a market

var circle = L.circle([51.508, -0.11], { // add a circle
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(mymap);

var polygon = L.polygon([ //add a polygon
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(mymap);

marker.bindPopup("<strong>Hello world!</strong><br />I am a popup.").openPopup(); //// attach popup to marker that immediately opens
circle.bindPopup("I am a circle."); //popup appears when clicking on the circle
polygon.bindPopup("I am a polygon.");

var popup = L.popup() // add popup as a layer
    .setLatLng([51.5, -0.09]) //set where the popup is on the map
    .setContent("I am a standalone popup.") //set content of popup
    .openOn(mymap); // popup automatically closes when new popup opens

var popup = L.popup();
function onMapClick(e) { // a function that takes as its argument 'e', the event object of map click
    popup
        .setLatLng(e.latlng) //set the lat-lon attribute of popup same as the latlng property of the map click event object which is a location at which the click occurred
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}

mymap.on('click', onMapClick); //at the event click's occurrance to 'mymap', calls the function 'onMapClick'

//geoJson tutorial
L.geoJSON(geojsonFeature).addTo(map);//create GeoJSON layer and add to mapid
//alternatively, create an empty GeoJSON layer and assign it to a variable so that we can add more features to it later
var myLayer = L.geoJSON().addTo(map);
myLayer.addData(geojsonFeature);
//pass GeoJSON objects as an array of valid GeoJSON objects.
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];
//example of passing a simple object that styles all paths (polylines and polygons) the same way
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};
L.geoJSON(myLines, { // set the style of all linestrings according to the simple styling object
    style: myStyle
}).addTo(map);
//eaxmple of passing a function that styles individual features based on their properties
var states = [{ // pass array of polygons
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

L.geoJSON(states, {
    style: function(feature) { //check the "party" property and style polygons accordingly
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"}; //set color of style as "#ff0000" if 'party' property of a feature = 'Republican'
            case 'Democrat':   return {color: "#0000ff"}; //set the color if 'party' property = 'Democrat'
        }
    }
}).addTo(map);
//create GeoJSON Points layer
var geojsonMarkerOptions = { //set the style of CircleMArker when drawing GeoJSON points on layer
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

L.geoJSON(someFeatures, {
    pointToLayer: function (feature, latlng) { //'feature' and 'latlng' properties of features passed through the function "pointToLayer"
        return L.circleMarker(latlng, geojsonMarkerOptions); // using the latlng passed and options defined
    }
}).addTo(map);

//example using 'onEachFeature' option
function onEachFeature_fn(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent); //if yes, add popup to such features
    }
}

var geojsonFeature = { //
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

L.geoJSON(geojsonFeature, { //create layer from  geoJson objects
    onEachFeature: onEachFeature_fn // onEachFeature option that calls a function
}).addTo(map);

//example using 'filter' option
var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

L.geoJSON(someFeatures, {
    filter: function(feature, layer) { //function  gets called for each feature in your GeoJSON layer, and gets passed the feature and the layer
        return feature.properties.show_on_map; // feature is only visible if property 'show_on_map' returns true
    }
}).addTo(map);
