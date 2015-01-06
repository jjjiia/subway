$(function() {
	// Window has loaded
	queue()
		.defer(d3.json, "static/geojson/lines.geojson")
		.defer(d3.json, "static/geojson/stations.geojson")
		.defer(d3.csv,"testData.csv")
		.await(dataDidLoad);
})

function dataDidLoad(error, line, stops, data) {
	//console.log(line)	
	//console.log(stops)
	drawSubwayLines(line,stops,data)
	var lineColor = "red"
	drawLineGraph(lineColor,data)
}

function drawLineGraph(lineColor,data){
	d3.select("#charts svg").remove()
	//console.log(data)
	var margin = {top: 20, right: 20, bottom: 40, left: 50},
	    width = 500 - margin.left - margin.right,
	    height = 300 - margin.top - margin.bottom;
	var chartSvg = d3.select("#charts")
		.append("svg")
		.attr("width",width)
		.attr("height",height);
	var incomeScale = d3.scale.linear().domain([0,100000]).range([height,0])
	var coordinateScale = d3.scale.linear().domain([42.2,42.5]).range([0,width])
	var xAxis = d3.svg.axis()
	    .scale(coordinateScale)
	    .orient("bottom");
		
	var yAxis = d3.svg.axis()
	    .scale( incomeScale)
	    .orient("left");
		
	var line = d3.svg.line()
		.x(function(d){
			return coordinateScale(d.lat)
		})
		.y(function(d){
			var income = parseFloat(d.median)+Math.random()*10000
			return incomeScale(income)
		})
    chartSvg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
		
	chartSvg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      	.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Median Income ($)");
		
	chartSvg.append("path")
		.datum(data)
		.attr("class","line")
		.attr("d",line)
		.style("stroke", function(d){
			return d.line
		})
}

function drawSubwayLines(lines,stops,data){
	//console.log(stops)
	var width = 500;
	var height = 500;
	var svg = d3.select("#subway")
			.append("svg")
			.attr("width",width)
			.attr("height",height);
	
	var projection = d3.geo.mercator()
		.scale([90000])
		.center([ -71.11,42.322771])
		.translate([width/2,height/2])
		
	var path = d3.geo.path()
		.projection(projection)
		
	var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d;});
		
	svg.selectAll("path")
        .data(lines.features)
        .enter()
        .append("path")
		.attr("class", function(d){
			return d.properties.LINE
		})
	//	.attr("class","path")
		.attr("d",path)
		.attr("opacity", 0.3)
		.style("fill", "none")
        .style("stroke-width", "4")
        .style("stroke", function(d){
			//console.log(d.properties.LINE);
			return d.properties.LINE
		})
		.on("mouseover", function(d){
			d3.select("#chart-title").html(d.properties.STATION)
			d3.selectAll("."+d.properties.LINE).attr("opacity",1)
		})
		.on("mouseout",function(d){
			d3.selectAll("."+d.properties.LINE).attr("opacity",.3)
		})
		.on("click",function(d){
			var lineColor = d.properties.LINE
			d3.select("#chart-title").html(d.properties.LINE)
			drawLineGraph(lineColor,data)
			d3.selectAll("path").attr("opacity",0.3)
			d3.selectAll("."+d.properties.LINE).attr("opacity",1)
		})	
	svg.selectAll("circle")
		.data(stops.features)
		.enter()
		.append("circle")
		.attr("cx", function(d){
			return projection(d.geometry.coordinates)[0]
		})
		.attr("cy", function(d){
			return projection(d.geometry.coordinates)[1]
		})
		.attr("r", 2)
        .style("fill", function(d){
			return d.properties.LINE
		})
		.attr("class", function(d){
			return d.properties.LINE
		})
		.style("stroke","white")
		.attr("opacity", 1)
		.on("mouseover", function(d){
			d3.select("#chart-title").html(d.properties.STATION)
			d3.select(this).style("fill", "#000000")
			d3.selectAll("."+d.properties.LINE).attr("opacity",1)
		})
		.on("mouseout",function(d){
			d3.select(this).style("fill", function(d){
				return d.properties.LINE
			})
			d3.selectAll("."+d.properties.LINE).attr("opacity",.3)
		})
		.on("click",function(d){
			d3.select("#chart-title").html(d.properties.LINE)
			var lineColor = d.properties.LINE
			drawLineGraph(lineColor,data)
			d3.selectAll("path").attr("opacity",0.3)
			d3.selectAll("."+d.properties.LINE).attr("opacity",1)
		})
}
