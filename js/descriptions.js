let writtenTweets = [];

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//TODO: Filter to just the written tweets
	let tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	writtenTweets = tweet_array.filter(function(tweet) {
		return tweet.written;
	});
	updateTable("");
}

function addEventHandlerForSearch() {
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table
	let searchBox = document.getElementById("textFilter")
	searchBox.addEventListener('input', function() {
		updateTable(searchBox.value);
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});

function updateTable(search_text) {
	let searchCount = document.getElementById("searchCount");
	let searchText = document.getElementById("searchText");

	// Update search text
	searchText.innerText = search_text;

	// Search
	let count = 0;
	let table_data = "";

	if (search_text != "") {
		let lowerSearch = search_text.toLowerCase();
		for (let i = 0; i < writtenTweets.length; i++) {
			let tweet = writtenTweets[i];
			let tweet_lower = tweet.writtenText.toLowerCase();

			if (tweet_lower.includes(lowerSearch)) {
				count++;
				table_data += tweet.getHTMLTableRow(count);
			}
		}
	}
	document.getElementById("tweetTable").innerHTML = table_data
	searchCount.innerText = count
}