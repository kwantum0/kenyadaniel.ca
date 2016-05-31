/************************
 *		CONSTANTS		*
 ************************/
// GALLERY CONTAINER ID
let rootId		= "gallery-photos";
let galleryId	= "gallery"
let civilId  	= "civil-marriage";
let coupleId 	= "couple";


let $grid;

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

let recursiveImgAppend = function(ref, target, array, index){
	if(array.length > index) {
		//recursive call
		setTimeout(recursiveImgAppend(ref, target, array, index + 1), 0);
		
		let imageRef = ref.child(array[index]);
			imageRef.getMetadata().then(function(metadata){
			let child = $('<img class="grid-item" src="assets/null.png"'
							+ 'data-src="' + metadata.downloadURLs[0] 
							+ '" alt="' + metadata.name 
							+ '" title="'+ metadata.name + '">');
			target.append(child);
		}).catch(function(error){
			console.log(error);
		});
	} else {
		console.log("recursive load complete");
	}
};
// Fills the Gallery Element with Pictures
let fillGalleryElement = function(){
	
	// Civil Marriage Section
	let ref = photoStorage.ref().child(rootId).child(civilId);
	let target = $("#" + civilId);
	filenames.civilMarriage.forEach(function(value, index, array){
		let imageRef = ref.child(value);
		imageRef.getMetadata().then(function(metadata){
			let child = $('<img class="grid-item"'
							+ '  src="' + metadata.downloadURLs[0] 
							+ '" alt="' + metadata.name 
							+ '" title="'+ metadata.name + '">');
			target.append(child);
		}).catch(function(error){
			console.log(error);
		});
	});
};

/********************
 *		MAIN		*
 ********************/
$(document).ready(function(){
	if($("#" + galleryId)) {
		shuffleFilenames();
		$grid = $('.grid').masonry({
			itemSelector: '.grid-item',
			columnWidth: '.grid-sizer',
			percentPosition: true
		});
		$grid.imagesLoaded().always(function(instance) {
			$grid.masonry('layout');
		});
		fillGalleryElement();

	}
});
