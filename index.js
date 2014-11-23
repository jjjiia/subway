$(function() {
	// Window has loaded
	queue()
		.defer(d3.json, "static/geojson/lines.geojson")
		.defer(d3.json, "static/geojson/stations.geojson")
		.await(dataDidLoad);
})

function dataDidLoad(error, line, stops) {
	//console.log(line)	
	//console.log(stops)
	drawLineGraph(line,stops)
}



function drawLineGraph(lines,stops){
	//console.log(stops)
	var width = 600;
	var height = 620;
	var svg = d3.select("#subway")
			.append("svg")
			.attr("width",width)
			.attr("height",height);
	
	var projection = d3.geo.mercator()
		.scale([90000])
		.center([ -71.11,42.319771])
		.translate([width/2,height/2])
		
	var path = d3.geo.path()
		.projection(projection)
		
	var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d;});
		
	svg.selectAll("path")
        .data(lines.features)
        .enter()
        .append("path")
		.attr("d",path)
		.attr("opacity", 0.5)
		.style("fill", "none")
        .style("stroke-width", "2")
        .style("stroke", function(d){
			//console.log(d.properties.LINE);
			return d.properties.LINE
		})
			
	svg.selectAll("circle")
		.data(stops.features)
		.enter()
		.append("circle")
		.attr("cx", function(d){
			return projection(d.geometry.coordinates)[0]
		})
		.attr("cy", function(d){
			console.log(d.properties.LINE,",",d.properties.STATION,",",d.geometry.coordinates[1],",",d.geometry.coordinates[0])
			return projection(d.geometry.coordinates)[1]
		})
		.attr("r", 4)
        .style("fill", function(d){
			return d.properties.LINE
		})
		.style("stroke","white")
		.attr("opacity", 0.5)
		.on("mouseover", function(d){
			d3.select("#chart-title").html(d.properties.STATION)
		})
}
