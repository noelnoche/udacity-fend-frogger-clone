(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * @fileOverview A nodeJS module for applying custom behaviors to game entities
 * @author Noel Noche
 * @version 4.0.0
 */
 
'use strict';

// Holds all properties used in the behavior methods
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

// Holds methods used for a timer behavior
var set_timer = {
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
      this.elapsedTime = parseInt(((new Date()) - this.startTime) / 1000, 10);
      
      if (this.elapsedTime > timeLimit) {
        this.stop_timer();
      }
    }
  }
};

// Holds methods used for detecting collision with a non-enemy entity
var take_life = {
  check_collision: function(player) {
    if (this.x === player.x && this.y === player.y) {
      this.penaltyTile = true;
    }
    else {
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

// Holds methods that make an entity impassable
var impassable = {
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

// Binds the behavior to the target entity
function add_behaviors(entityObject, behaviorsArray) {
  var prop = null;

  for (prop in allBehaviorProperties) {
    if (entityObject.hasOwnProperty(prop)) {
      throw 'Entity property conflict!: ' + prop;
    }
    else {
      entityObject[prop] = allBehaviorProperties[prop];
    }
  }
  
  behaviorsArray.forEach(function(component) {
    for (prop in component) {
      entityObject[prop] = component[prop];
    }
  });
}


// Makes functions public
module.exports = {
  set_timer: set_timer,
  take_life: take_life,
  impassable: impassable,
  add_behaviors: add_behaviors
};

},{}],2:[function(require,module,exports){
/**
 * @fileOverview modules, top-level variables, hud and audio code is organized here.
 * @author Noel Noche
 * @version 3.0.0
 */
 
 'use strict';

// Import custom node files
var RandTools = require('./randtools');
var Behaviors = require('./behaviors');
var Resources = require('./resources');

// Used throughout for positioning entities, collision detection etc
var ROWS = [-43, 60, 143, 226, 309, 392];
var COLS = [0, 101, 202, 303, 404];

// For score and lives
var $scoreNode = $('.hud__score');
var score = null;
var PTS_PER_MIN = 1;
var lives = null;

// For levels
var $levelNode = $('.hud__level');
var gameLevel = 1;
var totalLevels = 20;

// For game rate and duration
var $gameTimeNode = $('.hud__time');
var startTime = null;
var endTime = null;
var gameTime = null;
var lastGameTime = null;

// For sound effects
var startBlip = document.getElementById('blip');
var gemGet = document.getElementById('blip');
var collision = document.getElementById('ouch');
var sfxMetadata = [{
  category: 'sfx',
  name: 'start',
  srcObj: startBlip,
  path: 'assets/audio/sfx_blip'
}, {
  category: 'sfx',
  name: 'gem',
  srcObj: gemGet,
  path: 'assets/audio/sfx_blip'
}, {
  category: 'sfx',
  name: 'collision',
  srcObj: collision,
  path: 'assets/audio/sfx_collision'
}];
var sfxBuffer = [new Audio(), new Audio(), new Audio()];
var soundEffects = {};

// For BGM
var bgm1 = document.getElementById('background-music-1');
var bgm2 = document.getElementById('background-music-2');
var bgmMetadata = [{
  category: 'bgm',
  name: 'track_0',
  srcObj: bgm1,
  path: 'assets/audio/bgm_daily_beetle'
}, {
  category: 'bgm',
  name: 'track_1',
  srcObj: bgm2,
  path: 'assets/audio/bgm_vivacity'
}];
var bgMusic = {};
var curTrack = 'track_0';

// For `loadAudio` function
var audioObjArray = [sfxMetadata, bgmMetadata];

// For toggling audio states and volume
var soundOn = false;
var VOLUME = 0.3;
var $audio = $('.hud__audio');

// For showing/hiding game info during initial page load
var $hud = $('.hud').css('opacity', 0);
var $body = $('body');
var $footer = $('.footer').css('opacity', 0);

// For error messages
var $notifier = $('.notifier');

// For for-loops throughout
var i = null;
var len = null;

// For lives indicator
var $livesNode = $('.hud__lives');


// Removes a life heart
function removeHeart() {
  lives -= 1;
  var $lives = $('.lives');

  if ($lives) {
    $lives[0].remove();
  }
}

// Adds extra heart bonuses
function addHeart() {
  lives += 1;

  if (lives <= 5) {
    $livesNode.append('<img class="lives" src="assets/images/heart-small.png">');
  }
  else {
    $livesNode.html('<img class="lives" src="assets/images/heart-small.png">' + ' x ' + lives);
  }
}

// Initializes the audio files when game first loads
function loadAudio() {
  audioObjArray.forEach(function(dataObj) {
    dataObj.forEach(function(obj) {
      var ext = getFormatExtension(obj.srcObj);
      obj.srcObj.src = obj.path + ext;
      obj.srcObj.volume = VOLUME;
      obj.srcObj.load();
      
      if (obj.category === 'sfx') {
        soundEffects[obj.name] = obj.srcObj;
      }
      else if (obj.category === 'bgm') {
        obj.srcObj.loop = true;
        bgMusic[obj.name] = obj.srcObj;
      }
      else {
        $notifier.css("display", "block").text('Error loading audio. See browser console for details.');
        console.error('Error: @loadAudio -- Audio catgeory can only be "sfx" or "bgm"');
      }
    });
  });
}

// This determines which audio format is best for your browser
function getFormatExtension(audio) {
  var extension = null;

  if (audio.canPlayType('audio/mpeg') !== '') {
    extension = '.mp3';
  }

  if (audio.canPlayType('audio/ogg') !== '') {
    extension = '.ogg';
  }

  return extension;
}

// Updates the bgm track and state
function updateBGMstatus() {
  var trk = bgMusic[curTrack];

  if (soundOn === true) {
    trk.play();
  }
  else {
    trk.pause();
  }
}

// Support function for `playSound` function
function audioIsPlaying(sound) {
  return !sound.ended && sound.currentTime > 0;
}

// Makes simultaneous sound effects possible
function playSound(sfxName) {
  var curSfx = null;
  var bufSfx = null;

  curSfx = soundEffects[sfxName];

  if (soundOn) {
    if (!audioIsPlaying(curSfx)) {
      curSfx.play();
    }
    else {
      for (i = 0; i < sfxBuffer.length; i++) {
        bufSfx = sfxBuffer[i];
        
        if (!audioIsPlaying(bufSfx)) {
          bufSfx.src = curSfx.currentSrc;
          bufSfx.load();
          bufSfx.volume = curSfx.volume;
          bufSfx.play();
          sfxBuffer = [new Audio(), new Audio(), new Audio()];
          break;
        }
      }
    }
  }
}

function toggleAudio() {
  soundOn = !soundOn;
  
  if (soundOn === true) {
    $audio.text('off');
  }
  else {
    $audio.text('on');
  }
  
  updateBGMstatus();
}


var $audioBtn = $('.hud__audio-btn');
$audioBtn.click(toggleAudio);
/* xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx *//**
 * @fileOverview All tile-specific variables and functions are organized here
 * @author Noel Noche
 * @version 4.0.0
 */

// Holds tile instances used when building the game board
// Shared with engine.js
var activeTiles = [];

// Sets obstacles for player
// Keep the max number of water/rock tiles to 4, any more risks trapping the player
// Shared with engine.js
var waterArray = [];
var waterInstance = null;
var waterNum = null;
var randomWater = false;
var rocksArray = [];
var rockInstance = null;
var rockNum = null;
var randomRocks = false;


// Using pseudo-classical inheritance for creating each tile type
// There are 4 types: ground, grass, water and rock
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
  this.name = 'ground';
  this.sprite = 'assets/images/tile-ground.png';
};
Ground.prototype = Object.create(Tile.prototype);
Ground.prototype.constructor = Ground;


var Grass = function(sprite) {
  Tile.call(this);
  this.name = 'grass';
  this.sprite = 'assets/images/tile-grass.png';
};
Grass.prototype = Object.create(Tile.prototype);
Grass.prototype.constructor = Grass;


var Water = function(sprite) {
  Tile.call(this);
  this.name = 'water';
  this.sprite = 'assets/images/tile-water.png';
};
Water.prototype = Object.create(Tile.prototype);
Water.prototype.constructor = Water;


var Rock = function(sprite) {
  Tile.call(this);
  this.name = 'rock';
  this.sprite = 'assets/images/tile-rock.png';
};
Rock.prototype = Object.create(Tile.prototype);
Rock.prototype.constructor = Rock;


function generateTile(type, startX, startY) {
  var tile = null;

  // Using Array so that multiple mixin components can be used
  var mixinMethods = null;

  switch (type) {
    case 'ground':
      tile = new Ground();
      mixinMethods = [];
      break;
    case 'grass':
      tile = new Grass();
      mixinMethods = [];
      break;
    case 'water':
      tile = new Water();
      mixinMethods = [Behaviors.take_life];
      break;
    case 'rock':
      tile = new Rock();
      mixinMethods = [Behaviors.impassable];
      break;
  }

  tile.x = startX;
  tile.y = startY;

  Behaviors.add_behaviors(tile, mixinMethods);

  return tile;
}

// Randomizes the arrangement of tiles on the game grid
function randomizeTileArray(tileArray, player) {
  var counter = 0;
  var randCols = RandTools.shuffle([0, 101, 202, 303, 404]);
  var randRows = RandTools.shuffle([143, 226, 309]);
  var used = [player];
  var j = null;
  var k = null;

  for (i = 0; i < randCols.length; i++) {
    var tile = tileArray[i];
    
    if (tile !== undefined) {
      tile.x = randCols[i];
      
      for (j = 0; j < randRows.length; j++) {
        tile.y = randRows[j];
        
        for (k = 0; k < used.length; k++) {
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

// Generates the rocks array. Positions can be randomized
function generateRandRocks(rockNum) {
  for (i = 0; i < rockNum; i++) {
    rockInstance = generateTile('rock', null, null);
    rocksArray.push(rockInstance);
  }
  
  randomizeTileArray(rocksArray, playerInstance);
}

// Generates water tiles. Positions can be randomized
function generateRandPuddles(waterNum) {
  for (i = 0; i < waterNum; i++) {
    waterInstance = generateTile('water', null, null);
    waterArray.push(waterInstance);
  }
  
  randomizeTileArray(waterArray, playerInstance);
  
  // Unlike rocks, water tiles must be generated with the
  // game grid, so we put them in the activeTiles array
  waterArray.forEach(function(puddle) {
    if (puddle !== undefined) {
      activeTiles.push(puddle);
    }
  });
}
/* xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx *//**
 * @fileOverview Gem-specific code
 * @author Noel Noche
 * @version 4.0.0
 */

// Holds the gem instance produced by initialize_objects
// Shared with engine.js
var gemInstance = null;

// Ensures one gem at a time appears
var activeGem = false;

// For generating a randomly weighted gem type
var gemMetadata = [{
  name: 'gem-blue',
  weight: 0.500
}, {
  name: 'gem-green',
  weight: 0.350
}, {
  name: 'gem-orange',
  weight: 0.25
}, {
  name: 'heart',
  weight: 0.1
}];

var weightedGemList = RandTools.make_weighted(gemMetadata);

// Used to keep track of gem positions so they won't appear 
// in a position occupied by a finished character
var gemCols = [0, 101, 202, 303, 404];


// Using pseudo-classical inheritance for creating each gem type
// There are 4 types: blue, green, orange and the life heart
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
  checkPlayerGet: function(player) {
    if (this.x === player.x && this.y === player.y) {
      this.taken = true;
      
      if (this.name === 'heart') {
        this.bonusLife = true;
      }
    }
  },

  update: function() {
    if (this.taken) {
      
      if (soundOn) {
        playSound('start');
      }
      
      if (this.bonusLife) {
        addHeart();
      } else {
        score += this.points;
        $scoreNode.text(score);
      }
      
      this.activeTimer = false;
      this.taken = false;
      this.sprite = '';
      activeGem = false;
    }
  },
  
  render: function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
};


function generateGem() {
  var randIndex = RandTools.gen_rand_index(weightedGemList.length - 1, 0);
  var weightedGem = weightedGemList[randIndex];
  var xPos = gemCols[RandTools.gen_rand_index(4, 0)];
  var yPos = ROWS[0];
  var gemComponents = [Behaviors.set_timer];
  var gem = new Gem();
  
  gem.name = weightedGem;
  gem.x = xPos;
  gem.y = yPos;

  switch (gem.name) {
    case 'gem-blue':
      gem.sprite = 'assets/images/gem-blue.png';
      gem.points = 5;
      break;
    case 'gem-green':
      gem.sprite = 'assets/images/gem-green.png';
      gem.points = 10;
      break;
    case 'gem-orange':
      gem.sprite = 'assets/images/gem-orange.png';
      gem.points = 15;
      break;
    case 'heart':
      gem.sprite = 'assets/images/heart.png';
      gem.bonusLife = true;
      break;
  }
  
  Behaviors.add_behaviors(gem, gemComponents);
  
  return gem;
}
/* xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx *//**
 * @fileOverview Enemy-specific code
 * @author Noel Noche
 * @version 4.0.0
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
var Enemy = function(object) {
  // this.sprite = Resources.get(this.sprite);
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
  
  render: function() {
    try {
      ctx.drawImage(this.sprite, this.x, this.y);
    }
    catch(err) {
      $notifier.css("display", "block").text('An error has occurred. Reloading the game may resolve this.');
      console.log('Error: @Enemy.render() -- ', err);
    }
  }
};


// There are 5 bug types: red, yellow, green, blue and purple
// Reds are the standard bug type that can act on multiple rows
var RedBug1 = function() {
  Enemy.call(this);
  this.name = 'red1';
  this.sprite = Resources.get('assets/images/bug-red-right.png');
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
  this.sprite = Resources.get('assets/images/bug-red-right.png');
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
  this.sprite = Resources.get('assets/images/bug-red-right.png');
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
  this.sprite = Resources.get('assets/images/bug-red-right.png');
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
  this.sprite = Resources.get('assets/images/bug-yellow-right.png');
  this.y = ROWS[RandTools.gen_rand_index(3, 1)];
  this.speed = YELLOW_SPEEDS[RandTools.gen_rand_index(2, 0)];
  this.fromLeft = BOOLS[RandTools.gen_rand_index(1, 0)];
};
YellowBug.prototype = Object.create(Enemy.prototype);
YellowBug.prototype.constructor = YellowBug;


// Greens can change rows at random
var GreenBug = function() {
  Enemy.call(this);
  this.name = 'green';
  this.sprite = Resources.get('assets/images/bug-green-right.png');
  this.y = ROWS[RandTools.gen_rand_index(3, 2)];
  this.speed = RandTools.gen_rand_index(125, 100);
  this.fromLeft = BOOLS[RandTools.gen_rand_index(1, 0)];
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
  this.sprite = Resources.get('assets/images/bug-blue-right.png');
  this.x = COLS[2];
  this.y = null;
  this.speed = 25;
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
  this.sprite = Resources.get('assets/images/bug-purple-right.png');
  this.y = ROWS[1];
  this.speed = RandTools.gen_rand_index(125,100);
  this.fromLeft = BOOLS[RandTools.gen_rand_index(1, 0)];
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


// Populates the `allEnemies` array
function addBug(bug, redIndex) {
 
  // Conditional for setting sprite that matches direction the bug is going
  // and the distance between each bug if a group of a type of bug has more
  // than one member
  if ((bug.name).match(/^red[1-4]/)) {
    if (bug.fromLeft === false) {
      bug.sprite = Resources.get('assets/images/bug-red-left.png');
    }
    
  }
  else if (bug.name !== 'blue') {
    if (bug.fromLeft === true) {
      bug.x = LEFT_START_POS;
    }
    else {
      bug.x = RIGHT_START_POS;
      var spritePath = 'assets/images/bug-' + bug.name + '-left.png';
      bug.sprite = Resources.get(spritePath);
    }
  }
  else {
    bug.sprite = Resources.get('assets/images/bug-blue-right.png');    
  }
  
  allEnemies.push(bug);
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
/* xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx *//**
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
/* xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx *//**
 * @fileOverview Levels and game grid layout stuff
 * @author Noel Noche
 * @version 4.0.0
 */

// Holds current level map
var levelMap = null;

// Using nested array for laying out game tiles
var mapsData = {
  'map01': [
    [1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1]
  ],

  'map02': [
    [1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2],
    [2, 2, 4, 2, 2],
    [2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1]
  ],

  'map03': [
    [1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2],
    [2, 3, 2, 2, 2],
    [2, 2, 2, 3, 2],
    [2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1]
  ],

  'map04': [
    [1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2],
    [2, 4, 2, 4, 2],
    [2, 2, 2, 2, 2],
    [2, 2, 4, 2, 2],
    [1, 1, 1, 1, 1]
  ],

  'map05': [
    [1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2],
    [5, 3, 5, 3, 5],
    [2, 2, 2, 2, 2],
    [3, 5, 3, 5, 3],
    [1, 1, 1, 1, 1]
  ]
};

// Speeds up red bug speed in 3 level intervals
var counter = 0;

function adjustedRedSpeed(baseSpeed) {
  var speed = null;
  var speedIncrease = null;
  var variance = null;
  
  if (counter === 2) {
    counter = 0;
  }
  
  variance = RandTools.gen_rand_index(50, 25);
  speedIncrease = counter * variance;
  counter++;
  speed = baseSpeed + speedIncrease;
  
  return speed;
}

// Generates the red bug entities
// @red(x) - Red bug metadata added in `createLevels` function
function initializeReds(r1, r2, r3, r4) {
  var red1 = null;
  var red2 = null;
  var red3 = null;
  var red4 = null;
  
  if (r1) {
    for (i = 0; i < r1.num; i++) {
      red1 = generateBug('red1');
      red1.x = r1.xPos[i];
      red1.speed = r1.speed;
      red1.fromLeft = r1.dir;
      addBug(red1);
    }
  }
  
  if (r2) {
    for (i = 0; i < r2.num; i++) {
      red2 = generateBug('red2');
      red2.x = r2.xPos[i];
      red2.speed = r2.speed;
      red2.fromLeft = r2.dir;
      addBug(red2);
    }
  }
  
  if (r3) {
    for (i = 0; i < r3.num; i++) {
      red3 = generateBug('red3');
      red3.x = r3.xPos[i];
      red3.speed = r3.speed;
      red3.fromLeft = r3.dir;
      addBug(red3);
    }
  }
  
  if (r4) {
    for (i = 0; i < r4.num; i++) {
      red4 = generateBug('red4');
      red4.x = r4.xPos[i];
      red4.speed = r4.speed;
      red4.fromLeft = r4.dir;
      addBug(red4);
    }
  }
}

// Generates the other bug types
// @y,g,b,p - Bug metadata added in `createLevels` function
function initializeOthers(y, g, b, p) {
  var yellow = null;
  var green = null;
  var blue = null;
  var purple = null;
  
  if (y) {
    for (i = 0; i < y.num; i++) {
      yellow = generateBug('yellow');
      addBug(yellow);
    }
  }
  
  if (g) {
    for (i = 0; i < g.num; i++) {
      green = generateBug('green');
      addBug(green);
    }
  }
  
  if (b) {
    for (i = 0; i < b.num; i++) {
      blue = generateBug('blue');
      blue.y = b.yPos[i];
      addBug(blue);
    }
  }
  
  if (p) {
    for (i = 0; i < p.num; i++) {
      purple = generateBug('purple');
      addBug(purple);
    }
  }
}


// Creates and sets up each level
function createLevel(level) {
  
  // Holds metadata for each bug type
  var r1 = null;
  var r2 = null;
  var r3 = null;
  var r4 = null;
  var y = null;
  var g = null;
  var b = null;
  var p = null;

  if (level === 1) {
    levelMap = mapsData.map01;
    
    r1 = {
      num: 1,
      xPos: [COLS[0]],
      speed: adjustedRedSpeed(35),
      dir: false
    };
    
    r2 = {
      num: 2,
      xPos: [COLS[2], COLS[4]],
      speed: adjustedRedSpeed(35),
      dir: true
    };
    
    r3 = {
      num: 1,
      xPos: [COLS[3]],
      speed: adjustedRedSpeed(35),
      dir: true
    };
    
    r4 = {
      num: 2,
      xPos: [COLS[0], COLS[4]],
      speed: adjustedRedSpeed(35),
      dir: false
    };    
  }

  else if (level === 2) {
    levelMap = mapsData.map01;
    
    r1 = {
      num: 2,
      xPos: [COLS[0], COLS[3]],
      speed: adjustedRedSpeed(45),
      dir: true
    };
    
    r2 = {
      num: 1,
      xPos: [COLS[4]],
      speed: adjustedRedSpeed(45),
      dir: true
    };
    
    r3 = {
      num: 2,
      xPos: [COLS[1], COLS[4]],
      speed: adjustedRedSpeed(45),
      dir: false
    };
    
    r4 = {
      num: 2,
      xPos: [COLS[0], COLS[4]],
      speed: adjustedRedSpeed(45),
      dir: false
    };    
  }
  
  else if (level === 3) {
    levelMap = mapsData.map01;
    
    r1 = {
      num: 2,
      xPos: [COLS[0], COLS[2]],
      speed: adjustedRedSpeed(55),
      dir: true
    };
    
    r2 = {
      num: 2,
      xPos: [COLS[2], COLS[4]],
      speed: adjustedRedSpeed(55),
      dir: false
    };
    
    r3 = {
      num: 2,
      xPos: [COLS[1], COLS[3]],
      speed: adjustedRedSpeed(55),
      dir: true
    };
    
    r4 = {
      num: 2,
      xPos: [COLS[0], COLS[4]],
      speed: adjustedRedSpeed(55),
      dir: false
    };
  }
  
  else if (level === 4) {
    levelMap = mapsData.map01;
    
    r1 = {
      num: 2,
      xPos: [COLS[0], COLS[3]],
      speed: adjustedRedSpeed(35),
      dir: false
    };
    
    r2 = {
      num: 1,
      xPos: [COLS[2]],
      speed: adjustedRedSpeed(35),
      dir: false
    };
    
    r4 = {
      num: 2,
      xPos: [COLS[1], COLS[4]],
      speed: adjustedRedSpeed(35),
      dir: false
    };
    
    y = null;
    g = {
      num: 1
    };
    b = null;
    p = null;
  }
  
  else if (level === 5) {
    levelMap = mapsData.map01;
    
    r1 = {
      num: 3,
      xPos: [COLS[0], COLS[2], COLS[3]],
      speed: adjustedRedSpeed(45),
      dir: true
    };
    
    r4 = {
      num: 2,
      xPos: [COLS[0], COLS[4]],
      speed: adjustedRedSpeed(45),
      dir: true
    };
    
    y = null;
    g = {
      num: 2
    };
    b = null;
    p = null;
  }
 
  else if (level === 6) {
    levelMap = mapsData.map02;
    
    r1 = {
      num: 2,
      xPos: [COLS[0], COLS[2]],
      speed: adjustedRedSpeed(25),
      dir: false
    };
    
    r4 = {
      num: 2,
      xPos: [COLS[0], COLS[3]],
      speed: adjustedRedSpeed(55),
      dir: true
    };
    
    y = null;
    g = {
      num: 1
    };
    b = null;
    p = null;
  }
  
  else if (level === 7) {
    levelMap = mapsData.map02;
    
    r1 = {
      num: 2,
      xPos: [COLS[0], COLS[4]],
      speed: adjustedRedSpeed(35),
      dir: false
    };
    
    r3 = {
      num: 1,
      xPos: [COLS[3]],
      speed: adjustedRedSpeed(35),
      dir: true
    };
    
    r4 = {
      num: 2,
      xPos: [COLS[0], COLS[3]],
      speed: adjustedRedSpeed(35),
      dir: true
    };
    
    y = null;
    g = {
      num: 1
    };
    b = null;
    p = null;
  }

  else if (level === 8) {
    levelMap = mapsData.map02;
    
    r1 = {
      num: 2,
      xPos: [COLS[1], COLS[4]],
      speed: adjustedRedSpeed(45),
      dir: false
    };
    
    
    r4 = {
      num: 2,
      xPos: [COLS[0], COLS[2]],
      speed: adjustedRedSpeed(45),
      dir: false
    };
    
    y = {
      num: 1
    };
    g = {
      num: 1
    };
    b = null;
    p = null;
  }

  else if (level === 9) {
    levelMap = mapsData.map03;
    
    r1 = {
      num: 2,
      xPos: [COLS[2], COLS[4]],
      speed: adjustedRedSpeed(55),
      dir: true
    };
    
    
    r4 = {
      num: 2,
      xPos: [COLS[0], COLS[2]],
      speed: adjustedRedSpeed(55),
      dir: false
    };
    
    y = {
      num: 1
    };
    g = {
      num: null
    };
    b = null;
    p = null;
  }
  
  else if (level === 10) {
    levelMap = mapsData.map03;
    
    r1 = {
      num: 3,
      xPos: [COLS[1], COLS[2], COLS[4]],
      speed: adjustedRedSpeed(35),
      dir: true
    };
    
    r4 = {
      num: 1,
      xPos: [COLS[3]],
      speed: adjustedRedSpeed(35),
      dir: false
    };
    
    y = {
      num: 1
    };
    g = {
      num: 1
    };
    b = null;
    p = null;
  }

  else if (level === 11) {
    levelMap = mapsData.map03;
    
    r1 = {
      num: 2,
      xPos: [COLS[1], COLS[3]],
      speed: adjustedRedSpeed(45),
      dir: true
    };
    
    r4 = {
      num: 1,
      xPos: [COLS[4]],
      speed: adjustedRedSpeed(45),
      dir: true
    };
    
    y = {
      num: 1
    };
    g = null;
    b = null;
    p = {
      num: 1
    };
  }

  else if (level === 12) {
    levelMap = mapsData.map04;

    r3 = {
      num: 1,
      xPos: [COLS[4]],
      speed: adjustedRedSpeed(55),
      dir: false
    };
    
    y = {
      num: 2
    };
    g = null;
    b = null;
    p = {
      num: 1
    };
  }

  else if (level === 13) {
    levelMap = mapsData.map04;
    
    r3 = {
      num: 1,
      xPos: [COLS[4]],
      speed: adjustedRedSpeed(125),
      dir: false
    };
    
    y = {
      num: 1
    };
    g = {
      num: 1
    };
    b = null;
    p = {
      num: 1
    };
  }

  else if (level === 14) {
    levelMap = mapsData.map04;

    r1 = {
      num: 1,
      xPos: [COLS[2]],
      speed: adjustedRedSpeed(35),
      dir: true
    };
    
    y = {
      num: 2
    };
    g = null;
    b = null;
    p = {
      num: 1
    };
  }

  else if (level === 15) {
    levelMap = mapsData.map01;
    
    r2 = {
      num: 1,
      xPos: [COLS[3]],
      speed: adjustedRedSpeed(75),
      dir: false
    };
    
    r4 = {
      num: 1,
      xPos: [COLS[4]],
      speed: adjustedRedSpeed(45),
      dir: true
    };
    
    y = {
      num: 1
    };
    g = {
      num: 1
    };
    b = {
      num: 1,
      yPos: [ROWS[1]]
    };
    p = null;
    
    rockNum = 3;
    randomRocks = true;
  }

  else if (level === 16) {
    levelMap = mapsData.map01;
    
    r4 = {
      num: 1,
      xPos: [COLS[4]],
      speed: adjustedRedSpeed(100),
      dir: true
    };
    
    y = {
      num: 1,
    };
    g = null;
    b = {
      num: 1,
      yPos: [ROWS[1]]
    };
    p = {
      num: 1
    };
    
    rockNum = 3;
    randomRocks = true;
  }

  else if (level === 17) {
    levelMap = mapsData.map01;
    
    r3 = {
      num: 1,
      xPos: [COLS[4]],
      speed: adjustedRedSpeed(100),
      dir: true
    };
    
    y = {
      num: 2,
    };
    g = {
      num: 1
    };
    b = null;
    p = {
      num: 1
    };
    
    waterNum = 3;
    randomWater = true;
  }
  
  else if (level === 18) {
    levelMap = mapsData.map01;
    
    y = {
      num: 3,
    };
    g = null;
    b = {
      num: 1,
      yPos: [ROWS[1]]
    };
    p = null;
    
    waterNum = 3;
    randomWater = true;
  }
  
  else if (level === 19) {
    levelMap = mapsData.map05;
    
    y = {
      num: 2
    };
    g = null;
    b = {
      num: 1,
      yPos: [ROWS[3]]
    };
    p = null;
  }
  
  else if (level === 20) {
    levelMap = mapsData.map05;

    r1 = {
      num: 1,
      xPos: [COLS[4]],
      speed: adjustedRedSpeed(100),
      dir: true
    };
    
    y = {
      num: 2,
    };
    g = {
      num: 1,
    };
    b = null;
    p = {
      num: 1,
    };
  }

  else {
    gameOver = true;
    gameComplete = true;
  }

  buildMapArray(levelMap);
  initializeReds(r1, r2, r3, r4);
  initializeOthers(y, g, b, p);
  
  playerInstance = generatePlayer();
  playerInstance.sprite = allChars[RandTools.gen_rand_index(allChars.length - 1, 0)];

  if (randomRocks) {
    generateRandRocks(rockNum, playerInstance);
  }

  if (randomWater) {
    generateRandPuddles(waterNum, playerInstance);
  }
}


// Builds the map array, matching tile object metadata to their corresponding
// position on the game grid. Keep this outside the game loop.
function buildMapArray(map) {
  var tileObject = null;
  var mapLen = map.length;
  var rowArray = null;
  var rowLen = null;

  for (var row = 0; row < mapLen; row++) {
    rowArray = map[row];
    rowLen = rowArray.length;
    
    for (var col = 0; col < rowLen; col++) {
      
      // Grass tiles
      if (rowArray[col] === 1) {
        continue;
      }
      
      // Regular ground tiles
      if (rowArray[col] === 2) {
        continue;
      }
      
      // Water tiles
      if (rowArray[col] === 3) {
        tileObject = generateTile('water', COLS[col], ROWS[row]);
      }
      
      // Rock tiles
      if (rowArray[col] === 4) {
        tileObject = generateTile('rock', COLS[col], ROWS[row]);
      }
      
      if (tileObject) {
        if (tileObject.name === 'rock') {
          rocksArray.push(tileObject);
        } else {
          activeTiles.push(tileObject);
        }
      }
    }
  }
}
/* xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx *//**
 * @fileOverview The game engine puts all the pieces together and runs the game
 * @authors Noel Noche
 * @version 4.0.0
 */

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Moller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
      window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() {
          callback(currTime + timeToCall);
        },
        timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
}());

// Predefined variables for setting up the canvas
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var $gameWindowNode = $('.game-window');

canvas.width = 505;
canvas.height = 606;
canvas.className = "canvas canvas--split-view";
$gameWindowNode.append(canvas);

// For activating/deactivating canvas click detection when game over
var $canvas = $('canvas');

// For calculating delta time
var lastTime = null;

// For toggling requestAnimationFrame state
var animate = false;

// Signals when the start screen is on
var splashScreenOn = false;

// Signals when the intro screen is on
var titleScreenOn = false;

// Signals when the toast ('Get Ready') screen is on
var toastScreenOn = false;

// Signals when the game starts/ends
var gameOver = false;

// If player completes the game
var gameComplete = false;

// Maps each letter in the map array to its corresponding image file
var tileMapper = {
  g: 'assets/images/tile-grass.png',
  b: 'assets/images/tile-ground.png',
  w: 'assets/images/tile-water.png',
  r: 'assets/images/tile-rock.png'
};


/* GAME SEGUE HANDLERS
..............................................................................*/

// Shows the game cartridge screen
function runSplashScreen() {
  splashScreenOn = true;
  var imgUrl = 'assets/images/cartridge.png';
  ctx.drawImage(Resources.get(imgUrl), 0, 0);

  $canvas.click(function() {
    splashScreenOn = false;
    $body.css('backgroundImage', 'none');
    $hud.animate({opacity: 1});
    $footer.animate({opacity: 1});
    
    // Must remove the event handler from canvas to prevent
    // accidental calls to `runTitleScreen` during gameplay
    $canvas.off();
    
    runTitleScreen(canvas.width / 2, canvas.height / 2);
  });
}

// Toast screen appears before each level
function runToastScreen() {
  toastScreenOn = true;
  var timer = null;

  // Stops the game loop while splash screen runs
  animate = false;

  ctx.fillStyle = 'rgba(0, 150, 255, 1.0)';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = '16pt "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
  ctx.fillText(('Level ' + gameLevel), canvas.width / 2, canvas.height / 2 - 100);
  ctx.fillText('Get Ready!', canvas.width / 2, canvas.height / 2 - 50);

  // Using `setTimeout` to give the user time to prepare for the level
  timer = window.setTimeout(function() {
    
    // Must cancel the toast screen first or will get a stack overflow error
    toastScreenOn = false;
    
    if (gameLevel > 1) {
      window.clearTimeout(timer);
      nextLevel(gameLevel);
    }
    else {
      window.clearTimeout(timer);
      createLevel(1);
      animate = true;
      init();
    }
  }, 3000);
}

// Helper function for `runTitleScreen`
function genBugArray() {
  var bugTypes = ['red1', 'yellow', 'green', 'blue', 'purple'];
  var bugArray = [];
  var bugObj = null;
  
  for (i=0; i< bugTypes.length; i++) {
    bugObj = generateBug(bugTypes[i]);
    bugArray.push(bugObj);  
  }
  
  return bugArray;
}

// Handler for game start screen
function runTitleScreen(startX, startY) {
  titleScreenOn = true;
  var x = 0;
  var y = 0;
  var raq = null;
  var newY = ROWS[3];
  var bugArray = genBugArray();
  var index = 0;
  bugArray = RandTools.shuffle(bugArray);
  
  var bug = bugArray[index];
  bug.x = startX;
  bug.y = startY;
  
  var intro = function() {
    ctx.fillStyle = 'rgba(0, 150, 255, 1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '16pt "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
    ctx.fillText('Bug Frenzy', canvas.width / 2, canvas.height / 2 - 100);
    ctx.fillText('Press "S" to start', canvas.width / 2, canvas.height / 2 - 50);
    
    if (x === canvas.width) {
      index++;
      bug = bugArray[index];
      x = -101;
      newY = ROWS[RandTools.gen_rand_index(5, 1)];
    }
    else {
      x++;
      y = newY + Math.sin(x / 10 % 360) * 10;
    }
    
    if (index === 4) {
      index = 0;
    }
    
    bug.x = x;
    bug.y = y;
    bug.render();
    
    if (titleScreenOn === true) {
      raq = window.requestAnimationFrame(function() {
        intro();
      });
    }
    else {
      window.cancelAnimationFrame(raq);
      raq = null;
      runToastScreen();
    }
  };
  
  if (titleScreenOn === true) {
    intro();
  }
}


// Ending screen handler
function runEndScreen() {
  animate = false;

  // Timer keeps running if user clicks the screen
  // Removing all click events prevents this issue
  $canvas.off();

  ctx.font = '14pt "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  
  loadAudio();
  
  if (gameOver === true && gameComplete === true) {
    curTrack = 'track_1';
    updateBGMstatus();
    
    ctx.fillText('Congratulations!', canvas.width / 2, canvas.height / 2 - 150);
    ctx.fillText('You survived the frenzy', canvas.width / 2, canvas.height / 2 - 100);
    ctx.fillText('Thanks for playing', canvas.width / 2, canvas.height / 2 - 50);
    ctx.fillText('Score ' + score, canvas.width / 2, canvas.height / 2);
    ctx.fillText('Press "S" to start again', canvas.width / 2, canvas.height / 2 + 100);
  }
  else {
    ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2 - 100);
    ctx.fillText('Score ' + score, canvas.width / 2, canvas.height / 2);
    ctx.fillText('Press "S" to start again.', canvas.width / 2, canvas.height / 2 + 100);
  }
}

// Resets conditions and handles segue to next level
function nextLevel(level) {
  $levelNode.text(level);
  reset();
  createLevel(level);
  animate = true;
  startTime = new Date().getTime();
  lastTime = Date.now();
  main();
}


/* GAME LOOP & UPDATE FUNCTIONS
..............................................................................*/

// Main game loop
function main() {

  // `now` is used in calculating both delta time and the game time
  // This is important for smooth animation no matter the CPU speed
  var now = Date.now();
  var dt = (now - lastTime) / 1000.0;

  update(dt, now);
  render();
  lastTime = now;

  // `requestAnimationFrame` calls main as soon as the browser is able to
  // The loop will keep running until `animate === false`
  if (animate) {
    window.requestAnimationFrame(main);
  }
}

// Updates HUD, game and entity events
function update(dt, nowArg) {
  var bugObj = null;

  // Calculates current elapsed time
  var currentTime = 180 - parseInt((nowArg - startTime) / 1000);

  // Once a new player moves, they are no longer invincible
  if (playerInstance.keyPressed === true) {
    freshStart = false;
  }
  
  // Generates new bugs when they surpass the limits of the game grid
  for (i = 0, len = allEnemies.length; i < len; i++) {
    if ((allEnemies[i].name).match(/^red[1-4]/)) {
      if (allEnemies[i].x > canvas.width) {
        allEnemies[i].x = LEFT_START_POS;
      }
      else if (allEnemies[i].x < -101) {
        allEnemies[i].x = RIGHT_START_POS;
      }
    }
    else if (allEnemies[i].name !== 'purple' && allEnemies[i].x > canvas.width || allEnemies[i].x < -101) {
      bugObj = generateBug(allEnemies[i].name);
      addBug(bugObj);
      allEnemies.splice(i, 1);
    }
    else if (allEnemies[i].y > ROWS[5]) {
      bugObj = generateBug(allEnemies[i].name);
      addBug(bugObj);
      allEnemies.splice(i, 1);
    }
  }

  // When player object (character) reaches top, a new character is generated at start point
  if (playerInstance.done === true) {
    doneChars.push(playerInstance);
    
    // Update character remaining list
    var index = allChars.indexOf(playerInstance.sprite);
    allChars.splice(index, 1);
    
    // Checks if there was a gem
    if (activeGem === true) {
      gemInstance.checkPlayerGet(playerInstance);
    }
    
    // When all characters are at the top, go to next level
    if (doneChars.length === 5) {
      var minScore = currentTime * PTS_PER_MIN;
      
      score += minScore;
      $scoreNode.text(score);
      gameLevel += 1;
      
      if (gameLevel !== totalLevels + 1) {
        toastScreenOn = true;
      }
      else {
        gameComplete = true;
        gameOver = true;
      }
    }
    else {
      
      // Removes the column (x) coordinate from the gemCols array to prevent
      // gems from appearing in a finished player spot
      gemCols.forEach(function(colX) {
        if (playerInstance.x === colX) {
          var colIndex = gemCols.indexOf(colX);
          gemCols.splice(colIndex, 1);
        }
      });
      
      playerInstance = generatePlayer();
      playerInstance.sprite = allChars[RandTools.gen_rand_index(allChars.length - 1, 0)];
    }
  }
  
  // No lives, game over :(
  if (lives === 0) {
    gameOver = true;
  }
  
  // Out of time, restart and reset time
  if (currentTime === 0) {
    playerInstance.collided = true;
    startTime = new Date().getTime();
  }

  // Updates the player's collision algorithm
  playerInstance.checkCollision(allEnemies, doneChars);

  // Generates a gem every 20 seconds
  if (parseInt(nowArg / 1000) % 20 === 0 && activeGem === false) {
    if (gemCols.length) {
      gemInstance = generateGem();
      gemInstance.start_timer();
      activeGem = true;
    }
  }
  
  // Updates the time displayed on the DOM
  if (currentTime !== lastGameTime) {
    $gameTimeNode.text(currentTime);
  }

  lastGameTime = currentTime;
  updateEntities(dt);
}

// Updates the game objects
function updateEntities(dt) {
  if (activeTiles.length) {
    for (i = 0, len = activeTiles.length; i < len; i++) {
      activeTiles[i].update(playerInstance);
    }
  }

  for (i = 0, len = allEnemies.length; i < len; i++) {
    allEnemies[i].update(dt, playerInstance);
  }

  playerInstance.update();

  for (i = 0, len = rocksArray.length; i < len; i++) {
    rocksArray[i].update(playerInstance);
  }

  for (i = 0, len = waterArray.length; i < len; i++) {
    waterArray[i].update(playerInstance);
  }

  if (gemInstance !== null && gemInstance.activeTimer === true && activeGem === true) {
    gemInstance.update_timer(7);
    gemInstance.update();
  }
  else {
    activeGem = false;
  }
}


/* RENDER FUNCTIONS
..............................................................................*/

// Renders the game grid
function buildMap(map) {
  var numRows = 6;
  var numCols = 5;
  var tileObject = null;
  
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
        for (i = 0, len = activeTiles.length; i < len; i++) {
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

// Calls the render functions defined in the game objects
function renderEntities() {

  // Renders each player character that reached a water block
  for (i = 0, len = doneChars.length; i < len; i++) {
    doneChars[i].render();
  }

  for (i = 0, len = allEnemies.length; i < len; i++) {
    allEnemies[i].render();
  }

  if (gemInstance !== null && gemInstance.activeTimer === true && activeGem === true) {
    gemInstance.render();
  }

  // Renders the rock type Array (the water array is handled by `buildMap`)
  for (i = 0, len = rocksArray.length; i < len; i++) {
    rocksArray[i].render();
  }

  // If all characters reach the top, calculate time
  if (gameOver === true || gameComplete === true) {
    runEndScreen();
  }
  else if (toastScreenOn === true) {
    runToastScreen();
  }
  else {
    playerInstance.render();
  }
}

// Draws the game level and calls `renderEntities` on every loop iteration
function render() {

  // Corrects the ghosting that occurs when a character sprite exceeds the bounds
  // of the game area and is corrected by `Player.checkCollision`
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  buildMap(levelMap);
  renderEntities();
}


/* INIT & RESET FUNCTIONS
..............................................................................*/

// Initializes the game
function init() {
  score = 0;
  $scoreNode.text(score);

  // Starts the timer
  startTime = new Date().getTime();
  lastTime = Date.now();

  main();
}

// Resets the game state before each level
function reset() {
  rockNum = null;
  waterNum = null;
  randomRocks = false;
  randomWater = false;

  allChars = ['assets/images/char-boy.png',
    'assets/images/char-cat-girl.png',
    'assets/images/char-horn-girl.png',
    'assets/images/char-pink-girl.png',
    'assets/images/char-princess-girl.png'
  ];

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
  curTrack = 'track_0';

  $levelNode.text(gameLevel);

  if (splashScreenOn === false) {
    if (titleScreenOn === true) {
      titleScreenOn = false;
      gameLevel = 1;
      
      for (i = 0; i < 3; i++) {
        addHeart();
      }
    }
    else if (gameOver === false && gameLevel > 1) {
      return;
    }
    else if (gameOver === true) {
      gameOver = false;
      gameComplete = false;
      
      // Reset lives counter
      $('.lives').remove();
      
      for (i = 0; i < 3; i++) {
        $livesNode.append('<img class="lives" src="assets/images/heart-small.png">');
      }
      
      lives = 3;
      gameLevel = 1;
      $levelNode.text('1');
      runToastScreen();
    }
    else {
      runSplashScreen();
    }
  }
}


// Loads all the game images using the resource loader (resources.js file)
// Loading the assets first reduces chances of rendering errors
Resources.load([
  'assets/images/tile-ground.png',
  'assets/images/tile-water.png',
  'assets/images/tile-grass.png',
  'assets/images/tile-rock.png',
  'assets/images/bug-red-right.png',
  'assets/images/bug-red-left.png',
  'assets/images/bug-yellow-right.png',
  'assets/images/bug-yellow-left.png',
  'assets/images/bug-green-right.png',
  'assets/images/bug-green-left.png',
  'assets/images/bug-blue-right.png',
  'assets/images/bug-blue-left.png',
  'assets/images/bug-purple-right.png',
  'assets/images/bug-purple-left.png',
  'assets/images/char-boy.png',
  'assets/images/char-cat-girl.png',
  'assets/images/char-horn-girl.png',
  'assets/images/char-pink-girl.png',
  'assets/images/char-princess-girl.png',
  'assets/images/gem-blue.png',
  'assets/images/gem-green.png',
  'assets/images/gem-orange.png',
  'assets/images/heart.png',
  'assets/images/cartridge.png'
]);

// Initialize the game when image assets are loaded
Resources.onReady(reset);


// User hits 's' key to play again
window.onkeyup = function(e) {
  if (e.keyCode === 83 && splashScreenOn === false) {
    if (gameOver === true || gameComplete === true || titleScreenOn === true) {
      score = 0;
      $scoreNode.text(score);
      
      loadAudio();
      
      if (soundOn === true) {
        playSound('start');
        curTrack = 'track_0';
        updateBGMstatus();
      }
      
      reset();
    }
  }
};

},{"./behaviors":1,"./randtools":3,"./resources":4}],3:[function(require,module,exports){
/**
 * @fileOverview A nodeJS module that provides useful randomizing functions
 * @author Noel Noche
 * @version 4.0.0
 */

'use strict';

// Helper function for generating a random number between
// min (inclusive) and max (exclusive)
function gen_rand_index(max, min) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor((Math.random() * (max - min + 1)) + min);
}

// Shuffles an array using the Fisher-Yates algorithm
function shuffle(arrayArg) {
  var i = null;
  var j = null;
  var temp = null;

  for (i = arrayArg.length - 1; i > 0; --i) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arrayArg[i];
    arrayArg[i] = arrayArg[j];
    arrayArg[j] = temp;
  }

  return arrayArg;
}

// Creates and randomizes an Array of entity ids of different proportions (weights)
// This allows corresponding entity objects to appear at different frequencies
// dataObj = { name: 'ufo', weight: 0.25 }
// @name: the entity id
// @weight: a float between 0 and 1.0
// codetheory.in/weighted-biased-random-number-generation-with-javascript-based-on-probability/
function make_weighted(dataObj) {
  var weightedArray = [];

  for (var i = 0; i < dataObj.length; i++) {
    var multiples = dataObj[i].weight * 1000;
    
    for (var j = 0; j < multiples; j++) {
      weightedArray.push(dataObj[i].name);
    }
  }

  return shuffle(weightedArray);
}


// Makes functions public
module.exports = {
  gen_rand_index: gen_rand_index,
  shuffle: shuffle,
  make_weighted: make_weighted
};

},{}],4:[function(require,module,exports){
/**
 * @fileOverview Resource loader utility provided by Udacity.
 * @author Udacity
 * @version 1.1.0
 */
 
'use strict';

/* Resources.js
* This is simple an image loading utility. It eases the process of loading
* image files so that they can be used within your game. It also includes
* a simple "caching" layer so it will reuse cached images if you attempt
* to load the same image multiple times.
*/
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
  if (resourceCache[url]) {
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
      if (isReady()) {
        readyCallbacks.forEach(function(func) {
          func();
        });
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
  for (var k in resourceCache) {
    if (resourceCache.hasOwnProperty(k) && !resourceCache[k]) {
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


module.exports = {
  load: load,
  get: get,
  onReady: onReady,
  isReady: isReady
};

},{}]},{},[2]);
