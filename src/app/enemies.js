/**
 * @fileOverview Enemy-related code
 * @author Noel Noche
 * @version 1.0.0
 */

// Holds all active bug objects
// Shared with engine.js
var allEnemies = [];

// The x-position the bug is regenerated after it passes the edge of the game grid
// Shared with engine.js
var LEFT_START_POS = -101;
var RIGHT_START_POS = 505;

// Used for randomly deciding:
// 1. Speed of yellow bug
// 2. Direction of non-red bugs
// 3. If green bug shifts to different row
var BOOLS = [true, false];

// Base class for the various bug types
// @this.sprite - Loaded in resources.js
// @this.w - Adjusted for more forgiving collision detection
var Enemy = function() {
  this.sprite = null;
  this.name = null;
  this.w = 50;
  this.h = 50;
  this.x = null;
  this.y = null;
  this.speed = null;
  this.fromLeft = false;
};
Enemy.prototype = {
  // Updates the enemy's position
  // @dt - delta time variable
  update: function(dt) {
    if (this.fromLeft === true) {
      this.x = this.x + this.speed * dt;
    }
    else {
      this.x = this.x - this.speed * dt;
    }
  },
  render: function(ctx) {
    try {
      ctx.drawImage(this.sprite, this.x, this.y);
    }
    catch(error) {
      RandTools.showErrorMessage(error);
    }
  }
};

// There are 5 bug types: red, yellow, green, blue and purple
// Reds are the standard bug type that can act on multiple rows
var RedBug1 = function() {
  Enemy.call(this);
  this.name = 'red1';
  this.sprite = null;
  this.x = COLS[2];
  this.y = ROWS[1];
  this.speed = null;
  this.fromLeft = null;
};
RedBug1.prototype = Object.create(Enemy.prototype);
RedBug1.prototype.constructor = RedBug1;

var RedBug2 = function() {
  Enemy.call(this);
  this.name = 'red2';
  this.sprite = null;
  this.x = COLS[2];
  this.y = ROWS[2];
  this.speed = null;
  this.fromLeft = null;
};
RedBug2.prototype = Object.create(Enemy.prototype);
RedBug2.prototype.constructor = RedBug2;

var RedBug3 = function() {
  Enemy.call(this);
  this.name = 'red3';
  this.sprite = null;
  this.x = COLS[1];
  this.y = ROWS[3];
  this.speed = null;
  this.fromLeft = null;
};
RedBug3.prototype = Object.create(Enemy.prototype);
RedBug3.prototype.constructor = RedBug3;

var RedBug4 = function() {
  Enemy.call(this);
  this.name = 'red4';
  this.sprite = null;
  this.x = COLS[2];
  this.y = ROWS[4];
  this.speed = null;
  this.fromLeft = null;
};
RedBug4.prototype = Object.create(Enemy.prototype);
RedBug4.prototype.constructor = RedBug4;

// Yellows appears from random rows at random speeds
var YELLOW_SPEEDS = [100, 200, 300];
var YellowBug = function() {
  Enemy.call(this);
  this.name = 'yellow';
  this.sprite = null;
  this.x = null;
  this.y = ROWS[RandTools.genRandIndex(3, 1)];
  this.speed = YELLOW_SPEEDS[RandTools.genRandIndex(2, 0)];
  this.fromLeft = BOOLS[RandTools.genRandIndex(1, 0)];
};
YellowBug.prototype = Object.create(Enemy.prototype);
YellowBug.prototype.constructor = YellowBug;

// Greens can change rows at random
var GreenBug = function() {
  Enemy.call(this);
  this.name = 'green';
  this.sprite = null;
  this.x = null;
  this.y = ROWS[RandTools.genRandIndex(3, 2)];
  this.speed = RandTools.genRandIndex(125, 100);
  this.fromLeft = BOOLS[RandTools.genRandIndex(1, 0)];
  this.topRowShift = false;
  this.bottomRowShift = false;
};
GreenBug.prototype = Object.create(Enemy.prototype);
GreenBug.prototype.constructor = GreenBug;
GreenBug.prototype.update = function(dt) {
  if (this.fromLeft === true) {
    this.x = this.x + this.speed * dt;
    
    if (this.x >= COLS[1]) {
      if (this.y < ROWS[3] && this.bottomRowShift === false) {
        this.topRowShift = true;
        this.y = this.y + this.speed * dt;
        
        if (Math.abs(this.y - ROWS[3]) < 5) {
          this.y = ROWS[3];
          
          if (this.x - this.w > COLS[4] ) {
            this.topRowShift = false;
          }
        }
      }
      
      if (this.y > ROWS[2] && this.topRowShift === false) {
        this.bottomRowShift = true;
        this.y = this.y - this.speed * dt;
        
        if (Math.abs(this.y - ROWS[2]) < 5) {
          this.y = ROWS[2];
          
          if (this.x - this.w > COLS[4] ) {
            this.bottomRowShift = false;
          }
        }
      }
    }
  }
  else {
    this.x = this.x - this.speed * dt;
    
    if (this.x <= COLS[3]) {
      if (this.y < ROWS[3] && this.bottomRowShift === false) {
        this.topRowShift = true;
        this.y = this.y + this.speed * dt;
        
        if (Math.abs(this.y - ROWS[3]) < 5) {
          this.y = ROWS[3];
          
          if (this.x - this.w < COLS[0] ) {
            this.topRowShift = false;
          }
        }
      }
      
      if (this.y > ROWS[2] && this.topRowShift === false) {
        this.bottomRowShift = true;
        this.y = this.y - this.speed * dt;
        
        if (Math.abs(this.y - ROWS[2]) < 5) {
          this.y = ROWS[2];
          
          if (this.x - this.w < COLS[0] ) {
            this.bottomRowShift = false;
          }
        }
      }
    }   
  }
};

// Blues follow the player's x-direction movement while staying on the same row
var BlueBug = function() {
  Enemy.call(this);
  this.name = 'blue';
  this.sprite = null;
  this.x = COLS[2];
  this.y = null;
  this.speed = 25;
  this.fromLeft = null;
};
BlueBug.prototype = Object.create(Enemy.prototype);
BlueBug.prototype.constructor = BlueBug;
BlueBug.prototype.update = function(dt, player) {
  if (this.x < player.x) {
    this.sprite = Resources.get('assets/images/bug-blue-right.png');
    this.x = this.x + this.speed * dt;
  }

  if (this.x > player.x) {
    this.sprite = Resources.get('assets/images/bug-blue-left.png');
    this.x = this.x - this.speed * dt;
  }
};

// Purples move on the top row then targets the player when y-positions overlap
var PurpleBug = function() {
  Enemy.call(this);
  this.name = 'purple';
  this.sprite = null;
  this.x = null;
  this.y = ROWS[1];
  this.speed = RandTools.genRandIndex(125,100);
  this.fromLeft = BOOLS[RandTools.genRandIndex(1, 0)];
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
    }
    else {
      this.x = this.x - this.speed * dt;
    }
  }
  else {
    this.y = this.y + this.speed * dt;
  }
};

// Adds the appropriate bug to allEnemies array
function selectSprite(bug) {
  // Conditional for setting sprite that matches direction the bug is going
  var name = null;
  var spritePath = null;

  if ((bug.name).match(/^red[1-4]/)) {
    name = 'red';
  }
  else {
    name = bug.name;
  }

  if (bug.fromLeft === true) {
    if (bug.x === null) {
      bug.x = LEFT_START_POS;
    }
    spritePath = 'assets/images/bug-' + name + '-right.png';
  }
  else {
    if (bug.x === null) {
      bug.x = RIGHT_START_POS;
    }
    spritePath = 'assets/images/bug-' + name + '-left.png';
  }


  bug.sprite = Resources.get(spritePath);
  return bug;
}

function generateBug(type) {
  var bug = null;
  
  switch (type) {
    case 'red1':
      bug = new RedBug1();
      break;
    case 'red2':
      bug = new RedBug2();
      break;
    case 'red3':
      bug = new RedBug3();
      break;
    case 'red4':
      bug = new RedBug4();
      break;
    case 'yellow':
      bug = new YellowBug();
      break;
    case 'green':
      bug = new GreenBug();
      break;
    case 'blue':
      bug = new BlueBug();
      break;
    case 'purple':
      bug = new PurpleBug();
      break;
  }
  
  return bug;
}
