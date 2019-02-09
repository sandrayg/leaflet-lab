//initialize function called when the script loads
function initialize(){
	cities();
};

//function to create a table with cities and their populations
function cities(){
	//define two arrays for cities and population
	var cityPop = [
		{
			city: 'Madison',
			population: 233209
		},
		{
			city: 'Milwaukee',
			population: 594833
		},
		{
			city: 'Green Bay',
			population: 104057
		},
		{
			city: 'Superior',
			population: 27244
		}
	];

	//append the table element to the div
	$("#mydiv").append("<table>");

	//append a header row to the table
	$("table").append("<tr>");

	//add the "City" and "Population" columns to the header row
	$("tr").append("<th>City</th><th>Population</th>");

	//loop to add a new row for each city
    for (var i = 0; i < cityPop.length; i++){
        //assign longer html strings to a variable
        var rowHtml = "<tr><td>" + cityPop[i].city + "</td><td>" + cityPop[i].population + "</td></tr>";
        //add the row's html string to the table
        $("table").append(rowHtml);
    };

    addColumns(cityPop);
    addEvents();
};

function addColumns(cityPop){ //add a column called "cityPop" which denotes whether a city is small,medium or large based on population threshold
    $('tr').each(function(i){
    	if (i == 0){

    		$(this).append('<th>City Size</th>'); //miss-spelling of "append" corrected
    	} else {

    		var citySize;

    		if (cityPop[i-1].population < 100000){ //conditional statements that assigns size indicator based on population of a city
    			citySize = 'Small';

    		} else if (cityPop[i-1].population < 500000){
    			citySize = 'Medium'; //lower case 's' corrected

    		} else {
    			citySize = 'Large';
    		};
				//append the city size indicator to the current table row in the third column
    		$(this).append('<td>' + citySize + '</td>'); //$(this) corrected, which selects the current element identified by tag 'tr';missing '>' added

    	};
			i++
    });
};
// defines a function that
function addEvents(){

	$('table').mouseover(function(){ //defines a function that will be executed when the event 'mouseover' occurs to element 'table'
	//$('table') refers to elements identified by tag 'table', compared to $('#table'), elements with attr. id='table'
		var color = "rgb("; // contains a string that will take the form rgb(  ,  ,  )

		for (var i=0; i<3; i++){

			var random = Math.round(Math.random() * 255); // generate a random number between 0 and 255

			color += random; // corrected; concatenate to the string variable color the random number generated in the previous step

			if (i<2){
				color += ","; //attach a comma unless the last item

			} else {
				color += ")";
		};

		$(this).css('color', color); //sets the value of the  style attribute 'color' to be the rgb scheme that was randomly generated
	}}); //missing a } to close the definition of the anonymous function for mouseover event

	function clickme(){ // define a function that triggers alert message

		alert('Hey, you clicked me!');
	};

	$('table').on('click', clickme); //event listener method applied to 'table' element, for which the event to be listened for is 'click', and the handler function 'clickme' defined previously
};

//call the initialize function when the document has loaded
$(document).ready(initialize);
