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

	let topThree = sortedEntries.slice(0, 3);
	let topThreeTweets = completedTweets.filter(function(tweet) {
		return topThree.includes(tweet.activityType);
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
		type: "nominal"
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
	distance_by_day = {
	"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	"description": "A graph of the distances of the top 3 most logged activities per day",
	"data": {
		"values": completedTweets
	},
	"mark": "bar",
	"encoding": {
		x: {
		field: "activityType",
		type: "nominal"
		},
		y: {
		aggregate: "count",
		type: "quantitative"
		}
	}
	};
	vegaEmbed('#distanceVis', distance_by_day, {actions:false});
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