/**
 * @fileOverview This file holds audio-related declarations, functions, etc.
 * @author Noel Noche
 * @version 1.0.0
 */
 
// For sound effects
var startBlip = document.getElementById('blip');
var gemGet = document.getElementById('blip');
var collision = document.getElementById('ouch');
var soundEffects = {};
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

// For BGM
var bgm1 = document.getElementById('background-music-1');
var bgm2 = document.getElementById('background-music-2');
var bgMusic = {};
var curTrack = 'track_0';
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

// For toggling audio states and volume
var soundOn = false;
var VOLUME = 0.5;

// Initializes the audio files when game first loads
function loadAudio() {
  var audioObjArray = [sfxMetadata, bgmMetadata];
  audioObjArray.forEach(function(dataObj) {
    dataObj.forEach(function(obj) {
      var ext = getFormatExtension(obj.srcObj);
      obj.srcObj.src = obj.path + ext;
      obj.srcObj.volume = VOLUME;
      obj.srcObj.load();
      
      try {
        if (obj.category === 'sfx') {
          soundEffects[obj.name] = obj.srcObj;
        }
        if (obj.category === 'bgm') {
          obj.srcObj.loop = true;
          bgMusic[obj.name] = obj.srcObj;
        }
      }
      catch (error) {
        RandTools.showErrorMessage(error);
      }
    });
  });
}

// Selects supported audio format for your browser (if any)
function getFormatExtension(audio) {
  var extension = null;

  try {
    if (audio.canPlayType('audio/mpeg') !== '') {
      extension = '.mp3';
    }
    if (audio.canPlayType('audio/ogg') !== '') {
      extension = '.ogg';
    }
    return extension;
  }
  catch (error) {
    RandTools.showErrorMessage(error);
  }
}

// Updates the bgm track and state
function updateBGMstatus() {
  var trk = bgMusic[curTrack] || null;

  if (trk === null ) {
    return;
  }
  else if (soundOn === true) {
    trk.play();
  }
  else {
    trk.pause();
  }
}

// Support function for playSound
function audioIsPlaying(sound) {
  return !sound.ended && sound.currentTime > 0;
}

// Makes simultaneous sound effects possible
function playSound(sfxName) {
  var curSfx = null;
  var bufSfx = null;
  var sfxBuffer = [new Audio(), new Audio(), new Audio()];
  curSfx = soundEffects[sfxName];

  if (soundOn) {
    if (!audioIsPlaying(curSfx)) {
      curSfx.play();
    }
    else {
      for (var i = 0; i < sfxBuffer.length; i++) {
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

var $audio = $('.hud__audio');
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