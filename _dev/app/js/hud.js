/**
 * @fileOverview modules, top-level variables, hud and audio code is organized here.
 * @author Noel Noche
 * @version 4.0.0
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
