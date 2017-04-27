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
	var match = str.match(/\d+\.\d+/g)[0].split(".");
	return {"season" : parseInt(match[0]), "episode" : parseInt(match[1])};
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
	return parseFloat(str.match(/\d{1}\.\d{1}/)[0]);
}






function getEpisodesAndRatings(title) {
	var seasons = {};	
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
							//console.log(data[i]);
							inTableEntry = true;
							i += 1;
							//console.log(data[i]);
							var seasonAndEpisode = getSeasonAndEpisode(data[i]);
							var season = seasonAndEpisode["season"];
							if(seasons[season] == undefined) {
								seasons[season] = [];
							}
							var episode = {};
							episode["episode"] = seasonAndEpisode["episode"];
							i += 1;
							//console.log(data[i]);
							episode["title"] = getEpisodeTitle(data[i]);
							i += 1;
							//console.log(data[i]);
							if(data[i] != "</tr>") {
								episode["rating"] = getRating(data[i]);
							} else {
								episode["rating"] = -1;
							}
							//console.log(episode);
							seasons[season].push(episode);
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
		document.body.innerHTML += "<br>" + x + "<br>";
		for(var i = 0; i < seasons[x].length; ++i) {
			//console.log(seasons[x]);
			document.body.innerHTML += seasons[x][i].episode + " " + seasons[x][i].title + " " + seasons[x][i].rating + "<br>";
		}
	}
}





