
/* Map of GeoJSON data from lab1_data.geojson */

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
    var scaleFactor = 1350;
    //area based on attribute value and scale factor
    var area = (attValue-0.15) * scaleFactor; //index adjusted for visual variation
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

function pointToLayer(feature, latlng, attributes){
  var attribute = attributes[0]; //default layer, assign the current attribute based on the first attribute in array
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

//Step: Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }// pointToLayer option  passes along parameters feature and latlng to the anonymous function; add third parameter to pointToLayer() function
    }).addTo(map);
};
//Step: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
          var props = layer.feature.properties;//access feature properties

          //update each feature's radius based on new attribute values
          var radius = calcPropRadius(props[attribute]);
          layer.setRadius(radius);

          //add formatted attribute to panel content string
          var year = attribute.slice(2);
          var popupContent = "<p><b>Country:</b> " + props.CountryName + "</p><p><b> " + props.Indicator+' in  '+year + ":</b> " + props[attribute] + "</p>";

          //replace the layer popup
          layer.bindPopup(popupContent, {
              offset: new L.Point(0,-radius)
          });
        };
    });
};
//Step: Create new sequence controls,an HTML range slider
function createSequenceControls(map){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    //set slider attributes
        $('.range-slider').attr({
            max: 11,
            min: 0,
            value: 0,
            step: 1
        });
    $('#panel').append('<button class="skip" id="reverse">Previous</button>');
    $('#panel').append('<button class="skip" id="forward">Next</button>');
    $('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');
    //Step: click listener for skip buttons
    $('.skip').click(function(){
        //sequence
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 11 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 11 : index;
        };

        //Step 8: update slider
        $('.range-slider').val(index); //setting the value of the slider=our new index(??)
        updatePropSymbols(map, attributes[index]);
    });

    //Step: input listener for slider
    $('.range-slider').on('input', function(){
      var index = $(this).val();//sequence; get the new index value=val(),the current value of the element that fired the event
      updatePropSymbols(map, attributes[index]);
    });
};

//Step: build an attributes array from the data
function processData(data){
    //empty array to hold attributes(names)
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("yr") <1){  //property name starting with 'yr'
            attributes.push(attribute); &&push() method adds new items to the end of an array
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

//Step: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/lab1_data.geojson", {
        dataType: "json",
        success: function(response){
          //create an attributes array
            var attributes = processData(response);

            //call function to create proportional symbols
            createPropSymbols(response, map);
            createSequenceControls(map);
        }
    });
};

$(document).ready(createMap);
