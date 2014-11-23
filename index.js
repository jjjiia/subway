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
var redlineLabels = ["alewife","davis","porter","harvard","central","kendall","charles mgh","park street","downtown crossing","south station","broadway","andrew","jfk umass","north quincy","wollaston","quincy center","quincy adams","braintree"]

function drawLineGraph(data){
    data.forEach(function(d) {
        d.station = d.station
        d.mean= +parseInt(d.mean);
    });
	var margin = {top: 30, right: 20, bottom: 130, left: 50},
	    width = 600 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;
	// Set the ranges
	var x = d3.scale.linear().range([0, width]);
	var y = d3.scale.linear().range([height, 0]);

	// Define the axes
	var xAxis = d3.svg.axis().scale(x)
	    .orient("bottom").ticks(15)
		.tickFormat(formatStop);;

	var yAxis = d3.svg.axis().scale(y)
	    .orient("left").ticks(16)
		.tickFormat(formatCurrency);
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
	   .attr("stroke", "#dd2222")
   		.attr("stroke-width",2);

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
   		.selectAll("text")
       .attr("y", 0)
       .attr("x", 9)
       .attr("dy", ".35em")
       .attr("transform", "rotate(90)")
       .style("text-anchor", "start");
    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
}
function formatStop(d,i) {
	return capitaliseFirstLetter(redlineLabels[i])
}
function formatCurrency(d) {
	return "$" + d;
}
function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}