/**
 * @fileOverview Top-level variables, hud and audio code is organized here.
 * @author Noel Noche
 * @version 1.0.0
 */

'use strict';

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