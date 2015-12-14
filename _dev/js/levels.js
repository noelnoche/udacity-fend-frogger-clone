/**
 * @fileOverview Levels and game grid layout stuff.
 * @author Noel Noche
 * @version 1.0.0
 */

'use strict';

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