/**
 * @fileOverview The code here creates the initial objects and registers key-press events.
 * @author Noel Noche
 * @version 1.0.0
 */

'use strict';

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