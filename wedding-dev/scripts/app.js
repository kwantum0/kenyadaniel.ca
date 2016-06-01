/************************
 *		CONSTANTS		*
 ************************/
// GALLERY CONTAINER ID
let rootId		= "gallery-photos";
let galleryId	= "gallery"
let civilId  	= "civil-marriage";
let coupleId 	= "couple";

// GLOBAL REFERENCES
let $fullscreenElement;

// FIREBASE CONFIG 
let config = {
    apiKey: "AIzaSyDEMkdlVuBzFKJU0G2ed7F-ByClU21Iowk",
    authDomain: "wedding-36c46.firebaseapp.com",
    databaseURL: "https://wedding-36c46.firebaseio.com",
    storageBucket: "wedding-36c46.appspot.com",
};

/************************
 *		FIREBASE		*
 ************************/
firebase.initializeApp(config);
let photoStorage = firebase.storage();
  
/****************************
 *		UTILITY FUNC		*
 ****************************/
// Generates a Unique ID
let generateGuid = function() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		let r = Math.random()*16|0
		let v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
};

// Randomly Permutes an Array and returns it
let shuffleArray = function(array) {
	if(array.constructor === Array) {
		var currentIndex = array.length, temporaryValue, randomIndex;
		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	}
	else {
		return array;
	}
};

// Randomly Permutes arrays in filenames object in place
let shuffleFilenames = function() {
	if(!!filenames) {
		Object.keys(filenames).forEach(function(key,index){
			filenames[key] = shuffleArray(filenames[key]);
		});
	}
};

// Make an Element Fullscreen
let requestFullscreen = function(element) {
    // Supports most browsers and their versions.
    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

    if (requestMethod) { // Native full screen.
        requestMethod.call(element);
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
}

// Remove Fullscreen
let stopFullscreen = function() {
	if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
	} else if (document.webkitCancelFullScreen) {
		document.webkitCancelFullScreen();
	} else {
		document.exitFullscreen();
	}
}

// Toggles fullscreen on click
let toggleFullscreen = function(element) {
	stopFullscreen();
	if(element === $fullscreenElement) {
		$("body, html").removeClass("full-body-html");
		$(element).parent().removeClass("fullscreen-div");
	} else {
		$fullscreenElement = element;
		$("body, html").addClass("full-body-html");
		let parent = $(element).parent().addClass("fullscreen-div")[0];
		requestFullscreen(parent);
	}
}

/********************
 *		MAIN		*
 ********************/
$(document).ready(function(){
	if($("#gallery")){
		$("section img").unveil(200, function() {
			$(this).load(function() {
				this.style.opacity = 1;
				$(this).click(function() {
					toggleFullscreen(this);
				});
			});
		});
	}
});
