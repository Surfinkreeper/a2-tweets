function parseTweets(runkeeper_tweets) {

	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	let completedTweets = tweet_array.filter(function(tweet) {
		return tweet.source == 'completed_event';
	});

	let activityCounts = {}; 
	for (let tweet of completedTweets) {
		let type = tweet.activityType;
		if (activityCounts[type] === undefined) {
			activityCounts[type] = 0;
		}
		activityCounts[type]++;
	}
	
	const sortedEntries = Object.entries(activityCounts).sort((a, b) => b[1] - a[1]);

	document.getElementById('numberActivities').innerText = sortedEntries.length;
	document.getElementById('firstMost').innerText = sortedEntries[0][0];
	document.getElementById('secondMost').innerText = sortedEntries[1][0];
	document.getElementById('thirdMost').innerText = sortedEntries[2][0];

	let longestType = sortedEntries[0];
	let shortestType = sortedEntries[0];
	let longestAverage = -1;
	let shortestAverage = Infinity;
	for (let i = 0; i < 3; i++) {
		let type = sortedEntries[i][0]
		let tweetsOfType = completedTweets.filter(function(tweet) {
			return tweet.activityType == type;
		});
		let average = averageDistance(tweetsOfType);
		if (average > longestAverage) {
			longestAverage = average;
			longestType = type;
		}
		if (average < shortestAverage) {
			shortestAverage = average;
			shortestType = type;
		}
	}

	let topThreeNames = [sortedEntries[0][0], sortedEntries[1][0], sortedEntries[2][0]];
	let topThreeTweets = completedTweets.filter(function(tweet) {
		return topThreeNames.includes(tweet.activityType);
	});
	let weekdayTweets = topThreeTweets.filter(function(tweet) {
		let day = tweet.time.getDay();
		return day >= 1 && day <= 5;
	});
	let weekendTweets = topThreeTweets.filter(function(tweet) {
		let day = tweet.time.getDay();
		return day === 0 || day === 6;
	});
	if (averageDistance(weekendTweets) > averageDistance(weekdayTweets)) {
		document.getElementById('weekdayOrWeekendLonger').innerText = 'weekends';
	} else {
		document.getElementById('weekdayOrWeekendLonger').innerText = 'weekdays';
	}

	document.getElementById('longestActivityType').innerText = longestType;
	document.getElementById('shortestActivityType').innerText = shortestType;

	// Streaming data to store pointData and meanData
	let pointData = topThreeTweets.map(function(tweet) {
		return {
			day_number: tweet.day_number,
			activityType: tweet.activityType,
			distance: tweet.distance
		};
	});

	let meanData = [];
	for (let name of topThreeNames) {
		for (let day = 0; day < 7; day++) {
			let matches = pointData.filter(function(p) {
				return p.activityType === name && p.day_number === day;
			});

			if (matches.length > 0) {
				let total = 0;
				for (let m of matches) {
					total += m.distance;
				}
				meanData.push({
					day_number: day,
					activityType: name,
					distance: total / matches.length
				});
			}
		}
	}

	//TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.


	activity_vis_spec = {
	"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	"description": "A graph of the number of Tweets containing each type of activity.",
	"data": {
		"values": completedTweets
	},
	"mark": "bar",
	"encoding": {
		x: {
			field: "activityType",
			type: "nominal",
			title: "Activity",
			sort: "-y"
		},
		y: {
			aggregate: "count",
			type: "quantitative"
		}
	}
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.

	// Button graph swapping
	let showingMeans = false;

	drawDistanceChart(pointData, "Distance traveled");

	document.getElementById('aggregate').addEventListener('click', function() {
		if (showingMeans) {
			drawDistanceChart(pointData, "Distance traveled");
			this.innerText = 'Show means';
			showingMeans = false;
		} else {
			drawDistanceChart(meanData, "Mean distance traveled");
			this.innerText = 'Show all activities';
			showingMeans = true;
		}
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});

function averageDistance(tweets) {
	let total = 0;
	let count = 0;
	for (let tweet of tweets) {
		if (tweet.distance > 0) {
			total += tweet.distance;
			count++;
		}
	}
	if (count === 0) {
		return 0;
	}
	return total / count;
}

function drawDistanceChart(data, yTitle) {
	let distance_by_day = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "Distances of the top 3 most logged activities per day",
		"data": { "values": data },
		"mark": "point",
		"encoding": {
			x: {
				field: "day_number",
				type: "ordinal",
				title: "Day of the week",
				axis: {
					grid: true,
					labelExpr: "['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][datum.value]"
				}
			},
			y: {
				field: "distance",
				type: "quantitative",
				title: yTitle
			},
			color: {
				field: "activityType",
				type: "nominal"
			}
		}
	};
	vegaEmbed('#distanceVis', distance_by_day, {actions: false});
}