console.log("file name:" + csv)
function dataDidLoad(error, data) {
	var data = data
	drawLineGraph(data)
}

$(function() {
	// Window has loaded
	queue()
		.defer(d3.csv, csv)
		.await(dataDidLoad);
})

function drawLineGraph(data){
    data.forEach(function(d) {
        d.station = d.station
        d.mean= +parseInt(d.mean);
    });
	var margin = {top: 30, right: 20, bottom: 30, left: 50},
	    width = 800 - margin.left - margin.right,
	    height = 270 - margin.top - margin.bottom;
	// Set the ranges
	var x = d3.scale.linear().range([0, width]);
	var y = d3.scale.linear().range([height, 0]);

	// Define the axes
	var xAxis = d3.svg.axis().scale(x)
	    .orient("bottom").ticks(15);

	var yAxis = d3.svg.axis().scale(y)
	    .orient("left").ticks(10);

	// Define the line
	var valueline = d3.svg.line()
	    .x(function(d,i) { return x(i); return x(d.station); })
	    .y(function(d) { return y(parseInt(d.mean)); });
    
	// Adds the svg canvas
	var svg = d3.select("#containers")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", 
		  "translate(" + margin.left + "," + margin.top + ")");
    // Scale the range of the data
    x.domain(d3.extent(data, function(d,i) { return i; }));
   // y.domain([0, d3.max(data, function(d) { return parseInt(d.mean); })]);
   y.domain([0,150000])
    // Add the valueline path.
    svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(data))
		.attr("fill","none")
	   .attr("stroke", "#ff0000");

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
}