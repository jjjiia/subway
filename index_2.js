
//TODO:

$(function() {
	// Window has loaded
	queue()
	//	.defer(d3.json, "static/geojson/lines.geojson")
		//.defer(d3.json, "static/geojson/stations.geojson")
		.defer(d3.json, stations)
		.defer(d3.json, data)
		.defer(d3.json, blocks)
		.await(dataDidLoad);
})

function dataDidLoad(error,stations,data,blocks) {
	//console.log(line)	
	//console.log(stops)
	var svg = d3.select("#subway")
		.append("svg")
		.attr("width",mapWidth)
		.attr("height",mapHeight);
	formatSubwayStopsByLine(stations,data,blocks,svg)
	drawAllBlocks(blocks,svg)
	
//	var lineColor = "red"
//	drawLineGraph(lineColor,stops_steve)
}
function drawAllBlocks(blocks,svg){
	var projection = d3.geo.mercator()
		.scale(scale)
		.center(center)
		.translate(translate)
	//	console.log(currentBlocks)
	var path = d3.geo.path()
		.projection(projection)
	var svg = svg
	svg.selectAll("path")
        .data(blocks.features)
        .enter()
        .append("path")
		.attr("class","blockBoundaries")
		.attr("d",path)
		.attr("stroke", "#aaa")
		.style("fill", "none")
	    .style("stroke-width", .5)
	    .style("opacity",.5)
}

function drawBlocks(blocks,currentCoordinates,data){
	var stationName = currentCoordinates[0]
	var currentData = data.stations[stationName]["blockgroups"]
	var currentBlocks = []
	//console.log(blocks)
	d3.selectAll("#subway .blockBoundaries").remove()
	for(var i in currentData){
		currentBlock = currentData[i][0]
		currentBlocks.push(currentBlock)
	}
	var projection = d3.geo.mercator()
		.scale(scale)
		.center(center)
		.translate(translate)
	//	console.log(currentBlocks)
		
	var path = d3.geo.path()
		.projection(projection)
	var svg = d3.select("#subway svg")
	svg.selectAll("path")
        .data(blocks.features)
        .enter()
        .append("path")
		.attr("class","blockBoundaries")
		.attr("d",path)
		.attr("stroke", "#000")
		.style("fill", "none")
	    .style("stroke-width", .5)
	    .style("opacity", function(d){
			//console.log(d.properties.LINE);
			if(currentBlocks.indexOf(d["GEO_ID"])>-1){
				return .5
			}else{
				return .1			
			}
		})
}
function calculateAverageIncome(blockgroups){
	//console.log(blockgroups.length)
	var sum = 0
	var populationTotal = 0
	for(var i in blockgroups){
		var blockgroup = blockgroups[i]
		var income = parseFloat(blockgroup[1]["SE_T057_001"])
		var population = parseFloat(blockgroup[1]["SE_T001_001"])
		var populationProportion = parseFloat(blockgroup[1]["pop_proportion"])
		if(isNaN(income)){
			income = 0
		}else{
			income = income*(population*populationProportion)
			sum +=income
			populationTotal = populationTotal+population*populationProportion
		}
	}
	//console.log([parseInt(sum),populationTotal,sum/populationTotal])
	return [blockgroups.length,populationTotal,sum/populationTotal]
}
function calculateLineWideAverage(){}
function calculateSystemWideAverage(){}
function calculateDistance(origin,coordinates){
	//console.log(origin)
	//console.log(coordinates)
	var lngDistance = Math.abs(origin[0]-coordinates[0])
	var latDistance = Math.abs(origin[1]-coordinates[1])
	var distance = Math.sqrt(Math.pow(lngDistance,2)+Math.pow(latDistance,2))
//	console.log(distance)
	return distance
}
function formatLineData(lineColor,data){
	var currentData = data.lines[lineColor]["stations"]
	//console.log(lineColor)
	var orderedStations = data.lines[lineColor]["primary_routes"][0]
	console.log([lineColor,orderedStations])
	var stationList = []
	var cummulativeDistance = 0
	//for each station, get groups and average data
	for(var station in orderedStations){
		var currentStation = orderedStations[station]
		console.log(currentStation)
		var originStation = orderedStations[0]
		//console.log([originStation,currentStation])
		var blockgroups = data.stations[currentStation]["blockgroups"]
		var coordinates = data.stations[currentStation]["coordinates"]
		var origin = data.stations[originStation]["coordinates"]
		//console.log(currentData[station])
		//console.log([income,coordinates])
		var income = calculateAverageIncome(blockgroups)[2]
		var distance = calculateDistance(origin,coordinates)
		cummulativeDistance = cummulativeDistance+distance
		stationList.push([currentStation,income,cummulativeDistance])
		
	}
	console.log(stationList)
	return stationList
}
function drawLineGraph(lineColor,data){
	var graphData = formatLineData(lineColor,data)
	//console.log(graphData[graphData.length-1])
	d3.select("#charts svg").remove()
	var margin = {top: 20, right: 20, bottom: 40, left: 50},
	    width = 500 - margin.left - margin.right,
	    height = 300 - margin.top - margin.bottom;
	var chartSvg = d3.select("#charts")
		.append("svg")
		.attr("width",width)
		.attr("height",height);
	var maxDistance = graphData[graphData.length-1][2]
	var incomes = []
		for(var i in graphData){
			if(isNaN(graphData[i][1])){
				incomes.push(0)
			}else{
				incomes.push(graphData[i][1])
			}
		}
	var maxIncome = Math.max.apply(null, incomes);
	//	console.log(incomes)
	//	console.log(maxIncome)
	var incomeScale = d3.scale.linear().domain([0,maxIncome]).range([height,0])
	var coordinateScale = d3.scale.linear().domain([0,maxDistance]).range([0,width])
	var xAxis = d3.svg.axis()
	    .scale(coordinateScale)
	    .orient("bottom");
		
	var yAxis = d3.svg.axis()
	    .scale( incomeScale)
	    .orient("left");
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
			
	var line = d3.svg.line()
		.x(function(d){
			//return d[1]
			return coordinateScale(d[2])
		})
		.y(function(d){
			var income = d[1]
			if(isNaN(income)){
				income = 100
			}
			return incomeScale(income)
		})
	
	chartSvg.append("path")
		.datum(graphData)
		.attr("class","line")
		.attr("d",line)
		.style("stroke", function(d){
			return d.line
		})
		.style("stroke-width", 1)
		.style("stroke", "red")
		.style("opacity",1)
}
function displayDataByStation(station,data){
	var blockgroups = data.stations[station]["blockgroups"]
	var averageIncome = calculateAverageIncome(blockgroups)
	return "average median income: "+parseInt(averageIncome[2])+"<br/>population: "+averageIncome[1]+"<br/>blocks: "+averageIncome[0]
}
function drawSubwayStops(blocks,currentCoordinates,data,svg,fill,radius){
	var projection = d3.geo.mercator()
		.scale(scale)
		.center(center)
		.translate(translate)

	svg.append("circle")
		.attr("cx", projection(currentCoordinates[1])[0]+radius)
		.attr("cy", projection(currentCoordinates[1])[1]+radius)
		.attr("r",3)
	    .style("fill",fill)
		.attr("opacity", 1)
		.attr("stroke","#fff")
		.on("mouseover", function(d){
			var station = data[0]	
			drawBlocks(blocks,currentCoordinates,data)
		//	var stationData = displayDataByStation(station,data)
			//d3.select("#station_rollover").html("stop:"+d.properties.STATION+"</br> line:"+d.properties.LINE+"</br>"+stationData)			
		})
		.on("mouseout",function(d){
//			d3.selectAll("."+d.properties.LINE).attr("opacity",.2)
//			d3.selectAll("."+clicked).attr("opacity",1)
//			d3.selectAll("#subway .blockBoundaries").attr("opacity",.1)
		})
		.on("click",function(d){
			clicked = d.properties.LINE
			d3.select("#chart-title").html("placeholder div for other thing")
			var lineColor = d.properties.LINE.split(",")
			for(var line in lineColor){
				var color = lineColor[line].replace(/\s/g, '')
				drawLineGraph(color,data)
			}
			d3.selectAll("path").attr("opacity",0.2)
			d3.selectAll("."+d.properties.LINE).attr("opacity",1)
		})
}
function buildStationLineDictionary(data){
	//console.log(data.lines)
	var stationLineDictionary = {}
	for(var line in data.lines){
		var currentLine = data.lines[line]
		//console.log(currentLine.stations)
		for(var station in currentLine.stations){
			var currentStation = currentLine.stations[station]
			var stationName = currentStation[0]
			var stationRoutes = currentStation[1]["ROUTE"]
			stationLineDictionary[stationName]=stationRoutes
		}
	}
	//console.log(stationLineDictionary)
	return stationLineDictionary
}
function formatSubwayStopsByLine(stops,data,blocks,svg){
	var stationLineDictionary = buildStationLineDictionary(data)
	var projection = d3.geo.mercator()
		.scale(scale)
		.center(center)
		.translate(translate)
	var stationData = data.lines
	var stationLocationData = data.stations
	var index = 0
	//console.log(stationLocationData)
	for(var route in stationData){
		index +=1
		var offset = index
		var currentRoute = stationData[route]["primary_routes"][0]
		var color = route
		drawSubwayLines(currentRoute,data,svg,color,offset)

		for(var station in currentRoute){
			var currentStation = currentRoute[station]
			var currentStationCoordinates = [currentStation,data.stations[currentStation].coordinates]
			//console.log(data.lines)
			var routes = stationLineDictionary[currentStation].split(",")
			for(var route in routes){
				var fill = colorDictionary[routes[route].replace(/\s+/g, '')]
				var radius = route*6
				//console.log([radius,fill])
				drawSubwayStops(blocks,currentStationCoordinates,data,svg,fill,radius)
			}
		}
	}
	
}
function drawSubwayLines(route,data,svg,color,offset){
//	console.log(route)
//	console.log(data)
	var routeLine = []
	for(var station in route){
		var currentStation = route[station]
		var coordinates = data.stations[currentStation].coordinates
		//console.log(coordinates)
		routeLine.push(coordinates)
	}
	var projection = d3.geo.mercator()
		.scale(scale)
		.center(center)
		.translate(translate)
		
var line = d3.svg.line()
    .x(function(d) { 
		return parseInt(projection(d)[0])+offset; 
	})
    .y(function(d) { 
		//console.log(["y",projection(d)[1]]);
		return parseInt(projection(d)[1])+offset; 
	});
		//var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d;});
	//	var clicked = null;
	svg.selectAll("path")
        .data(routeLine)
        .enter()
        .append("path")
	.attr("class",color)
		.attr("d",line(routeLine))
		.attr("fill","none")
		.style("stroke-width", 5)
		.style("stroke",colorDictionary[color])
	.on("mouseover", function(d){
 		d3.select("#chart-title").html(color)
 		d3.selectAll("."+d.properties.LINE).attr("opacity",1)
	})
	//	.on("mouseout",function(d){
	//		d3.selectAll("."+d.properties.LINE).attr("opacity",.2)
	//		d3.selectAll("."+clicked).attr("opacity",1)
	//	})
		.on("click",function(d){
//			clicked = d.properties.LINE
			var lineColor = color
//			d3.select("#chart-title").html(d.properties.LINE)
			drawLineGraph(lineColor,data)
			d3.selectAll("path").attr("opacity",0.2)
			d3.selectAll("."+d.properties.LINE).attr("opacity",1)
		})
}
