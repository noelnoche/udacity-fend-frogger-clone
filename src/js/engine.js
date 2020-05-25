/**
 * @fileOverview The game engine puts all the pieces together and runs the game
 * @authors Noel Noche
 * @version 4.5.0
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
    // eslint-disable-next-line
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

// Canvas setup
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

// Signals when the toast (Get Ready) screen is on
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
------------------------------------------------------------------------------*/
// Shows the game cartridge screen
function runSplashScreen() {
  var imgUrl = 'assets/images/cartridge.png';
  splashScreenOn = true;
  ctx.drawImage(Resources.get(imgUrl), 0, 0);

  $canvas.click(function() {
    splashScreenOn = false;
    $body.css('backgroundImage', 'none');
    $hud.animate({opacity: 1});
    $footer.animate({opacity: 1});
    
    // Must remove the event handler from canvas to prevent
    // accidental calls to runTitleScreen during gameplay
    $canvas.off();
    
    runTitleScreen(canvas.width / 2, canvas.height / 2);
  });
}

// Toast screen appears before each level
function runToastScreen() {
  var timer = null;
  toastScreenOn = true;
  
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

  // Gives the user time to prepare for the level
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

// Helper function for runTitleScreen
function genTitleScreenBugs() {
  var bugTypes = ['red1', 'yellow', 'green', 'blue', 'purple'];
  var bugArray = [];
  var bugObj = null;

  for (i = 0; i < bugTypes.length; i++) {
    bugObj = generateBug(bugTypes[i]);
    bugObj.fromLeft = true;
    bugObj = selectSprite(bugObj);
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
  var bugArray = genTitleScreenBugs();
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
      newY = ROWS[RandTools.genRandIndex(5, 1)];
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
    bug.render(ctx);
    
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
------------------------------------------------------------------------------*/
// Main game loop
function main() {
  // Calculates delta time for smooth animation no matter the CPU speed
  var now = Date.now();
  var dt = (now - lastTime) / 1000.0;

  update(dt, now);
  render();
  lastTime = now;

  // requestAnimationFrame calls main as soon as the browser is able to
  // The loop will keep running until animate === false
  if (animate === true) {
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
    playerInstance.freshStart = false;
  }
  var bugInstance = null;
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
      bugInstance = selectSprite(bugObj);
      allEnemies.push(bugInstance);
      allEnemies.splice(i, 1);
    }
    else if (allEnemies[i].y > ROWS[5]) {
      bugObj = generateBug(allEnemies[i].name);
      bugInstance = selectSprite(bugObj);
      allEnemies.push(bugInstance);
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
      playerInstance.sprite = allChars[RandTools.genRandIndex(allChars.length - 1, 0)];
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
    gemInstance.update(activeGem);
  }
  else {
    activeGem = false;
  }
}


/* RENDER FUNCTIONS
------------------------------------------------------------------------------*/
// Renders the game grid
function buildMap(map) {
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
    doneChars[i].render(ctx);
  }

  for (i = 0, len = allEnemies.length; i < len; i++) {
    allEnemies[i].render(ctx);
  }

  if (gemInstance !== null && gemInstance.activeTimer === true && activeGem === true) {
    gemInstance.render(ctx);
  }

  // Renders the rock type Array (the water array is handled by buildMap)
  for (i = 0, len = rocksArray.length; i < len; i++) {
    rocksArray[i].render(ctx);
  }

  // If all characters reach the top, calculate time
  if (gameOver === true || gameComplete === true) {
    runEndScreen();
  }
  else if (toastScreenOn === true) {
    runToastScreen();
  }
  else {
    playerInstance.render(ctx);
  }
}

// Draws the game level and calls renderEntities on every loop iteration
function render() {
  // Corrects the ghosting that occurs when a character sprite exceeds the bounds
  // of the game area and is corrected by Player.checkCollision
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  buildMap(levelMap);
  renderEntities();
}


/* PRE-GAME FUNCTIONS
------------------------------------------------------------------------------*/
// Initializes the game, score and timer
function init() {
  score = 0;
  $scoreNode.text(score);
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
  lastGameTime = null;
  curTrack = 'track_0';

  $levelNode.text(gameLevel);

  if (splashScreenOn === false) {
    if (titleScreenOn === true) {
      titleScreenOn = false;
      gameLevel = 1;
      
      for (i = 0; i < 5 ; i++) {
        addHeart();
      }
    }
    else if (gameOver === false && gameLevel > 1) {
      return;
    }
    else if (gameOver === true) {
      gameOver = false;
      gameComplete = false;
      resetLives(5);
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
