/**
 * @fileOverview Resource loader utility provided by Udacity.
 * @author Udacity
 */


// Browserify puts this file first when it concatenates, so we declare jQuery here.
var $ = require("jquery");

/* Resources.js
 * This is simple an image loading utility. It eases the process of loading
 * image files so that they can be used within your game. It also includes
 * a simple "caching" layer so it will reuse cached images if you attempt
 * to load the same image multiple times.
 */
(function() {
	var resourceCache = {};
	var loading = [];
	var readyCallbacks = [];

	/* This is the publicly accessible image loading function. It accepts
	 * an array of strings pointing to image files or a string for a single
	 * image. It will then call our private image loading function accordingly.
	 */
	function load(urlOrArr) {
		if (urlOrArr instanceof Array) {
			/* If the developer passed in an array of images
			 * loop through each value and call our image
			 * loader on that image file
			 */
			urlOrArr.forEach(function(url) {
					_load(url);
			});
		} else {
			/* The developer did not pass an array to this function,
			 * assume the value is a string and call our image loader
			 * directly.
			 */
			_load(urlOrArr);
		}
	}

	/* This is our private image loader function, it is
	 * called by the public image loader function.
	 */
	function _load(url) {
		if(resourceCache[url]) {
			/* If this URL has been previously loaded it will exist within
			 * our resourceCache array. Just return that image rather
			 * re-loading the image.
			 */
			return resourceCache[url];
		} else {
			/* This URL has not been previously loaded and is not present
			 * within our cache; we'll need to load this image.
			 */
			var img = new Image();
			img.onload = function() {
				/* Once our image has properly loaded, add it to our cache
				 * so that we can simply return this image if the developer
				 * attempts to load this file in the future.
				 */
				resourceCache[url] = img;

				/* Once the image is actually loaded and properly cached,
				 * call all of the onReady() callbacks we have defined.
				 */
				if(isReady()) {
						readyCallbacks.forEach(function(func) { func(); });
				}
			};

			/* Set the initial cache value to false, this will change when
			 * the image's onload event handler is called. Finally, point
			 * the images src attribute to the passed in URL.
			 */
			resourceCache[url] = false;
			img.src = url;
		}
	}

	/* This is used by developer's to grab references to images they know
	 * have been previously loaded. If an image is cached, this functions
	 * the same as calling load() on that URL.
	 */
	function get(url) {
		return resourceCache[url];
	}

	/* This function determines if all of the images that have been requested
	 * for loading have in fact been completed loaded.
	 */
	function isReady() {
		var ready = true;
		for(var k in resourceCache) {
			if(resourceCache.hasOwnProperty(k) && !resourceCache[k]) {
				ready = false;
			}
		}
		return ready;
	}

	/* This function will add a function to the callback stack that is called
	 * when all requested images are properly loaded.
	 */
	function onReady(func) {
		readyCallbacks.push(func);
	}

	/* This object defines the publicly accessible functions available to
	 * developers by creating a global Resources object.
	 */
	window.Resources = {
		load: load,
		get: get,
		onReady: onReady,
		isReady: isReady
	};
})();

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
/**
 * @fileOverview Top-level variables, hud and audio code is organized here.
 * @author Noel Noche
 * @version 1.0.0
 */



// Used throughout for positioning entities, collision detection etc..
var ROWS = [-43, 60, 143, 226, 309, 392];
var COLS = [0, 101, 202, 303, 404];

// For score and lives.
var $scoreNode = $("#game-score");
var score = null;
var PTS_PER_MIN = 1;
var penalty = 0;
var lives = null;

// For levels.
var $levelNode = $("#level-indicator");
var gameLevel = 1;
var totalLevels = 12;

// For game rate and duration.
var $gameTimeNode = $("#game-time");
var startTime = null;
var endTime = null;
var gameTime = null;
var lastGameTime = null;

// For sound effects.
var sfArray = [new Audio(), new Audio()];
var startBlip = document.getElementById("blip");
var gemGet = document.getElementById("blip");
var collided = document.getElementById("ouch");
var START_BLIP_VOLUME = 0.5;
var COLLIDED_VOLUME = 0.5;
var soundOn = false;

// For BGM.
var tracks = {track_0: "audio/bgm_daily_beetle", track_1: "audio/bgm_vivacity"};
var soundtrack = document.getElementById("soundtrack");
var SOUNDTRACK_VOLUME = 0.15;
var musicOn = false;

// For audio toggle switches.
var musicCheckbox = document.getElementById("checkbox-music");
var soundCheckbox = document.getElementById("checkbox-sound");
var musicOn = musicCheckbox.checked;
var soundOn = soundCheckbox.checked;

// Used for showing/hiding game info during initial page load.
// var panels = document.getElementsByClassName("side_panels");
// var body = document.getElementsByTagName("body");
var $panels = $(".side-panels").hide();
var $body = $("body");


// Helper function for generating a random number between
// min (inclusive) and max (exclusive).
function gen_rand_index(max, min) {
	return Math.floor((Math.random() * max) + min);
}

// Shuffles an array using the Fisher-Yates algorithm.
function shuffle(arrayArg) {
	var i;
	var j;
	var temp;
	for (i = arrayArg.length - 1; i > 0; --i){
		j = Math.floor(Math.random() * (i+1));
		temp = arrayArg[i];
		arrayArg[i] = arrayArg[j];
		arrayArg[j] = temp;
	}
	return arrayArg;
}

// Removes a life heart when player collides with a bug/obstacle.
function remove_heart() {
	lives -= 1;
	var $livesRnode = $(".lives");

	if ($livesRnode.length) {
		$livesRnode[0].remove();
	}
}

// Handler for extra heart bonuses.
function add_heart() {
	lives += 1;
	var $livesAnode = $("#lives");

	if (lives < 10) {
		$livesAnode.append('<li class="lives"><img src="images/heart-small.png"></li>');
	} else {
		$livesAnode.html('<li class="lives"><img src="images/heart-small.png"></li>' + " " + lives);
	}
}

// Support function for `play_track`. This determines which audio format is best for
// your browser. This is pretty tricky, as audio compatibility may change in future
// browser versions..
function get_format_extension() {
	var audio = this.soundtrack;
	var extension;

	if (audio.canPlayType("audio/mpeg") !== "") {
		extension = ".mp3";
	}

	if (audio.canPlayType("audio/ogg") !== "") {
		extension = ".ogg";
	}
	return extension;
}

// Another support function for `play_track`.
// Builds the track name so we can call it from the `tracks` object container.
function select_track(trackNum) {
	// var trackNo = ~~((Math.random() * 2));
	var track = "track_" + trackNum + "";
	return track;
}

// Plays the selected track.
function play_track(trackNum) {
	var trk = select_track(trackNum);
	soundtrack.src = tracks[trk] + get_format_extension();
	soundtrack.load();
	soundtrack.play();
}

// Support function for `play_sound`.
function audio_is_playing(sound) {
	return !sound.ended && sound.currentTime > 0;
}

// Makes simultaneous sound effects possible.
function play_sound(sound) {
	var sf;

	if (soundOn) {
		if (!audio_is_playing(sound)) {
		sound.play();
			} else {
				for (var i=0; i < sfArray.length; i++) {
					sf = sfArray[i];

					if (!audio_is_playing(sf)) {
						sf.src = sound.currentSrc;
						sf.load();
						sf.volume = sound.volume;
						sf.play();
					break;
				}
			}
		}
	}
}

// Initializes the audio files when game first loads.
function initialize_audio() {
	startBlip.volume = START_BLIP_VOLUME;
	collided.volume = COLLIDED_VOLUME;
	soundtrack.volume = SOUNDTRACK_VOLUME;
}
/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
/**
 * @fileOverview A mixin paradigm for applying custom behaviors to game entities.
 * @author Noel Noche
 * @version 1.0.0
 */



// Holds all properties used in the behavior methods.
var allBehaviorProperties = {
	startTime: 0,
	elapsedTime: null,
	timeLimit: null,
	activeTimer: false,
	penaltyTile: false,
	topBlock: false,
	rightBlock: false,
	bottomBlock: false,
	leftBlock: false,
	blockCollision: false,
	playerLastX: null,
	playerLastY: null
};

var setTimer = null;
var takeLife = null;
var impassable = null;


// Holds methods used for a timer behavior.
setTimer = {

	start_timer: function() {
		this.startTime = new Date();
		this.activeTimer = true;
	},

	stop_timer: function() {
		this.startTime = 0;
		this.activeTimer = false;
	},

	update_timer: function(timeLimit) {
		if (this.activeTimer === true) {
			this.elapsedTime = parseInt(((new Date()) - this.startTime)/1000);

			if (this.elapsedTime > timeLimit) {
				this.stop_timer();
			}
		}
	}
};


// Holds methods used for detecting collision with a non-enemy entity.
takeLife = {

	check_collision: function(player) {
		if (this.x === player.x && this.y === player.y) {
			this.penaltyTile = true;
		} else {
			this.penaltyTile = false;
		}
	},

	update: function(player) {
		this.check_collision(player);

		if (this.penaltyTile === true && player.y === this.y && player.x === this.x) {
			player.collided = true;
		}
	}
};

// Holds methods that make an entity impassable.
impassable = {

	check_collision: function(player) {

		if (this.x === player.x && this.y === player.y) {
			this.blockCollision = true;

			if (this.playerLastY < this.y) {
				this.topBlock = true;
			}

			if (this.playerLastX > this.x) {
				this.rightBlock = true;
			}

			if (this.playerLastY > this.y) {
				this.bottomBlock = true;
			}

			if (this.playerLastX < this.x) {
				this.leftBlock = true;
			}
		}
	},

	update: function(player) {
		this.check_collision(player);

		if (this.blockCollision === true) {

			if (this.topBlock === true) {
				player.y = this.y - 83;
				player.x = this.x;
				this.topBlock = false;
			}

			if (this.rightBlock === true) {
				player.x = this.x + 101;
				player.y = this.y;
				this.rightBlock = false;
			}

			if (this.bottomBlock === true) {
				player.y = this.y + 83;
				player.x = this.x;
				this.bottomBlock = false;
			}

			if (this.leftBlock === true) {
				player.x = this.x - 101;
				player.y = this.y;
				this.leftBlock = false;
			}
			this.blockCollision = false;
		}

		this.playerLastX = player.x;
		this.playerLastY = player.y;
	}
};

// Binds the behavior to the target entity.
function add_behaviors(entityObject, behaviorsArray) {
	var prop;

	for (prop in allBehaviorProperties) {
		if (entityObject.hasOwnProperty(prop)) {
			throw "Entity property conflict!: " + prop;
		} else {
			entityObject[prop] = allBehaviorProperties[prop];
		}
	}

	behaviorsArray.forEach(function(component) {
		for (prop in component) {
			entityObject[prop] = component[prop];
		}
	});
}
/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
/**
 * @fileOverview All tile-specific variables and functions are organized here.
 * @author Noel Noche
 * @version 1.0.0
 */



// Holds tile instances used when building the game board.
var activeTiles = [];

// Keep max number of water/rock tiles to 4 in the map metadata,
// or you risk trapping the player.
var waterArray = [];
var waterInstance = null;
var waterNum = null;
var randomWater = false;
var rocksArray = [];
var rockInstance = null;
var rockNum = null;
var randomRocks = false;


// Using pseudo-classical inheritance for creating each tile type.
// There are 4 types: ground, grass, water and rock.
var Tile = function(sprite) {
	this.name = null;
	this.sprite = null;
	this.w = 101;
	this.h = 171;
	this.x = null;
	this.y = null;
};
Tile.prototype.render = function() {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


var Ground = function(sprite) {
	Tile.call(this);
	this.name = "ground";
	this.sprite = 'images/tile-ground.png';
};
Ground.prototype = Object.create(Tile.prototype);
Ground.prototype.constructor = Ground;


var Grass = function(sprite) {
	Tile.call(this);
	this.name = "grass";
	this.sprite = 'images/tile-grass.png';
};
Grass.prototype = Object.create(Tile.prototype);
Grass.prototype.constructor = Grass;


var Water = function(sprite) {
	Tile.call(this);
	this.name = "water";
	this.sprite = 'images/tile-water.png';
};
Water.prototype = Object.create(Tile.prototype);
Water.prototype.constructor = Water;


var Rock = function(sprite) {
	Tile.call(this);
	this.name = "rock";
	this.sprite = 'images/tile-rock.png';
};
Rock.prototype = Object.create(Tile.prototype);
Rock.prototype.constructor = Rock;


// Generates the specified tile.
function generate_tile(type, startX, startY) {
	var tile = null;

	// Multiple mixin components can be used, which is why we use an array.
	var mixinMethods;

	switch (type) {
		case "ground":
			tile = new Ground();
 			mixinMethods = [];
			break;
		case "grass":
			tile = new Grass();
 			mixinMethods = [];
			break;
		case "water":
			tile = new Water();
 			mixinMethods = [takeLife];
			break;
		case "rock":
			tile = new Rock();
 			mixinMethods = [impassable];
			break;
	}
	tile.x = startX;
	tile.y = startY;

	add_behaviors(tile, mixinMethods);

	return tile;
}

// Randomizes the arrangement of tiles on the canvas.
function randomize_tile_array(tileArray, player) {
	var counter = 0;
	var randCols = shuffle([0, 101, 202, 303, 404]);
	var randRows = shuffle([143, 226, 309]);
	var used = [player];

	for (var i = 0; i < randCols.length; i++) {
		var tile = tileArray[i];

		if (tile !== undefined) {
			tile.x = randCols[i];

			for (var j = 0; j < randRows.length; j++) {
				tile.y = randRows[j];

				for (var k = 0; k < used.length; k++) {
					var cur = used[k];
					if ((tile.x === player.x && tile.y === player.y) ||
							(tile.x === cur.x + 101 ||
							tile.x === cur.x - 101 ||
							tile.x === cur.y + 83)) {
						tile.x = randCols[i + 1];
						tile.y = randRows[j + 1];
					}
				}
				used.push(tile);
				counter++;

				if (counter > tileArray.length) {
					break;
				}
			}
		}
	}
}

// Generates the rocks array. Positions can be randomized.
function generate_rand_rocks() {
	randomize_tile_array(rocksArray, playerInstance);
}

// Generates water tiles. Positions can be randomized.
function generate_rand_puddles() {
	for (var i=0; i < waterNum; i++) {
		waterInstance = generate_tile("water", null, null);
		waterArray.push(waterInstance);
	}

	if (randomWater === true) {
		randomize_tile_array(waterArray, playerInstance);
	}

	// Unlike rocks, water tiles must be generated with the game grid,
	// so we put them in the `activeTiles` array.
	waterArray.forEach(function(puddle) {
		if (puddle !== undefined) {
			activeTiles.push(puddle);
		}
	});
}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
/**
 * @fileOverview Gem-specific code is organized here.
 * @author Noel Noche
 * @version 1.0.0
 */



// Holds the gem instance produced by `initialize_objects`.
var gemInstance = null;

// Ensures one gem at a time appears.
var activeGem = false;

// For generating a randomly weighted gem type.
var gemNames = null;
var gemWeights = null;
var weightedGemList = null;

// Used to keep track of gem positions so they won't appear in a
// position occupied by a finished character.
var gemCols = [0, 101, 202, 303, 404];


// Using pseudo-classical inheritance for creating each gem type.
// There are 4 types: blue, green, orange and the life heart.
var Gem = function(sprite) {
	this.name = null;
	this.sprite = null;
	this.x = null;
	this.y = null;
	this.w = 101;
	this.h = 171;
	this.points = null;
	this.bonusLife = false;
	this.taken = false;
};

Gem.prototype = {

	// Checks if the player acquired the gem.
	check_player_get: function(player) {
		if (this.x === player.x && this.y === player.y) {
			this.taken = true;

			if (this.name === "heart") {
				this.bonusLife = true;
			}
		}
	},

	update: function() {
		if (this.taken) {

			if (soundOn) {
				play_sound(startBlip);
	    }

			if (this.bonusLife) {
				add_heart();
			}
			else {
				score += this.points;
				$scoreNode.text("Score " + score);
			}
			this.activeTimer = false;
			this.taken = false;
			this.sprite = "";
			activeGem = false;
		}
	},

	render: function() {
		ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	}
};


// We'll apply weighted probability to determine the frequency of the appearance of
// each gem type. A blue gem appears most of the time; a heart appears the least.
// Source -- codetheory.in/weighted-biased-random-number-generation-with-javascript-based-on-probability/
gemNames = ["gem-blue", "gem-green", "gem-orange", "heart"];
gemWeights = [0.500, 0.350, 0.135 ,0.15];

function generate_gem_list(namesArray, weightsArray) {
	var weightedList = [];

	for (var i = 0; i < weightsArray.length; i++) {
		var multiples = weightsArray[i] * 1000;

		for (var j = 0; j < multiples; j++) {
			weightedList.push(namesArray[i]);
		}
	}
	return shuffle(weightedList);
}

weightedGemList = generate_gem_list(gemNames, gemWeights);

// Generates a Gem instance.
function generate_gem(xPos, yPos) {
	var randIndex = gen_rand_index(weightedGemList.length, 0);
	var gemName = weightedGemList[randIndex];
	var gemComponents = [setTimer];

	var gem = new Gem();
	gem.name = gemName;
	gem.x = xPos;
	gem.y = yPos;

	switch (gemName) {
		case "gem-blue":
			gem.sprite = "images/gem-blue.png";
			gem.points = 5;
			break;
		case "gem-green":
			gem.sprite = "images/gem-green.png";
			gem.points = 10;
			break;
		case "gem-orange":
			gem.sprite = "images/gem-orange.png";
			gem.points = 15;
			break;
		case "heart":
			gem.sprite = "images/heart.png";
			gem.bonusLife = true;
			break;
	}

	add_behaviors(gem, gemComponents);

	return gem;
}
/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
/**
 * @fileOverview Enemy-specific code is organized here.
 * @author Noel Noche
 * @version 1.0.0
 */



// Holds the maximum number of each bug to generate.
var maxRed1 = null,
		maxRed2 = null,
		maxRed3 = null,
		maxRed4 = null,
		speedRed1 = null,
		speedRed2 = null,
		speedRed3 = null,
		speedRed4 = null,
		dirRed1 = null,
		dirRed2 = null,
		dirRed3 = null,
		dirRed4 = null,
		maxYellow = null,
		maxGreen = null,
		maxBlue = null,
		maxPurple = null;

// Sets the number of each red bug.
var redNums = null;

// Sets the speed of each red bug.
var redSpeeds = null;

// Sets the direction of each red bug by setting their `fromLeft` property.
// Each array item corresponds to a redBug number.
// e.g. [true, false, true, false] -- RedBug1 moves right, redBug2 moves left, etc...
var redDirs = null;

// Sets blue bug row.
var blueRow = null;

// Holds all active bug objects.
var allEnemies = null;

// For assigning random speeds to the yellow bug.
var SPEEDS = [100, 200, 300];

// Used for randomly selecting a value from `SPEEDS`.
var BOOLS = [true, false];

// Used to decide if green bug shifts rows or not.
var ROW_BOOL = [true, false];

// x position the bug is regenerated after it passes the edge of the game grid.
var LEFT_START_POS = -101;
var RIGHT_START_POS = 505;


// Base class for various enemy types.
var Enemy = function(sprite) {
	this.sprite = null; // Loaded using Udacity's helper function
	this.name = null;
	this.w = 50; 	// Adjusted for more forgiving collision detection
	this.h = 50;
	this.x = null;
	this.y = null;
	this.speed = null;
	this.fromLeft = false;
};
Enemy.prototype = {

	// Updates the enemy's position.
	update: function(dt) {
		if (this.fromLeft === true) {
			this.x = this.x + this.speed * dt;
		}
		else {
			this.x = this.x - this.speed * dt;
		}
	},

	// Draws the enemy sprite on the screen.
	render: function() {
		ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	}
};


// Reds are the standard bug type that can go on multiple rows.
// There are 5 types: red, yellow, green, blue and purple.
var RedBug1 = function() {
	Enemy.call(this);
	this.name = "red1";
	this.sprite = "images/bug-red-right.png";
	this.fromLeft = null;
};
RedBug1.prototype = Object.create(Enemy.prototype);
RedBug1.prototype.constructor = RedBug1;

var RedBug2 = function() {
	Enemy.call(this);
	this.name = "red2";
	this.sprite = "images/bug-red-right.png";
	this.fromLeft = null;
};
RedBug2.prototype = Object.create(Enemy.prototype);
RedBug2.prototype.constructor = RedBug2;

var RedBug3 = function() {
	Enemy.call(this);
	this.name = "red3";
	this.sprite = "images/bug-red-right.png";
	this.x = COLS[1];
	this.fromLeft = null;
};
RedBug3.prototype = Object.create(Enemy.prototype);
RedBug3.prototype.constructor = RedBug3;

var RedBug4 = function() {
	Enemy.call(this);
	this.name = "red4";
	this.sprite = "images/bug-red-right.png";
	this.x = COLS[2];
	this.fromLeft = null;
};
RedBug4.prototype = Object.create(Enemy.prototype);
RedBug4.prototype.constructor = RedBug4;

// Yellows use only one row and appears from random rows with random speeds.
var YellowBug = function() {
	Enemy.call(this);
	this.name = "yellow";
	this.sprite = "images/bug-yellow-right.png";
};
YellowBug.prototype = Object.create(Enemy.prototype);
YellowBug.prototype.constructor = YellowBug;

// Greens shift from one rows to another.
var GreenBug = function() {
	Enemy.call(this);
	this.name = "green";
	this.sprite = "images/bug-green-right.png";
	this.rowShift = false;
};

// Green bugs change rows at random times.
GreenBug.prototype = Object.create(Enemy.prototype);
GreenBug.prototype.constructor = GreenBug;
GreenBug.prototype.update = function(dt) {
	if (this.fromLeft === true) {
		this.x = this.x + this.speed * dt;

		if (this.rowShift === true) {
			if (this.x >= COLS[1] && this.y < ROWS[3]) {
				this.y = this.y + this.speed * dt;

				if (Math.abs(this.y - ROWS[3]) < 5) {
					this.y = ROWS[3];
				}
			}
		}
	} else {
		this.x = this.x - this.speed * dt;

		if (this.rowShift === true) {
			if (this.x <= COLS[4] && this.y > ROWS[2]) {
				this.y = this.y - this.speed * dt;

				if (Math.abs(this.y - ROWS[2]) < 5) {
					this.y = ROWS[2];
				}
			}
		}
	}
};

// Blues follow the player's x-direction movement while staying on the same row.
var BlueBug = function() {
	Enemy.call(this);
	this.name = "blue";
};
BlueBug.prototype = Object.create(Enemy.prototype);
BlueBug.prototype.constructor = BlueBug;
BlueBug.prototype.update = function(dt, player) {
	if (this.x < player.x) {
		this.sprite =  "images/bug-blue-right.png";
		this.x = this.x + this.speed * dt;
	}

	if (this.x > player.x) {
		this.sprite =  "images/bug-blue-left.png";
		this.x = this.x - this.speed * dt;
	}
};

// Purples target the player if the player is on the same column as them.
var PurpleBug = function() {
	Enemy.call(this);
	this.name = "purple";
	this.sprite = "images/bug-purple-right.png";
	this.locked = false;
};
PurpleBug.prototype = Object.create(Enemy.prototype);
PurpleBug.prototype.constructor = PurpleBug;
PurpleBug.prototype.update = function(dt, player) {
	if ((this.fromLeft && this.x > player.x) || (!this.fromLeft && this.x < player.x)) {
		this.locked = true;
	}

	if (!this.locked) {
		if (this.fromLeft) {
			this.x = this.x + this.speed * dt;
		} else {
			this.x = this.x - this.speed * dt;
		}
	} else {
		this.y = this.y + this.speed * dt;
	}
};


// Generates the specified type of bug.
function generate_bug(type, redIndex) {
	var bug = null;

	switch (type) {
		case "red1":
			bug = new RedBug1();
			bug.y = ROWS[1];
			bug.speed = redSpeeds[0];
			bug.fromLeft = redDirs[0];
			break;
		case "red2":
			bug = new RedBug2();
			bug.y = ROWS[2];
			bug.speed = redSpeeds[1];
			bug.fromLeft = redDirs[1];
			break;
		case "red3":
			bug = new RedBug3();
			bug.y = ROWS[3];
			bug.speed = redSpeeds[2];
			bug.fromLeft = redDirs[2];
			break;
		case "red4":
			bug = new RedBug4();
			bug.y = ROWS[4];
			bug.speed = redSpeeds[3];
			bug.fromLeft = redDirs[3];
			break;
		case "yellow":
			bug = new YellowBug();
			bug.y = ROWS[gen_rand_index(4, 1)];
  		bug.speed = SPEEDS[gen_rand_index(SPEEDS.length, 0)];
			bug.fromLeft = BOOLS[gen_rand_index(BOOLS.length ,0)];
			break;
		case "green":
			bug = new GreenBug();
			bug.y = ROWS[gen_rand_index(2, 2)];
			bug.speed = 150;
			bug.fromLeft = BOOLS[gen_rand_index(BOOLS.length, 0)];
			bug.rowShift = BOOLS[gen_rand_index(BOOLS.length, 0)];
			break;
		case "blue":
			bug = new BlueBug();
			bug.y = blueRow;
			bug.speed = 25;
			bug.fromLeft = BOOLS[gen_rand_index(BOOLS.length ,0)];
			break;
		case "purple":
			bug = new PurpleBug();
			bug.y = ROWS[1];
			bug.speed = 100;
			bug.fromLeft = BOOLS[gen_rand_index(BOOLS.length ,0)];
			break;
	}

	// Conditional for setting sprite for the direction the bug is going
	// and the distance between each bug if a group of a type of bug has more
	// than one member.
	if ((bug.name).match(/^red[1-4]/)) {
		if (bug.fromLeft === true) {
			bug.x = COLS[gen_rand_index(4,1)] + (bug.w + 153) * redIndex;

			// At times `bug.x === NaN`. This is just a temporary fix until I find the cause.
			if (bug.x !== bug.x) {
				bug.x = (bug.w + 153) * redIndex;
			}
		} else {
			bug.sprite = "images/bug-red-left.png";
			bug.x = COLS[gen_rand_index(4,1)] - (bug.w + 153) * redIndex;

			if (bug.x !== bug.x) {
				bug.x = 505 - (bug.w + 153) * redIndex;
			}
		}
	} else {
		if (bug.fromLeft === true) {
			bug.x = LEFT_START_POS;
		} else {

			// Red left bugs share the same sprite path while the others each have their own.
			if ((bug.name).match(/^red[1-4]/) === null) {
				bug.sprite = "images/bug-" + bug.name + "-left.png";
			}
			bug.x = RIGHT_START_POS;
		}
	}
	allEnemies.push(bug);
}
/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
/**
 * @fileOverview All player-specific variables and functions are organized here.
 * @author Noel Noche
 * @version 1.0.0
 */



// Used for selecting a new character each time the current one reaches the top.
var allChars = ['images/char-boy.png',
								'images/char-cat-girl.png',
								'images/char-horn-girl.png',
								'images/char-pink-girl.png',
								'images/char-princess-girl.png'];

// Holds characters that reach the top.
var doneChars = [];

// Holds each player generated in the game.
var playerInstance = null;

// When a new player is created, or when the player starts over after colliding
// with an enemy, they will be invincible until they move.
var freshStart = false;


// Player class.
var Player = function() {

	// Set as open variable since using multiple player sprites.
	this.sprite = null;

	// Adjusted for more forgiving collision detection.
	this.w = 50;
	this.h = 50;
	this.x = COLS[2];
	this.y = ROWS[5];

	// Properties used in `Prototype.check_collision()`.
	this.collided = false;
	this.leftLimit = false;
	this.rightLimit = false;
	this.topLimit = null;
	this.bottomLimit = false;

	// Set to `true` when player reaches top.
	this.done = false;
};
Player.prototype = {

	handleInput: function(dir) {
		this.keyPressed = true;
		if (dir === 'left') { this.x -= 101; }
		if (dir === 'right') { this.x += 101; }
		if (dir === 'up') { this.y -= 83; }
		if (dir === 'down') { this.y += 83; }
	},

	// Collision detection function.
	check_collision: function(enemyArray, doneArray) {

		// Checks if enemy collides with player using basic AABB alogrithm.
		for (var i = 0; i < enemyArray.length; i++) {
			if (this.x < enemyArray[i].x + enemyArray[i].w &&
					this.x + this.w > enemyArray[i].x &&
					this.y < enemyArray[i].y + enemyArray[i].h &&
					this.y + this.h > enemyArray[i].y) {

				if (freshStart === false) {
					this.collided = true;
				}
			}
		}

		// Restricts player within the bounds of the game area.
		if (this.x + this.w > 505) { this.rightLimit = true; }
		if (this.x < 0) { this.leftLimit = true; }
		if (this.y + 171 > 563) { this.bottomLimit = true; }

		// Multiple characters cannot occupy a the same top bound position.
		// This checks for such a condition. `doneArray` holds the characters
		// that made it to the top.
		if (this.y < 0) {
			if (doneArray.length) {
				for (var i = 0; i < doneArray.length; i++) {
					if (this.x === doneArray[i].x) {
						this.topLimit = false;
						break;
					} else {
						this.topLimit = true;
					}
				}
			} else {
				this.topLimit = true;
			}
		}
	},

	update: function(dt) {
		if (this.collided === true) {
			play_sound(collided);
			remove_heart();
			this.x = COLS[2];
			this.y = ROWS[5];
			freshStart = true;
			this.collided = false;
		}

		if (this.leftLimit === true) {
			this.x = COLS[0];
			this.leftLimit = false;
		}

		if (this.rightLimit === true) {
			this.x = COLS[4];
			this.rightLimit = false;
		}

		if (this.topLimit === true) {
			this.y = ROWS[0];
			this.done = true;
		}

		if (this.topLimit === false && allChars.length !== 0) {
			this.y = ROWS[1];
			this.done = false;
				console.dir(this.x + ":" + this.y);
		}

		if (this.bottomLimit === true) {
			this.y = ROWS[5];
			this.bottomLimit = false;
		}
		this.keyPressed = false;
	},

	render: function() {
		ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	}
};


function generate_player() {
	var player = null;
	player = new Player();
	freshStart = true;
	return player;
}


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
	var allowedKeys = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down'
	};

	if (playerInstance) {
		playerInstance.handleInput(allowedKeys[e.keyCode]);
	}
});
/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
/**
 * @fileOverview The code here creates the initial objects and registers key-press events.
 * @author Noel Noche
 * @version 1.0.0
 */



// Generates the initial game entities.
function initialize_objects() {

	if (redNums) {
		for (var i=0; i < redNums[0]; i++) {
			generate_bug("red1", i);
		}
	}

	if (redNums) {
		for (var i=0; i < redNums[1]; i++) {
			generate_bug("red2", i);
		}
	}

	if (redNums) {
		for (var i=0; i < redNums[2]; i++) {
			generate_bug("red3", i);
		}
	}

	if (redNums) {
		for (var i=0; i < redNums[3]; i++) {
			generate_bug("red4", i);
		}
	}

	for (var i=0; i < maxYellow; i++) {
		generate_bug("yellow");
	}

	for (var i=0; i < maxGreen; i++) {
		generate_bug("green");
	}

	for (var i=0; i < maxBlue; i++) {
		generate_bug("blue");
	}

	for (var i=0; i < maxPurple; i++) {
		generate_bug("purple");
	}

	playerInstance = generate_player();

	// Randomly picks one of the five characters.
	playerInstance.sprite = allChars[gen_rand_index(allChars.length, 0)];

	if (randomRocks) {
		generate_rand_rocks();
	}

	if (randomWater) {
		generate_rand_puddles();
	}
}
/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
/**
 * @fileOverview Levels and game grid layout stuff.
 * @author Noel Noche
 * @version 1.0.0
 */



// Holds current level map.
var levelMap = null;

// Using nested array for laying out game tiles.
var mapsData = {

	"map01": [[1,1,1,1,1],
						[2,2,2,2,2],
						[2,2,2,2,2],
						[2,2,2,2,2],
						[2,2,2,2,2],
						[1,1,1,1,1]],

	"map02": [[1,1,1,1,1],
						[2,2,2,2,2],
						[2,2,4,2,2],
						[2,2,2,2,2],
						[2,2,2,2,2],
						[1,1,1,1,1]],

	"map03": [[1,1,1,1,1],
						[2,2,2,2,2],
						[2,2,2,2,2],
						[2,3,2,3,2],
						[2,2,2,2,2],
						[1,1,1,1,1]],

	"map04": [[1,1,1,1,1],
						[2,2,2,2,2],
						[2,4,2,4,2],
						[2,2,2,2,2],
						[2,2,4,2,2],
						[1,1,1,1,1]],

	"map05": [[1,1,1,1,1],
						[2,2,2,2,2],
						[5,3,5,3,5],
						[2,2,2,2,2],
						[3,5,3,5,3],
						[1,1,1,1,1]]
};

var counter = 0;

function set_reds(r1, r2, r3, r4) {
	if (counter === 3) {
		counter = 0;
	}

	var speedIncrease = counter * 25;

	counter++;

	maxRed1 = r1.num;
	maxRed2 =	r2.num;
	maxRed3 = r3.num;
	maxRed4 = r4.num;
	speedRed1 = r1.speed + speedIncrease + gen_rand_index(50,10);
	speedRed2 = r2.speed + speedIncrease + gen_rand_index(50,10);
	speedRed3 = r3.speed + speedIncrease + gen_rand_index(50,10);
	speedRed4 = r4.speed + speedIncrease + gen_rand_index(50,10);
	dirRed1 = r1.dir;
	dirRed2 = r2.dir;
	dirRed3 = r3.dir;
	dirRed4 = r4.dir;
	redNums = [maxRed1, maxRed2, maxRed3, maxRed4];
	redSpeeds = [speedRed1, speedRed2, speedRed3, speedRed4];
	redDirs = [dirRed1, dirRed2, dirRed3, dirRed4];
}

// Creates each level.
function create_level(level) {

	if (level <= 3) {
		levelMap = mapsData.map01;
		var red1 = {num: 2, speed: 50, dir: false};
		var red2 = {num: 1, speed: 50, dir: true};
		var red3 = {num: 2, speed: 50, dir: false};
		var red4 = {num: 1, speed: 50, dir: true};
		set_reds(red1, red2, red3, red4);

	} else if (level > 3 && level <= 6) {
		levelMap = mapsData.map01;
		var red1 = {num: 1, speed: 50, dir: true};
		var red2 = {num: 1, speed: 50, dir: true};
		var red3 = {num: 1, speed: 50, dir: false};
		var red4 = {num: 2, speed: 50, dir: false};
		set_reds(red1, red2, red3, red4);
		maxGreen = 1;
		if (level === 6) {
			maxPurple = 1;
		}

	} else if (level > 6 && level <= 9) {
		levelMap = mapsData.map02;
		var red1 = {num: 1, speed: 50, dir: false};
		var red2 = {num: 1, speed: 50, dir: false};
		var red3 = {num: 1, speed: 120, dir: true};
		var red4 = {num: 2, speed: 50, dir: true};
		set_reds(red1, red2, red3, red4);
		maxYellow = 1;
		if (level === 9) {
			maxBlue = 1;
			blueRow = ROWS[1];
		}

	} else if (level > 9 && level <= 12) {
		levelMap = mapsData.map03;
		var red1 = {num: 1, speed: 50, dir: false};
		var red2 = {num: 0, speed: 50, dir: true};
		var red3 = {num: 1, speed: 50, dir: false};
		var red4 = {num: 3, speed: 20, dir: true};
		set_reds(red1, red2, red3, red4);
		maxYellow = 1;
		maxPurple = 1;

	} else if (level === 13) {
		levelMap = mapsData.map04;
		maxYellow = 1;
		maxGreen = 2;
		maxBlue = 1;
		blueRow = ROWS[1];

	} else if (level > 13 && level <= 16) {
		levelMap = mapsData.map01;
		if (level === 16) {
			waterNum = 3;
			randomWater = true;
		} else {
			rockNum = 3;
			randomRocks = true;
		}
		var red1 = {num: 2, speed:100, dir: false};
		var red2 = {num: 0, speed: 50, dir: true};
		var red3 = {num: 0, speed: 50, dir: false};
		var red4 = {num: 2, speed: 50, dir: true};
		set_reds(red1, red2, red3, red4);
		maxGreen = 2;

	} else if (level > 16 && level <= 19) {
		levelMap = mapsData.map02;
		var red1 = {num: 0, speed: 50, dir: false};
		var red2 = {num: 1, speed: 100, dir: true};
		var red3 = {num: 2, speed: 50, dir: false};
		var red4 = {num: 1, speed: 50, dir: true};
		set_reds(red1, red2, red3, red4);
		maxPurple = 1;
		maxBlue = 1;
		blueRow = ROWS[1];

	} else if (level === 20) {
		levelMap = mapsData.map05;
		maxYellow = 3;
		maxGreen = 1;
		maxPurple = 1;
		maxBlue = 1;
		blueRow = ROWS[3];

	} else {
		gameOver = true;
		gameComplete = true;
	}

	build_map_array(levelMap);
	initialize_objects();
}

// Builds the map array, matching tile object metadata to their corresponding
// position on the game grid. Keep this outside the game loop.
function build_map_array(map) {
	var numRows = 6,
			numCols = 5,
			tileObject = null;

	for (var row = 0, len = map.length; row < len; row++) {
		var rowArray = map[row];
		for (var col = 0, len = rowArray.length; col < len; col++) {
			var imageUrl;

			// Grass tiles.
			if (rowArray[col] === 1) {
					continue;
			}

			// Regular ground tiles.
			if (rowArray[col] === 2) {
					continue;
			}

			// Water tiles.
			if (rowArray[col] === 3) {
				tileObject = generate_tile("water", COLS[col], ROWS[row]);
			}

			// Rock tiles.
			if (rowArray[col] === 4) {
				tileObject = generate_tile("rock", COLS[col], ROWS[row]);
			}

			if (tileObject) {
				if (tileObject.name === "rock") {
					rocksArray.push(tileObject);
				}
				else {
					activeTiles.push(tileObject);
				}
			}
		}
	}
}
/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
/**
 * @fileOverview The game engine puts all the pieces together and runs the game.
 * @authors Noel Noche (original engine.js by Udacity)
 * @version 1.0.0
 */



// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Moller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] ||
			window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
			window.requestAnimationFrame = function(callback, element) {
					var currTime = new Date().getTime();
					var timeToCall = Math.max(0, 16 - (currTime - lastTime));
					var id = window.setTimeout(function() { callback(currTime + timeToCall); },
						timeToCall);
					lastTime = currTime + timeToCall;
					return id;
			};

	if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = function(id) {
					clearTimeout(id);
			};
}());


// Predefined variables for setting up the canvas.
var canvas = document.createElement('canvas'),
		ctx = canvas.getContext('2d'),
		$gameWindowNode = $("#game-window");
		canvas.width = 505;
		canvas.height = 606;
		$gameWindowNode.append(canvas);

// For activating/deactivating canvas click detection when game over.
var $canvas = $("canvas");

// Used in calculating delta time.
var lastTime = null;

// Used to toggle `requestAnimationFrame` state.
var animate = false;

// Signals when the start screen is on.
var splashScreenOn = false;

// Signals when the intro screen is on.
var titleScreenOn = false;

// Signals when the toast ("Get Ready") screen is on.
var toastScreenOn = false;

// Signals when the game starts/ends.
var gameOver = false;

// If player completes the game.
var gameComplete = false;

// Maps each letter in the map array to its corresponding image file.
var	tileMapper = {
	g: 'images/tile-grass.png',
	b: 'images/tile-ground.png',
	w: 'images/tile-water.png',
	r: 'images/tile-rock.png'
};


/* GAME SEGUE HANDLERS..................................................................*/

// Shows the game cartridge screen.
function run_splash_screen() {
	splashScreenOn = true;
	var imgUrl = "images/cartridge.png";
	ctx.drawImage(Resources.get(imgUrl), 0, 0);

	$canvas.click( function() {
		splashScreenOn = false;
		$body.css("backgroundImage", "none");
		$panels.fadeIn(100);

		// Must remove the event handler from canvas to prevent accidental
		// calls to `run_title_screen` during gameplay.
		$canvas.off();

		run_title_screen(canvas.width/2, canvas.height/2);
	});
}

// Handler for game title screen.
function run_title_screen(startX, startY) {
	titleScreenOn = true;
	var x = 0;
	var y = 0;
	var raq = null;
	var newY = ROWS[3];
	var bug = new RedBug1();
	bug.x = startX;
	bug.y = startY;

	var intro = function() {

		ctx.fillStyle = "rgba(0, 150, 255, 1.0)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.font = '16pt "Press Start 2P"';
		ctx.textAlign = "center";
		ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
		ctx.fillText("Bug Frenzy", canvas.width/2, canvas.height/2 - 100);
		ctx.fillText("Press 'S' to start", canvas.width/2, canvas.height/2 - 50);

		bug.x = x;
		bug.y = y;
		bug.render();

		if (x === canvas.width) {
			x = -101;
			newY = ROWS[gen_rand_index(5,1)];
		} {
			x++;
			y = newY + Math.sin(x/10 % 360) * 10;
		}

		if (titleScreenOn === true) {
			raq = window.requestAnimationFrame(function() { intro(); });
		} else {
			window.cancelAnimationFrame(raq);
			raq = null;
			run_toast_screen();
		}
	};

	if (titleScreenOn === true) {
		intro();
	}
}

// Toast screen appears before each level.
function run_toast_screen() {
	toastScreenOn = true;
	var timer = null;

	// Stops the game loop while splash screen runs.
	animate = false;

	ctx.fillStyle = "rgba(0, 150, 255, 1.0)";
	ctx.clearRect(0, 0, canvas.width,canvas.height);
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.font = '16pt "Press Start 2P"';
	ctx.textAlign = "center";
	ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
	ctx.fillText(('Level ' + gameLevel), canvas.width/2, canvas.height/2 - 100);
	ctx.fillText('Get Ready!', canvas.width/2, canvas.height/2 - 50);

	// Using `setTimeout` to give the user time to prepare for the level.
	timer = window.setTimeout(function() {

	// Must cancel the toast screen first or will get a stack overflow error.
	toastScreenOn = false;

	if (gameLevel > 1) {
			window.clearTimeout(timer);
			next_level(gameLevel);
		} else {
			window.clearTimeout(timer);
			create_level(1);
			animate = true;
			init();
		}
	}, 3000);
}

// Ending screen handler.
function run_end_screen() {
	soundtrack.pause();
	animate = false;

	// Timer keeps running if user clicks the screen.
	// Removing all click events prevents this issue.
	$canvas.off();

	ctx.font = '14pt "Press Start 2P"';
	ctx.textAlign = "center";
	ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#ffffff";

	if (gameComplete === true) {
		play_track(1);

		ctx.fillText("Congratulations!", canvas.width/2, canvas.height/2 - 150);
		ctx.fillText("You survived the frenzy", canvas.width/2, canvas.height/2 - 100);
		ctx.fillText("Thanks for playing", canvas.width/2, canvas.height/2 - 50);
		ctx.fillText("Score " + score, canvas.width/2, canvas.height/2);
		ctx.fillText('Press "S" to start again', canvas.width/2, canvas.height/2 + 100);
	} else {
		ctx.fillText("GAME OVER!", canvas.width/2, canvas.height/2 - 100);
		ctx.fillText("Score " + score, canvas.width/2, canvas.height/2);
		ctx.fillText('Press "S" to start again.', canvas.width/2, canvas.height/2 + 100);
	}
}

// Resets conditions and handles segue to next level.
function next_level(level) {
	$levelNode.text("Level " + level);
	reset();
	create_level(level);
	animate = true;
	startTime = new Date().getTime();
	lastTime = Date.now();
	main();
}


/* GAME LOOP & UPDATE FUNCTIONS.........................................................*/

// Main game loop.
function main() {

	// `now` is used in calculating both delta time and the game time.
	// This is important for smooth animation no matter how fast the computer is.
	var now = Date.now(),
			dt = (now - lastTime) / 1000.0;

	update(dt, now);
	render();

	lastTime = now;

	// `requestAnimationFrame` calls `main` as soon as the browser is able to.
	// The loop will keep running until `animate === false`.
	if (animate) { window.requestAnimationFrame(main); }
}

// Updates HUD, game and entity events.
function update(dt, nowArg) {

	// Calculates current elapsed time.
	var currentTime = 180 - parseInt((nowArg - startTime) / 1000) - penalty;

	// So user can turn off/on BGM and sound anytime during gameplay.
	if (gameOver === false) {
		if (soundtrack.ended) {
			sountrack.play();
		}

		musicOn = musicCheckbox.checked;
		soundOn = soundCheckbox.checked;

		if (musicOn === true) {
			soundtrack.play();
		} else {
			soundtrack.pause();
		}
	}

	// Once a new player moves, they are no longer invincible.
	if (playerInstance.keyPressed === true) {
		freshStart = false;
	}

	// Generates new bugs when they surpass the limits of the game grid.
	for (var i = 0, len = allEnemies.length; i < len; i++) {
		if ((allEnemies[i].name).match(/^red[1-4]/)) {
			if (allEnemies[i].x > canvas.width) {
				allEnemies[i].x = LEFT_START_POS;
			} else if (allEnemies[i].x < -101) {
				allEnemies[i].x = RIGHT_START_POS;
			}
		} else if (allEnemies[i].x !== "purple" && allEnemies[i].x > canvas.width || allEnemies[i].x < -101) {
			generate_bug(allEnemies[i].name);
			allEnemies.splice(i,1);
		} else if (allEnemies[i].y > ROWS[5]) {
			generate_bug(allEnemies[i].name);
			allEnemies.splice(i,1);
		}
	}

	// When player object (character) reaches top, a new character is generated at start point.
	if (playerInstance.done === true) {
		doneChars.push(playerInstance);

		// Update character remaining list.
		var index = allChars.indexOf(playerInstance.sprite);
		allChars.splice(index, 1);

		// Checks if there was a gem.
		if (activeGem === true) {
			gemInstance.check_player_get(playerInstance);
		}

		// When all characters are at the top, go to next level.
		if (doneChars.length === 5) {
			var minScore = currentTime * PTS_PER_MIN;

			score += minScore;
			$scoreNode.text("Score " + score);
			gameLevel += 1;

			if (gameLevel !== totalLevels + 1) {
				toastScreenOn = true;
			} else {
				gameComplete = true;
				gameOver = true;
			}

		} else {

			// Removes the column (x) coordinate from the gemCols array to prevent
			// gems from appearing in a finished player spot.
			gemCols.forEach(function(colX) {
				if (playerInstance.x === colX ) {
					var colIndex = gemCols.indexOf(colX);
					gemCols.splice(colIndex, 1);
				}
			});

			playerInstance = generate_player();
			playerInstance.sprite = allChars[gen_rand_index(allChars.length, 0)];
		}
	}

	// No lives, game over.
	if (lives === 0) {
		gameOver = true;
	}

	// Out of time, restart with penalty to reset time.
	if (currentTime === 0) {
		playerInstance.collided = true;
		startTime = new Date().getTime();
		penalty += 50;
	}

	// Updates the player's collision algorithm.
	playerInstance.check_collision(allEnemies, doneChars);

	// Generates a gem every 20 seconds.
	if (parseInt(nowArg/1000) % 20 === 0 && activeGem === false) {
		if (gemCols.length) {
			var randIndex = gen_rand_index(gemCols.length, 0);
			gemInstance = generate_gem(gemCols[randIndex], ROWS[0]);
			gemInstance.start_timer();
			activeGem = true;
		}
	}

	// Updates the time displayed on the DOM.
	if (currentTime !== lastGameTime) {
		$gameTimeNode.text("Time " + currentTime);
	}

	lastGameTime = currentTime;
	updateEntities(dt);
}

// Updates the game objects.
function updateEntities(dt) {
	if (activeTiles.length) {
		for (var i = 0, len = activeTiles.length; i < len; i++) {
			activeTiles[i].update(playerInstance);
		}
	}

	for (var i = 0, len = allEnemies.length; i < len; i++) {
		allEnemies[i].update(dt, playerInstance);
	}

	playerInstance.update(dt);

	for (var i = 0, len = rocksArray.length; i < len; i++) {
		rocksArray[i].update(playerInstance);
	}

	for (var i = 0, len = waterArray.length; i < len; i++) {
		waterArray[i].update(playerInstance);
	}

	if (gemInstance !== null && gemInstance.activeTimer === true && activeGem === true) {
		gemInstance.update_timer(7);
		gemInstance.update();
	} else {
		activeGem = false;
	}
}


/* RENDER FUNCTIONS.....................................................................*/

// Renders the game grid.
function build_map(map) {
	var numRows = 6,
			numCols = 5,
			tileObject;

	for (var row = 0; row < map.length; row++) {
		var rowArray = map[row];

		for (var col = 0; col < rowArray.length; col++) {
			var imageUrl;
			if (rowArray[col] === 1) {
				imageUrl = tileMapper.g;
			}
			if (rowArray[col] === 2) {
				imageUrl = tileMapper.b;
			}
			if (rowArray[col] === 3) {
				imageUrl = tileMapper.w;
			}
			if (rowArray[col] === 5) {
				imageUrl = tileMapper.b;
			}

			if (activeTiles.length) {
				for (var i = 0, len = activeTiles.length; i < len; i++) {
					tileObject = activeTiles[i];

					if (tileObject.x === COLS[col] && tileObject.y === ROWS[row]) {
						imageUrl = tileObject.sprite;
					}
				}
			}
			ctx.drawImage(Resources.get(imageUrl), col * 101, row * 83);
		}
	}
}

// Calls the render functions defined in the game objects.
function renderEntities() {

	// Renders each player character that reached a water block.
	for (var i = 0, len = doneChars.length; i < len; i++) {
		doneChars[i].render();
	}

	for (var i = 0, len = allEnemies.length; i < len; i++) {
		allEnemies[i].render();
	}

	if (gemInstance !== null && gemInstance.activeTimer === true && activeGem === true) {
		gemInstance.render();
	}

	// Renders the rock type Array (the water array is handled by `build_map`).
	for (var i = 0, len = rocksArray.length; i < len; i++) {
		rocksArray[i].render();
	}

	// If all characters reach the top, calculate time.
	if (gameOver === true || gameComplete === true) {
		run_end_screen();
	} else if (toastScreenOn === true) {
		run_toast_screen();
	} else {
		playerInstance.render();
	}
}

// Draws the game level and calls `renderEntities` on every loop iteration.
function render() {

	// Corrects the ghosting that occurs when a character sprite exceeds the bounds
	// of the game area and is corrected by `check_collision`.
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	build_map(levelMap);
	renderEntities();
}


/* INIT & RESET FUNCTIONS...............................................................*/

// Initializes the game.
function init() {
	score = 0;
	$scoreNode.text("Score " + score);

	// Starts the timer.
	startTime = new Date().getTime();
	lastTime = Date.now();

	main();
}

// Resets the game state before each level.
function reset() {
	maxRed1 = null;
	maxRed2 = null;
	maxRed3 = null;
	maxRed4 = null;
	speedRed1 = null;
	speedRed2 = null;
	speedRed3 = null;
	speedRed4 = null;
	dirRed1 = null;
	dirRed2 = null;
	dirRed3 = null;
	dirRed4 = null;
	maxYellow = null;
	maxGreen = null;
	maxBlue = null;
	blueRows = null;
	maxPurple = null;

	// Set these only when using map 1.
	rockNum = null;
	waterNum = null;

	// Randomizes rock/water tiles. Use this only with map 1.
	randomRocks = false;
	randomWater = false;

	allChars = ['images/char-boy.png',
							'images/char-cat-girl.png',
							'images/char-horn-girl.png',
							'images/char-pink-girl.png',
							'images/char-princess-girl.png'];

	doneChars = [];
	gemCols = [0, 101, 202, 303, 404];
	allEnemies = [];
	rocksArray = [];
	waterArray = [];
	activeTiles = [];
	startTime = null;
	endTime = null;
	gameTime = null;
	lastGameTime = null;
	penalty = 0;

	$levelNode.text("Level " + gameLevel);

	if (splashScreenOn === false) {
		if (titleScreenOn === true) {
			titleScreenOn = false;
			gameLevel = 1;

			for (var i = 0; i < 3; i++) {
				add_heart();
			}
		} else if (gameOver === false && gameLevel > 1) {
				return;
		} else if (gameOver === true) {
				gameOver = false;

				if (gameComplete === true) {
					gameComplete = false;
					var livesNode = $(".lives");

					if (livesNode) {
						for (var i = 0; i < livesNode.length; i++) {
							livesNode[i].remove();
						}
					}
				}

				for (var i = 0; i < 3; i++) {
					add_heart();
				}

				lives = 3;
				gameLevel = 1;
				$levelNode.text("Level 1");
				run_toast_screen();

		} else {
				run_splash_screen();
				initialize_audio();
		}
	}
}

/* OTHER STUFF..........................................................................*/

// Loads all the game images using the resource loader (resources.js file).
Resources.load([
	'images/tile-ground.png',
	'images/tile-water.png',
	'images/tile-grass.png',
	'images/tile-rock.png',
	'images/bug-red-right.png',
	'images/bug-red-left.png',
	'images/bug-yellow-right.png',
	'images/bug-yellow-left.png',
	'images/bug-green-right.png',
	'images/bug-green-left.png',
	'images/bug-blue-right.png',
	'images/bug-blue-left.png',
	'images/bug-purple-right.png',
	'images/bug-purple-left.png',
	'images/char-boy.png',
	'images/char-cat-girl.png',
	'images/char-horn-girl.png',
	'images/char-pink-girl.png',
	'images/char-princess-girl.png',
	'images/gem-blue.png',
	'images/gem-green.png',
	'images/gem-orange.png',
	'images/heart.png',
	'images/cartridge.png'
	]);

Resources.onReady(reset);

// User hits "s" key to play again.
window.onkeyup = function(e) {

	if (e.keyCode === 83 && splashScreenOn === false) {
		if (gameOver === true || gameComplete === true || titleScreenOn === true) {

			score = 0;
			$scoreNode.text("Score " + score);

			musicOn = musicCheckbox.checked;
			soundOn = soundCheckbox.checked;
			if (soundOn === true) {
				play_sound(startBlip);
			}

			if (musicOn === true) {
				play_track(0);
			}
			reset();
		}
	}
};
