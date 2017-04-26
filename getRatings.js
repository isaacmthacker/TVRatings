function getEpisodes() {
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
			var seasons = {};
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



function scrapeIMDB(titleID, numSeasons) {
	var seasons = {};
	for(var i = 1; i <= numSeasons; ++i) {
		seasons[i] = [];
		$.ajax({
			async : false,
			url : "getIMDBData.php?id=" + titleID + "&season=" + i,
			type : "get",
			success : function(data) {
				data = data.split("\n");

				var curEpisode = {};
				var numEpisodes = 0;
				var inEpisode = false;
				var foundId = false;
				for(var j = 0; j < data.length; ++j) {
					var match = data[j].match(/S\d+, Ep\d+/);
					if(match) {
						seasons[i].push(curEpisode);
						curEpisode = {};
						foundId = false;
						inEpisode = true;
						var str = match[0];
						str = str.match(/\d+/g);
						var season = str[0];
						var episode = str[1];
						curEpisode["season"] = season;
						curEpisode["episode"] = episode;
					} else if(inEpisode && !foundId) {
						var match = data[j].match(/tt\d{7}/);
						if(match) {
							var id = match[0];
							curEpisode["id"] = id;
							foundId = true;
						}
					}
				}
			}
		});
	}
	console.log(seasons);
}









