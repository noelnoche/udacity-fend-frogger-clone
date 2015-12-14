/**
 * @fileOverview Enemy-specific code is organized here.
 * @author Noel Noche
 * @version 1.0.0
 */

'use strict';

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