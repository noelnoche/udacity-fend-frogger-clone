/**
 * @fileOverview Gem-specific code is organized here.
 * @author Noel Noche
 * @version 1.0.0
 */

'use strict';

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