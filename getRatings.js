function getEpisodes() {
	var seasons = {};
	var title = document.getElementById("title").value.trim().replace(/\s+/g, "+");
	var url = "http://www.omdbapi.com/?t=" + title + "&type=series";
	var id;
	var numSeasons;
	var seasonsCompleted;
	$.ajax({
		async : false,
		type : "get",
		url : url, 
		success : function(data) {
			console.log(data);
			id = data.imdbID;
			numSeasons = data.totalSeasons;
			//var seasons = {};
			for(var i = 1; i <= numSeasons; ++i) {
				$.ajax({
					async : false,
					type : "get",
					url : "http://www.omdbapi.com/?t=" + id + "&Season=" + i + "&plot=full",
					success : function(data) {
						seasons[i] = data		
					}
				});
			}
		},
	
	});
	for(var i = 1; i <= numSeasons; ++i) {
		document.body.innerHTML += "=============" + i + "===============";
		var maxEpisode = 0;
		for(var j = 0; j < seasons[i].Episodes.length; ++j) {
			document.body.innerHTML += "<p>" + seasons[i].Episodes[j].Episode + ". " + seasons[i].Episodes[j].Title + " - Rating: " + seasons[i].Episodes[j].imdbRating + "</p>";
			if(seasons[i].Episodes[j].Episode > maxEpisode) {
				maxEpisode = parseInt(seasons[i].Episodes[j].Episode);
			}
		}
		if(maxEpisode > seasons[i].Episodes.length) {
			alert("Missing for season: " + i);
		}
	}
	document.body.innerHTML += "<button> Missing Epsidoes or Missing ratings? Click Here </button>";
}

function getPlot(show, season, episode) {
	$.get("http://www.omdbapi.com/?t=" + show + "&Season=" + season + "&Episode=" + episode, function(data) {
		console.log(season + " " + episode + " " + data.Plot);		
	});
}




function getSeasonAndEpisode(str) {
	var match = str.match(/\d+\.\d+/g);
	if(match) {
		match = match[0].split(".");
		return {"season" : parseInt(match[0]), "episode" : parseInt(match[1])};
	} else {
		return {"season" : -1, "episode" : -1};
	}
}

function getEpisodeTitle(str) {
	var inBracket = false;
	var ret = "";
	for(var i = 0; i < str.length; ++i) {
		if(str[i] == "<") {
			inBracket = true;
		} else if(str[i] == ">") {
			inBracket = false;
		} else if(!inBracket) {
			ret += str[i];
		}
	}
	return ret.trim();
}

function getRating(str) {
	//console.log(str);
	return parseFloat(str.match(/\d+\.\d{1}/)[0]);
}






function getEpisodesAndRatings(title) {
	var seasons = {};	
	var numEpisodes = 0;
	var sum = 0;
	var numNoRating = 0;
	title = title.trim().replace(/\s+/g, "%20");
	$.ajax({
		async : false,
		type : "get",
		url : "http://www.omdbapi.com/?t=" + title + "&type=series",
		success : function(data) {
			var titleId = data.imdbID;
			$.ajax({
				async : false,
				type : "get",
				url : "getEpisodes.php?title=" + titleId,
				success : function(data) {
					data = data.split("\n");
					var inTableEntry = false;
					for(var i = 0; i < data.length; ++i) {
						if(data[i] == "<tr>") {
							console.log(data[i]);
							inTableEntry = true;
							i += 1;
							console.log(data[i]);
							var seasonAndEpisode = getSeasonAndEpisode(data[i]);
							var season = seasonAndEpisode["season"];
							if(seasons[season] == undefined) {
								seasons[season] = [];
							}
							var episode = {};
							episode["episode"] = seasonAndEpisode["episode"];
							i += 1;
							console.log(data[i]);
							episode["title"] = getEpisodeTitle(data[i]);
							i += 1;
							console.log(data[i]);
							if(data[i] != "</tr>") {
								episode["rating"] = getRating(data[i]);
								sum += episode["rating"];
							} else {
								episode["rating"] = 0;
								numNoRating += 1;
							}
							//console.log(episode);
							seasons[season].push(episode);
							numEpisodes += 1;
						} else if(data[i] == "</tr>") {
							inTableEntry = false;
						} 
					}
				}
			});
		}
	});
	console.log(seasons);
	for(x in seasons) {
		//document.body.innerHTML += "<br>" + x + "<br>";
		for(var i = 0; i < seasons[x].length; ++i) {
			//document.body.innerHTML += seasons[x][i].episode + " " + seasons[x][i].title + " " + seasons[x][i].rating + "<br>";
		}
	}
	seasons["numEpisodes"] = numEpisodes;
	seasons["average"] = sum/(numEpisodes - numNoRating);
	console.log(seasons.average);
	console.log(seasons);
	graphRatings(seasons)
}



function drawLine(gc, startX, startY, endX, endY) {
	gc.beginPath();
	gc.moveTo(startX, startY);
	gc.lineTo(endX, endY);
	gc.stroke();
}



function graphRatings(seasons) {
	var canvasWidth = $(window).width()*0.9
	var canvasHeight = $(window).height()*0.9;
	document.body.innerHTML += "<canvas id='graph' width=" + canvasWidth + "px height=" + canvasHeight + "px></canvas>";
	var canvas = document.getElementById("graph");
	var gc = canvas.getContext("2d");
	gc.fillRect(0, 0, canvasWidth, canvasHeight);
	var size = 0.9;
	var startX = canvasWidth*(1-size);
	var endX = canvasWidth*size;
	var startY = canvasHeight*(1-size);
	var endY = canvasHeight*size;
	gc.strokeStyle = "lightgrey";
	gc.lineWidth = 4;
	//x-axis
	drawLine(gc, startX, startY, startX, endY);
	//y-axis
	drawLine(gc, startX, endY, endX, endY);
	gc.lineWidth = 1;
	gc.fillStyle = "lightgrey";
	var fontSize = 10;
	gc.fontSize = fontSize;

	//rating tics
	var offSet = gc.measureText("10").width;
	gc.lineWidth = 1;
	for(var i = 1; i <= 10; ++i) {
		var yPos = (endY-startY)/11 * i + startY;
		drawLine(gc, startX - offSet, yPos, endX, yPos);
		gc.fillText(11-i, startX-2*offSet, yPos);
	}


	gc.lineWidth = 1;
	//+1 so it doesn't hit the edge of the chart
	var offSet = (endX-startX)/(seasons.numEpisodes-1);
	//Want to start first episode not on the axis
	var xPos = startX;
	console.log(startX, endX);
	console.log(xPos, offSet);
	var prevPoint = [];

	var seasonXs = [];
	for(season in seasons) {
		console.log(season);
		for(var i = 0; i < seasons[season].length; ++i) {
			if(i === 0) {
				drawLine(gc, xPos, startY, xPos, endY);
				//var str = "Season " + season;
				//gc.fillText(str, xPos - gc.measureText(str).width/2.0, endY + 2*fontSize);
				seasonXs.push(xPos);
			}
			//console.log(i);
			var yPos = endY - ((endY - startY) * seasons[season][i].rating / 11);
			//console.log(yPos);
			if(prevPoint != []) {
				drawLine(gc, prevPoint[0], prevPoint[1], xPos, yPos);
			}
			//console.log(xPos, endX);
			prevPoint = [xPos, yPos];
			gc.beginPath();
			gc.ellipse(xPos, yPos, 1, 1, 0, 0, 2*Math.PI);
			gc.stroke();
			//gc.fillText(seasons[season][i].rating, xPos-5, yPos+10);
			xPos += offSet;
		}
	}
	drawLine(gc, xPos-offSet, startY, xPos-offSet, endY);
	seasonXs.push(xPos-offSet);
	for(var i = 1; i < seasonXs.length; ++i) {
		var str = "Season " + i;
		var xPos = seasonXs[i-1] + (seasonXs[i] - seasonXs[i-1])/2;
		gc.fillText(str, xPos - gc.measureText(str).width/2.0, endY + 2*fontSize);
	}
}




















