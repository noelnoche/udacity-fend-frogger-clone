/**
 * @fileOverview Level-building code
 * @author Noel Noche
 * @version 1.0.0
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

  // Randomizes speed
  variance = RandTools.genRandIndex(50, 25);
  speedIncrease = counter * variance;
  counter++;
  speed = baseSpeed + speedIncrease;
  return speed;
}

// Generates the red bug entities
// @red(x) - Red bug metadata added in createLevels
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
      red1 = selectSprite(red1);
      allEnemies.push(red1);
    }
  }
  if (r2) {
    for (i = 0; i < r2.num; i++) {
      red2 = generateBug('red2');
      red2.x = r2.xPos[i];
      red2.speed = r2.speed;
      red2.fromLeft = r2.dir;
      red2 = selectSprite(red2);
      allEnemies.push(red2);
    }
  }
  if (r3) {
    for (i = 0; i < r3.num; i++) {
      red3 = generateBug('red3');
      red3.x = r3.xPos[i];
      red3.speed = r3.speed;
      red3.fromLeft = r3.dir;
      red3 = selectSprite(red3);
      allEnemies.push(red3);
    }
  }
  if (r4) {
    for (i = 0; i < r4.num; i++) {
      red4 = generateBug('red4');
      red4.x = r4.xPos[i];
      red4.speed = r4.speed;
      red4.fromLeft = r4.dir;
      red4 = selectSprite(red4);
      allEnemies.push(red4);
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
      yellow = selectSprite(yellow);
      allEnemies.push(yellow);
    }
  }
  if (g) {
    for (i = 0; i < g.num; i++) {
      green = generateBug('green');
      green = selectSprite(green);
      allEnemies.push(green);
    }
  }
  if (b) {
    for (i = 0; i < b.num; i++) {
      blue = generateBug('blue');
      blue.y = b.yPos[i];
      blue = selectSprite(blue);
      allEnemies.push(blue);
    }
  }
  if (p) {
    for (i = 0; i < p.num; i++) {
      purple = generateBug('purple');
      purple = selectSprite(purple);
      allEnemies.push(purple);
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
  playerInstance.sprite = allChars[RandTools.genRandIndex(allChars.length - 1, 0)];

  if (randomRocks) {
    generateRandRocks(rockNum, playerInstance);
  }
  if (randomWater) {
    generateRandPuddles(waterNum, playerInstance);
  }
}

// Builds the map array, matching tile object metadata to 
// their corresponding position on the game grid
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
