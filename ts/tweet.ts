class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        if (this.text.includes("Achieved") || this.text.includes("achieved")) {
            return "achievement";
        }
        else if (this.text.includes("#RKLive")) {
            return "live_event";
        }
        else if (
            this.text.includes("Just completed") ||
            this.text.includes("Just posted") ||
            this.text.startsWith("Completed a") ||
            this.text.includes("I just completed")
        ) {
            return "completed_event";
        }
        return "miscellaneous";
    }

     private get cleanedText():string {
        let kept:string[] = [];
        for (let word of this.text.split(" ")) {
            if (word.startsWith("https://t.co/")) continue;
            if (word.toLowerCase() === "#runkeeper") continue;
            kept.push(word);
        }
        return kept.join(" ");
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        // only completed events can contain user-written text
        if (this.source != "completed_event") {
            return false;
        }
        let cleaned = this.cleanedText;

        // RunKeeper's default
        if (cleaned.includes("Check it out!")) {
            return false;
        }

        // user text comes after the " - "
        let dash = cleaned.indexOf(" - ");
        if (dash === -1) {
            return false;
        }
        let userText = cleaned.substring(dash + 3).trim();

        // second default phrase
        if (userText === "TomTom MySports Watch") {
            return false;
        }
        return userText !== "";
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }
        let cleaned = this.cleanedText;
        return cleaned.substring(cleaned.indexOf(" - ") + 3).trim();
    }

    private get activityText():string {
        let lower = this.text.toLowerCase();
        let markers = ["completed a ", "completed an ", "posted a ", "posted an "];
        for (let marker of markers) {
            let position = lower.indexOf(marker);
            if (position !== -1) {
                return this.text.substring(position + marker.length);
            }
        }
        return "";
    }

    // returns everything before the first space
    private firstWord(text:string):string {
        let space = text.indexOf(" ");
        if (space === -1) {
            return text;
        }
        return text.substring(0, space);
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        let rest = this.activityText;
        if (rest === "") {
            return "unknown";
        }

        let firstLetter = rest.search(/[a-z]/i);
        if (firstLetter === 0) {
            return this.firstWord(rest).toLowerCase();
        }

        let afterNumber = rest.substring(firstLetter);
        let unitEnd = afterNumber.indexOf(" ");
        if (unitEnd === -1) {
            return "unknown";
        }
        return this.firstWord(afterNumber.substring(unitEnd + 1)).toLowerCase();
    }

    get day():string {
        let day = this.time.getDay();
        switch (day) {
            case 0:
                return "Sunday";
            case 1:
                return "Monday";
            case 2:
                return "Tuesday";
            case 3:
                return "Wednesday";
            case 4:
                return "Thursday";
            case 5:
                return "Friday";
            case 6:
                return "Saturday";
            default:
                return "Unknown";
        }
    }

    get day_number():number {
        return this.time.getDay();
    }

    get distance():number {
        if (this.source != 'completed_event') {
            return 0;
        }
        let rest = this.activityText;

        let firstLetter = rest.search(/[a-z]/i);
        if (firstLetter <= 0) {
            return 0;   // no number, or no text at all
        }
        let number = parseFloat(rest.substring(0, firstLetter));
        if (isNaN(number)) {
            return 0;
        }

        let unit = this.firstWord(rest.substring(firstLetter));
        if (unit === "km") {
            return number / 1.609;
        }
        if (unit === "mi") {
            return number;
        }
        return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        let text = this.text;
        let link_start = text.search("https://t.co/")

         if (link_start !== -1) {
            let link_end = text.indexOf(" ", link_start);

            // If there is no space
            if (link_end === -1) {
                link_end = text.length;
            }

            let link = text.substring(link_start, link_end);

            text = text.substring(0, link_start) + '<a href="' + link + '" target="_blank">' + link + '</a>' + text.substring(link_end);
        }
        
        return "<tr><td>" + rowNumber + "</td><td>" + this.activityType + "</td><td>" + text + "</td></tr>";
    }
}