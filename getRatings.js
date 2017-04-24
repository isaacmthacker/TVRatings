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
			seasons = {};
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
		for(var j = 0; j < seasons[i].Episodes.length; ++j) {
			document.body.innerHTML += "<p>" + (j+1) + ". " + seasons[i].Episodes[j].Title + " - Rating: " + seasons[i].Episodes[j].imdbRating + "</p>";
		}
	}
}

function getPlot(show, season, episode) {
	$.get("http://www.omdbapi.com/?t=" + show + "&Season=" + season + "&Episode=" + episode, function(data) {
		console.log(season + " " + episode + " " + data.Plot);		
	});
}


