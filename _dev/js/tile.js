/**
 * @fileOverview All tile-specific variables and functions are organized here.
 * @author Noel Noche
 * @version 1.0.0
 */

'use strict';

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
