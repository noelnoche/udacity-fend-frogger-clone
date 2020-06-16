/**
 * @fileOverview Game tile code
 * @author Noel Noche
 * @version 1.0.0
 */
 
// Holds tile instances used when building the game board
// Shared with engine.js
var activeTiles = [];

// Keeps the max number of water/rock tiles to 4, 
// any more risks trapping the player
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
var Tile = function() {
  this.name = null;
  this.sprite = null;
  this.w = 101;
  this.h = 171;
  this.x = null;
  this.y = null;
};
Tile.prototype.render = function(ctx) {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

var Ground = function() {
  Tile.call(this);
  this.name = 'ground';
  this.sprite = 'assets/images/tile-ground.png';
};
Ground.prototype = Object.create(Tile.prototype);
Ground.prototype.constructor = Ground;

var Grass = function() {
  Tile.call(this);
  this.name = 'grass';
  this.sprite = 'assets/images/tile-grass.png';
};
Grass.prototype = Object.create(Tile.prototype);
Grass.prototype.constructor = Grass;

var Water = function() {
  Tile.call(this);
  this.name = 'water';
  this.sprite = 'assets/images/tile-water.png';
};
Water.prototype = Object.create(Tile.prototype);
Water.prototype.constructor = Water;

var Rock = function() {
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
      mixinMethods = [Behaviors.takeLife];
      break;
    case 'rock':
      tile = new Rock();
      mixinMethods = [Behaviors.impassable];
      break;
  }

  tile.x = startX;
  tile.y = startY;
  Behaviors.addBehaviors(tile, mixinMethods);
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

// Generates the rocks array; positions can be randomized
function generateRandRocks(rockNum) {
  for (i = 0; i < rockNum; i++) {
    rockInstance = generateTile('rock', null, null);
    rocksArray.push(rockInstance);
  }
  randomizeTileArray(rocksArray, playerInstance);
}

// Generates water tiles; positions can be randomized
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
