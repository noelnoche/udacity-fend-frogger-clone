/**
 * @fileOverview Player-specific variables and functions
 * @author Noel Noche
 * @version 4.0.0
 */

// Used for selecting a new character each time the current one reaches the top
var allChars = ['images/char-boy.png',
  'images/char-cat-girl.png',
  'images/char-horn-girl.png',
  'images/char-pink-girl.png',
  'images/char-princess-girl.png'
];

// Holds characters that reach the top
// Shared with engine.js
var doneChars = [];

// When a new player is created, or when the player starts over after
// colliding with an enemy, they will be invincible until they move
// Shared with engine.js
var freshStart = false;


// Holds a player object created by `generatePlayer` function
// Shared with levels.js and engine.js
var playerInstance = null;

var Player = function() {

  // Set as open variable since using multiple player sprites
  this.sprite = null;

  // Adjusted for more forgiving collision detection
  this.w = 50;
  this.h = 50;
  this.x = COLS[2];
  this.y = ROWS[5];

  // Properties used in `Prototype.check_collision` method
  this.collided = false;
  this.leftLimit = false;
  this.rightLimit = false;
  this.topLimit = null;
  this.bottomLimit = false;

  // Set to true when player reaches top
  this.done = false;
};
Player.prototype = {
  handleInput: function(dir) {
    this.keyPressed = true;

    if (dir === 'left') {
      this.x -= 101;
    }
    if (dir === 'right') {
      this.x += 101;
    }
    if (dir === 'up') {
      this.y -= 83;
    }
    if (dir === 'down') {
      this.y += 83;
    }
  },
  
  checkCollision: function(enemyArray, doneArray) {
    
    // Checks if enemy collides with player using basic AABB alogrithm
    for (i = 0; i < enemyArray.length; i++) {
      if (this.x < enemyArray[i].x + enemyArray[i].w &&
        this.x + this.w > enemyArray[i].x &&
        this.y < enemyArray[i].y + enemyArray[i].h &&
        this.y + this.h > enemyArray[i].y) {
          
        if (freshStart === false) {
          this.collided = true;
        }
      }
    }
    
    // Restricts player within the bounds of the game area
    if (this.x + this.w > 505) {
      this.rightLimit = true;
    }
    
    if (this.x < 0) {
      this.leftLimit = true;
    }
    
    if (this.y + 171 > 563) {
      this.bottomLimit = true;
    }
    
    // Multiple characters cannot occupy a the same top bound position
    // `doneArray` keeps track of characters that made it to the top
    if (this.y < 0) {
      if (doneArray.length) {
        for (i = 0; i < doneArray.length; i++) {
          if (this.x === doneArray[i].x) {
            this.topLimit = false;
            break;
          } else {
            this.topLimit = true;
          }
        }
      }
      else {
        this.topLimit = true;
      }
    }
  },

  update: function(dt) {
    if (this.collided === true) {
      playSound('collision');
      removeHeart();
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


function generatePlayer() {
  var player = null;
  player = new Player();
  freshStart = true;
  return player;
}


// Listens for key presses and sends the keys to the `Player.handleInput` method
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
