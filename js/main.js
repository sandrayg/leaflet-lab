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
    var scaleFactor = 1300;
    //area based on attribute value and scale factor
    var area = (attValue-0.15) * scaleFactor; //index adjusted for visual variation
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};
//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
          var attributeValue = layer.feature.properties[attribute];
          attributeValue= attValue=""? 0:Number(attributeValue)
          //var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });

    //set mean
    var mean = (max + min) / 2;

    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};

//function to create legend
function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="60px">';
            //array of circle names to base loop on
            var circles = {
      				max: 20,
      				mean: 40,
      				min: 60
      			};

            //Step 2: loop to add each circle and text to svg string
            for (var i=0; i<circles.length; i++){
                //circle string
                svg += '<circle class="legend-circle" id="' + circles[i] +
                '" fill="#ff7800" fill-opacity="0.8" stroke="#000000" cx="90"/>';
            };

            //close svg string
            svg += "</svg>";
            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });

    map.addControl(new LegendControl());

    updateLegend(map, attributes[0]);
};

//Update the legend with new attribute
function updateLegend(map, attribute){
    //create content for legend
    var year = attribute.slice(2);
    var content = "Gender Equality index in " + year;

    //replace legend content
    $('#temporal-legend').html(content);

    //get the value for circle size in legend
    var circleValues = getCircleValues(map, attribute);
    //dynamically assigning the last two circle attributes in main.js
    for (var key in circleValues){
       //get the radius
       var radius = calcRadius(circleValues[key]);
       //Step 3: assign the cy and r attributes
       $('#'+key).attr({
           cy: 179 - radius,
           r: radius
       });
   };
};
function createPopup(properties, attribute, layer, radius){
    var year = attribute.slice(2);
    var popupContent = "<p><b>Country:</b> " + properties.CountryName + "</p><p><b> " + properties.Indicator +' in  '+ year + ":</b> " + properties[attribute] + "</p>";

    //replace the layer popup
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-radius)
    });
};
function pointToLayer(feature, latlng, attributes){
  var attribute = attributes[0]; //assign the current attribute based on the first attribute in array. i.e.'yr2006'
//  var year = attribute.slice(2);
  // feature.properties[['visible']]=1; //give each feature a new property that controls the visibility of layer; initially set to 1.
  var markerOptions = { //set the markers style
	  //radius:8,
      fillColor: "#FFB6C1",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
  };
  var attValue = feature.properties[attribute];
  attValue= attValue=""? 0:Number(attValue) //ensuring attValue is a numeric value; when missing data, set to 0

  markerOptions.radius = calcRadius(attValue); //assign the radius value in the marker option
  var layer = L.circleMarker(latlng, markerOptions);
  //build popup content string
    createPopup(feature.properties, attribute, layer, markerOptions.radius);

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Step: Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){ //response is passed as data
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }// pointToLayer option  passes along parameters feature and latlng to the anonymous function; add third parameter to pointToLayer() function
/* 		filter: function(feature,layer){
			return feature.properties[attribute]>filterMin && feature.properties[attribute] < filterMan
		} */
    }).addTo(map);
};
function layerVisControls(layer){
  var markerOption_1 = {opacity: 1, fillOpacity: 0.8};
  var markerOption_2 = {opacity: 0, fillOpacity: 0};
 if (layer.feature.properties.visible==1){
   layer.setStyle(markerOption_1);
 } else{
   layer.setStyle(markerOption_2);
 }
};
//callback function of filter operator
function updateLayerVis(map,filterUpper,attributes){
  var index = $('.range-slider').val();
  $( "#yr" ).text(attributes[index].slice(2))

  //console.log(index)
  //console.log($( "#yr" ).text())
  attribute=attributes[index]
  map.eachLayer(function(layer){
    if (layer.feature && layer.feature.properties[attribute]){
      var props=layer.feature.properties;

      var attValue= props[attribute];
      attValue= attValue=""? 0:Number(attValue)
      if (attValue<=filterUpper){
        props.visible=1;
        //console.log(props.visible)
      }else{
        props.visible=0;
      //  console.log(props.visible)

      };
    layerVisControls(layer)
    }
});
};
//The 5th operator: filter (double ended range slider)

//Step: Resize proportional symbols according to new attribute values
function updatePropSymbols(map,attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute] && layer.feature.properties.visible>0){
          var props = layer.feature.properties; //access feature properties
          //update each feature's radius based on new attribute values
          var attValue= props[attribute];
          attValue= attValue=""? 0:Number(attValue)
          var radius = calcRadius(attValue);
          layer.setRadius(radius);
          createPopup(props, attribute, layer, radius);

        };
    });
};


// Create new sequence controls (HTML range slider)
function createSequenceControls(map, attributes){

  var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function (map) {
            // create a new <div> for the control container while assigning a class name 'container'
            var container = L.DomUtil.create('div', 'sequence-control-container');

            // ... initialize other DOM elements, add listeners, etc.
            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');
            //add skip buttons
            $(container).append('<button class="skip" id="reverse" title="Reverse">Previous</button>');
            $(container).append('<button class="skip" id="forward" title="Forward">Next</button>');
          //disable any mouse event listeners for the container
          L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });

    map.addControl(new SequenceControl());

    //create range input element (slider)
    //$('#panel').append('<input class="range-slider" type="range">');
    //set slider attributes
        $('.range-slider').attr({
            max: 11,
            min: 0,
            value: 0,
            step: 1
        });
  //  $('#panel').append('<button class="skip" id="reverse">Previous</button>');
    //$('#panel').append('<button class="skip" id="forward">Next</button>');
    $('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');
    //Step: click listener for skip buttons
    $('.skip').click(function(){
        //sequence
        var index = $('.range-slider').val();//get the old index value
        // increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){ // index increase when event applied to item with id "forward" (i.e. the Next button)
            index++;
            index = index > 11 ? 0 : index;//if past the last attribute, wrap around to first attribute
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            index = index < 0 ? 11 : index; // if past the first attribute, wrap around to last attribute
        };
        //Step 8: update slider
        $('.range-slider').val(index); //update the value of the slider=our new index(??)
        //console.log(index)

        updatePropSymbols(map, attributes[index]);
        updateLegend(map, attributes[index]);
    });

    //Step: input listener for slider
    $('.range-slider').on('input', function(){
      var index = $(this).val();// get the new index value=val(),the current value of the element that fired the event
      //console.log(index)
      updatePropSymbols(map, attributes[index]);
    });
};
function createFilterControls(map,attributes){
 $('#panel').append('<input class="filter-slider" type="range">');
 $('#panel').append('<p> Only show countries with index score below <span id="amt"></span> as of year <span id="yr"></span>.</p>');
$( "#amt" ).text(1)
$( "#yr" ).text(attributes[0].slice(2))
 $( ".filter-slider" ).attr({ //initialize the slider
       min: 0,
       max: 1,
       value: 1,
       step: 0.1
       });

     $('.filter-slider').on('input', function(){
       var filterUpper = $(this).val();//get the new upper bound from slider position
       $( "#amt" ).text(filterUpper)

       updateLayerVis(map,filterUpper,attributes);
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
        if (attribute.indexOf("yr") ==0){  //property name starting with 'yr'
            attributes.push(attribute); //push() method adds new items to the end of an array
        };
    };

    //check result
    //console.log(attributes);
    var i;
    for (i=0; i<data.features.length;i++){
      data.features[i].properties['visible']=1;
    };

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
            createPropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);
            createFilterControls(map,attributes);
            createLegend(map, attributes);
        }
    });
};

$(document).ready(createMap);
