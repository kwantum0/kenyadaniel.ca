/************************
 *		CONSTANTS		*
 ************************/
var IMG_LOAD_THRES = 200;
var LOAD_ANI_DURATION = 1000;
var EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
var PHONE_REGEX = /^([#+xX. \(\)\-\[\]]*?\d[#+xX. \(\)\-\[\]]*?){10,16}$/;
var COMING_STR = "IS HAPPILY ATTENDING";
var NOT_COMING_STR = "SENDS THEIR REGRETS";
var FORM_TAB_START = 5;

// GLOBAL REFERENCES
var $fullscreenElement = null;
var $rsvpCodeState = -1; 
var $rsvpCodeTimeout;
	/* States Are:
		-1 - never submitted
		0  - not-active 
		1  - active (disabled)
		2  - sucess
		3  - failure
	*/

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
var dataRef = null;
var dataObj = null;

/****************************
 *		UTILITY FUNC		*
 ****************************/
// Capitalize Strings
var toTitleCase = function(str) {
    return str ? str.replace(/\w*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : "";
}

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

// Rotates an element n number of times
var AnimateRotate = function(elem, angle, repeat) {
	var $elem = $(elem);
    var duration= LOAD_ANI_DURATION;
    $rsvpCodeTimeout = setTimeout(function() {
        if(repeat && repeat == "infinite") {
            AnimateRotate(elem, angle, repeat);
        } else if ( repeat && repeat > 1) {
            AnimateRotate(elem, angle, repeat-1);
        }
    },duration)    
    $({deg: 0}).animate({deg: angle}, {
        duration: duration,
		easing: "linear",
        step: function(now) {
            $elem.css({
                'transform': 'rotate('+ now +'deg)'
            });
        }
    });
}

// Function to validate guest radio buttons
var validateGuestRadios = function(input) {
	var name = $(input).attr("name");
	var id = $(input).parent().parent().attr("id").substring(1);
	var value = 0;
	$('input[name="' + name + '"]').each(function() {
		if($(this).is(":checked")){
			value = parseInt($(this).val());
		}
	});
	if(value <= 0) {
		$('input[name="' + name + '"] + span').addClass("error");
		delete dataObj.guests[id].rsvp;
	} else {
		$('input[name="' + name + '"] + span').removeClass("error");
		dataObj.guests[id].rsvp = value;
	}
	return (value > 0);
};

// Function to validate email addresses
var validateEmailAddress = function(input){
	var value = $(input).val();
	var isValid = EMAIL_REGEX.test(value) || value == "";
	if(isValid) {
		$("#emailAddress").removeClass("error");
		if(value.trim() != ""){
			dataObj.email = value.trim();
		} else {
			delete dataObj["email"];
		}
	} else {
		$("#emailAddress").addClass("error");
		delete dataObj["email"];
	}
	return isValid;
}

// Function to validate phone numbers
var validatePhoneNumber = function(input){
	var value = $(input).val();
	var isValid = PHONE_REGEX.test(value) || value == "";
	if(isValid) {
		$("#phoneNumber").removeClass("error");
		if(value.trim() != ""){
			dataObj.phone = value.trim();
		} else {
			delete dataObj["phone"];
		}
	} else {
		$("#phoneNumber").addClass("error");
		delete dataObj["phone"];
	}
	return isValid;
}

// Maintains State on Splash screen Submit
function setSplashState0() {
	$rsvpCodeState = 0;
	$("#splashSubmit").children("i").html("&rarr;");
	$("#splashSubmit, #rsvpCode").prop( "disabled", false );
}
function setSplashState1() {
	$rsvpCodeState = 1;
	$("#splashSubmit").children("i").html("&#10227;");
	AnimateRotate("#splashSubmit > i", .36 * LOAD_ANI_DURATION, "infinite");
	$("#splashSubmit, #rsvpCode").prop( "disabled", true );
}
function setSplashState2(data) {
	// Perform Success
	// console.log("success: got RSVP!");
	
	// Remove rotating effect
	clearTimeout($rsvpCodeTimeout);
	$("#splashSubmit > i").remove();
	
	// add icon and effect
	$("#splashSubmit").html("<i>&check;</i>");
	$("#rsvpCode, #splashSubmit").addClass("success");
	
	// reveal guest list after delay
	setTimeout(function() {
		$("#splash").slideUp(200);
		$("#form").slideDown(200);
	}, LOAD_ANI_DURATION);
	
	// populate fields
	$("#emailAddress").val(data.email ? data.email : "");
	$("#phoneNumber").val(data.phone ? data.phone : "");
	
	// populate guest list
	var guestList = $("#guests");
	guestList.empty();
	data.guests.forEach(function(guest, index, array){
		var element = $('<div id="#'+ index +'"></div>');
		var tab = index * 2 + FORM_TAB_START;
		element.append($('<h1>' + toTitleCase(guest.name) + '</h1>'));
		element.append($('<div><input type="radio" name="rsvp' + 
						 index + '" value="1" tabindex=' + 
						 tab + ' ' + (guest.rsvp == 1 ? "checked" : "" ) + '/><span>'
						 + COMING_STR +'</span></div>'));
		element.append($('<div><input type="radio" name="rsvp'
						 + index + '" value="2" tabindex=' 
						 + (tab + 1) + ' ' + (guest.rsvp == 2 ? "checked" : "" ) + ' /><span>'
						 + NOT_COMING_STR +'</span></div>'));
		guestList.append(element);
	});
	
	// set tab index for submit
	$("#formSubmit").attr("tabindex", data.guests.length * 2 + FORM_TAB_START);
	
	// add blur function		
	$('input[type="radio"]').blur(function(){validateGuestRadios(this)});
	$('input[type="radio"]').click(function(){validateGuestRadios(this)});
	
	if($('input[type="radio"]').is(":checked")){$("#formSubmit").html("UPDATE YOUR REPLY");}
}
function setSplashState3() {
	// Perform Error
	// console.log("error: didn't get RSVP!");
	
	// Remove rotating effect
	clearTimeout($rsvpCodeTimeout);
	$("#splashSubmit > i").remove();
	
	// add icon and effect
	$("#splashSubmit").html("<i>&cross;</i>");
	$("#rsvpCode, #splashSubmit").addClass("error shake animated")
	
	// return to default state after delay
	setTimeout(function() {
		$("#rsvpCode, #splashSubmit").removeClass("error shake animated")
		setSplashState0();
	}, LOAD_ANI_DURATION);
}
function splashScreenSubmit() {
	if($rsvpCodeState <= 0) {
		setSplashState1();
		
		// Get Data
		var code = md5($("#rsvpCode").val().replace(" ", ""));
		dataRef = database.ref('/' + code);
		dataRef.on('value', firebaseValueCallback);
	}
}

// Firebase Callback for 'value'
var firebaseValueCallback = function(snapshot){
	dataObj = snapshot.val();
	if (dataObj == null) {
		setSplashState3();
	} else {
		setSplashState2(dataObj);
	}
};

/********************
 *		MAIN		*
 ********************/
$(window).load(function(){
	/* GALLERY PAGE */
	if($("#gallery")){
		$("section img").unveil(IMG_LOAD_THRES, function() {
			$(this).load(function() {
				this.style.opacity = 1;
				$(this).click(function() {
					toggleFullscreen(this);
				});
			});
		});
		$(document).keyup(function(e) {
			if(e.keyCode == 27) {
				toggleFullscreen($fullscreenElement)
			}
		});
	}
	
	/* RSVP PAGE */
	if($("#rsvpForm")){
		// Combine focus states of button and field
		$("#rsvpCode").focus(function(){
			$("#splashSubmit").addClass("focus");
		});
		$("#splashSubmit").focus(function(){$("#rsvpCode").addClass("focus");});
		$("#splashSubmit").blur(function(){
			if(!$(this).is(":hover")) {
				$("#rsvpCode").removeClass("focus");
			}
		});
		$("#splashSubmit").hover(function(){$("#rsvpCode").addClass("focus");},function(){
			if(!$(this).is(":focus")) {
				$("#rsvpCode").removeClass("focus");
			}
		});
		
		// On RSVP Code Submit
		$("#splashSubmit").click(function() {
			splashScreenSubmit();
		});
		$("#rsvpCode, #splashSubmit").keypress(function (e) {
			if (e.which == 13) {
				splashScreenSubmit();
			}
		});
		
		// Set input masks for text fields
		$("#rsvpCode").mask("9999 9999",{placeholder:"0"});
		
		// Validate Email and Phone Fields
		$("#emailAddress").blur(function(){validateEmailAddress(this);});
		$("#phoneNumber").blur(function(){validatePhoneNumber(this);});
		
		// (line 169) Validate for Guest list is attached when guest list in generated 
		
		// Validate on Submit
		$("#formSubmit").click(function() {
			$("#formSubmit").prop( "disabled", true );
			var isValid = true;
			
			// radio buttons (in reverse order)
			$($('input[type="radio"]').get().reverse()).each(function(){
				var localValid = validateGuestRadios(this);
				isValid = isValid && localValid;
				if(!localValid) {
					$(this).parent().addClass("shake animated");
					$(this).focus();
					setTimeout(function(){
						$('input[type="radio"]').parent().removeClass("shake animated");
					}, LOAD_ANI_DURATION);
				}
			});
			
			// phone number
			$('#phoneNumber').each(function(){
				var localValid = validatePhoneNumber(this);
				isValid = isValid && localValid;
				if(!localValid) {
					$(this).addClass("shake animated");
					$(this).next().addClass("shake animated");
					$(this).focus();
					setTimeout(function(){
						$('#phoneNumber, #phoneNumber + label').removeClass("shake animated");
					}, LOAD_ANI_DURATION);
				}
			});
			
			// email address
			$('#emailAddress').each(function(){
				var localValid = validateEmailAddress(this);
				isValid = isValid && localValid;
				if(!localValid) {
					$(this).addClass("shake animated");
					$(this).next().addClass("shake animated");
					$(this).focus();
					setTimeout(function(){
						$('#emailAddress, #emailAddress + label').removeClass("shake animated");
					}, LOAD_ANI_DURATION);
				}
			});
			
			// IF ALL GOOD
			if(isValid) {
				var updates = {};
				
				delete dataObj["location"];
				delete dataObj["code"];
				
				dataObj.guests.forEach(function(guest, index, array){
					delete guest["name"];
					if(guest.rsvp){
						updates["/guests/" + index + "/rsvp"] = guest.rsvp;
					}
				});
				if(dataObj.email) {	updates["/email"] = dataObj.email; }
				if(dataObj.phone) { updates["/phone"] = dataObj.phone; }
								
				// Have to turn off callback before exec, update
				dataRef.off('value', firebaseValueCallback);
				dataRef.update(updates, function(error) {
					if(error){
						$("#formSubmit").addClass("error");
						setTimeout(function(){
							$("#form").slideUp(200);
							$("#error").slideDown(200);
						}, LOAD_ANI_DURATION / 2)
					} else {
						$("#formSubmit").addClass("success");
						setTimeout(function(){
							$("#form").slideUp(200);
							$("#thankYou").slideDown(200);
						}, LOAD_ANI_DURATION / 2)
					}

				});
			} else {
				$("#formSubmit").prop( "disabled", false );
			}
		});
	}
});
