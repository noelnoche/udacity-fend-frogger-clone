/**
 * @fileOverview modules, top-level variables, hud and audio code is organized here.
 * @author Noel Noche
 * @version 2.0.0
 */

// Applied to concatenated file
'use strict';

// Import custom node files
var RandTools = require('./randtools');
var Behaviors = require('./behaviors');
var Resources = require('./resources');

// Used throughout for positioning entities, collision detection etc
var ROWS = [-43, 60, 143, 226, 309, 392];
var COLS = [0, 101, 202, 303, 404];

// For score and lives
var $scoreNode = $('#game-score');
var score = null;
var PTS_PER_MIN = 1;
var penalty = 0;
var lives = null;

// For levels
var $levelNode = $('#level-indicator');
var gameLevel = 1;
var totalLevels = 20;

// For game rate and duration
var $gameTimeNode = $('#game-time');
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

// For load_audio
var audioObjArray = [sfxMetadata, bgmMetadata];

// For toggling audio states and volume
var soundOn = false;
var musicOn = false;
var VOLUME = 0.3;

// For audio toggle switches
var musicCheckbox = document.getElementById('checkbox-music');
var soundCheckbox = document.getElementById('checkbox-sound');
var musicOn = musicCheckbox.checked;
var soundOn = soundCheckbox.checked;

// For showing/hiding game info during initial page load
var $panels = $('.side-panels').hide();
var $body = $('body');

// For error messages
var $notifier = $('#notifier');

// For for-loops
var i, len;

// For lives indicator
var $livesNode = $('#lives');

// Removes a life heart
function remove_heart() {
  lives -= 1;
  var $lives = $('.lives');

  if ($lives.length) {
    $lives[0].remove();
  }
}

// Adds extra heart bonuses
function add_heart() {
  lives += 1;

  if (lives < 10) {
    $livesNode.append('<li class="lives"><img src="assets/images/heart-small.png"></li>');
  } else {
    $livesNode.html('<li class="lives"><img src="assets/images/heart-small.png"></li>' + ' ' + lives);
  }
}

// Initializes the audio files when game first loads
function load_audio() {
  audioObjArray.forEach(function(dataObj) {
    dataObj.forEach(function(obj) {
      var ext = get_format_extension(obj.srcObj);
      obj.srcObj.src = obj.path + ext;
      obj.srcObj.volume = VOLUME;
      obj.srcObj.load();
      if (obj.category === 'sfx') {
        soundEffects[obj.name] = obj.srcObj;
      } else if (obj.category === 'bgm') {
        bgMusic[obj.name] = obj.srcObj;
      } else {
        $notifier.text('Error loading audio. See browser console for details.').attr('class', '');
        console.error('Error: @load_audio -- Audio catgeory can only be "sfx" or "bgm"');
      }
    });
  });
}

// This determines which audio format is best for your browser
function get_format_extension(audio) {
  var extension;

  if (audio.canPlayType('audio/mpeg') !== '') {
    extension = '.mp3';
  }

  if (audio.canPlayType('audio/ogg') !== '') {
    extension = '.ogg';
  }

  return extension;
}

// Updates the bgm track and state
function update_bgm_status() {
  var trk = bgMusic[curTrack];

  if (musicOn === true) {
    trk.play();
  } else {
    trk.pause();
  }
}

// Support function for play_sound
function audio_is_playing(sound) {
  return !sound.ended && sound.currentTime > 0;
}

// Makes simultaneous sound effects possible
function play_sound(sfxName) {
  var curSfx, bufSfx;

  curSfx = soundEffects[sfxName];

  if (soundOn) {

    if (!audio_is_playing(curSfx)) {
      curSfx.play();
    } else {
      for (i = 0; i < sfxBuffer.length; i++) {
        bufSfx = sfxBuffer[i];

        if (!audio_is_playing(bufSfx)) {
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
