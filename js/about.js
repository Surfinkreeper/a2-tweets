function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	let earliest_time = tweet_array[0].time
	let latest_time = tweet_array[0].time

	for( let i = 0; i < tweet_array.length; i++ ) {
		let current_time = tweet_array[i].time;

		if (current_time < earliest_time) {
			earliest_time = current_time
		}
		if (current_time > latest_time) {
			latest_time = current_time
		}
	}
	
	const options = {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric"
	}

	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;
	document.getElementById('firstDate').innerText = earliest_time.toLocaleDateString('en-US', options)
	document.getElementById('lastDate').innerText = latest_time.toLocaleDateString('en-US', options)
	categorizeTweets(tweet_array)
}

function categorizeTweets(tweet_array) {
	let completedCount = 0;
	let liveCount = 0;
	let achievementCount = 0;
	let miscCount = 0;
	let writtenCount = 0;

	for( let i = 0; i < tweet_array.length; i++ ) {
		if (tweet_array[i].source == "achievement") {
			achievementCount++;
		}
		else if (tweet_array[i].source == "live_event") {
			liveCount++;
		}
		else if (tweet_array[i].source == "completed_event") {
			completedCount++;
			if (tweet_array[i].written) {
				writtenCount++;
			}
		}
		else {
			miscCount++;
		}
	}

	let completedCountPct = String(math.round((completedCount/tweet_array.length)*100, 2)) + "%";
	let liveCountPct = String(math.round((liveCount/tweet_array.length)*100, 2)) + "%";
	let achievementCountPct = String(math.round((achievementCount/tweet_array.length)*100, 2)) + "%";
	let miscCountPct = String(math.round((miscCount/tweet_array.length)*100, 2)) + "%";
	let writtenCountPct = String(math.round((writtenCount/completedCount)*100, 2)) + "%";


	document.getElementsByClassName("completedEvents")[0].innerText = completedCount;
	document.getElementsByClassName("liveEvents")[0].innerText = liveCount;
	document.getElementsByClassName("achievements")[0].innerText = achievementCount;
	document.getElementsByClassName("miscellaneous")[0].innerText = miscCount;

	document.getElementsByClassName("completedEventsPct")[0].innerText = completedCountPct;
	document.getElementsByClassName("liveEventsPct")[0].innerText = liveCountPct;
	document.getElementsByClassName("achievementsPct")[0].innerText = achievementCountPct;
	document.getElementsByClassName("miscellaneousPct")[0].innerText = miscCountPct;

	document.getElementsByClassName("completedEvents")[1].innerText = completedCount;
	document.getElementsByClassName("written")[0].innerText = writtenCount;
	document.getElementsByClassName("writtenPct")[0].innerText = writtenCountPct;

	
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});