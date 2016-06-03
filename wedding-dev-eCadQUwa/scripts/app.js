/************************
 *		CONSTANTS		*
 ************************/
var imgLoadThreshold = 200;

// GLOBAL REFERENCES
var $fullscreenElement = null;

// FIREBASE CONFIG 
var config = {
    apiKey: "AIzaSyDEMkdlVuBzFKJU0G2ed7F-ByClU21Iowk",
    authDomain: "wedding-36c46.firebaseapp.com",
    databaseURL: "https://wedding-36c46.firebaseio.com",
    storageBucket: "wedding-36c46.appspot.com",
};

/************************
 *		FIREBASE		*
 ************************/
firebase.initializeApp(config);
var database = firebase.database();
var storage = firebase.storage();

/****************************
 *		UTILITY FUNC		*
 ****************************/
// Generates a Unique ID
var generateGuid = function() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0
		var v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
};

// Randomly Permutes an Array and returns it
var shuffleArray = function(array) {
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
var shuffleFilenames = function() {
	if(!!filenames) {
		Object.keys(filenames).forEach(function(key,index){
			filenames[key] = shuffleArray(filenames[key]);
		});
	}
};

// Make an Element Fullscreen
var requestFullscreen = function(element) {
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
var stopFullscreen = function() {
	if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
	} else if (document.webkitCancelFullScreen) {
		document.webkitCancelFullScreen();
	} else {
		document.exitFullscreen();
	}
}

// Toggles fullscreen on click
var toggleFullscreen = function(element) {
	stopFullscreen();
	if(element){
		if(element === $fullscreenElement) {
			$("body, html").removeClass("full-body-html");
			$(element).parent().removeClass("fullscreen-div");
			$fullscreenElement = null;
		} else {
			$fullscreenElement = element;
			$("body, html").addClass("full-body-html");
			var parent = $(element).parent().addClass("fullscreen-div")[0];
			requestFullscreen(parent);
		}
	}
}

// Toggles gallery collapse 
var galleryToggle = function(target, arrow) {
	if($(arrow).hasClass("down-arrow")){
		$(arrow).removeClass("down-arrow");
		$(arrow).addClass("up-arrow");
		$('#' + target).hide();
		$("section img").unveil();
	} else {
		$(arrow).addClass("down-arrow");
		$(arrow).removeClass("up-arrow");
		$('#' + target).show();
		$("section img").unveil();
	}
}
/********************
 *		MAIN		*
 ********************/
$(window).load(function(){
	if($("#gallery")){
		$("section img").unveil(imgLoadThreshold, function() {
			$(this).load(function() {
				this.style.opacity = 1;
				$(this).click(function() {
					toggleFullscreen(this);
				});
			});
		});
	}
	$(document).keyup(function(e) {
		if(e.keyCode == 27) {
			toggleFullscreen($fullscreenElement)
		}
	});
});
