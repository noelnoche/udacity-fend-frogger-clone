/**
 * @fileOverview HUD-related code
 * @author Noel Noche
 * @version 1.0.0
 */
 
'use strict';

// For game score
var $scoreNode = $('.hud__score');
var score = 0;
var PTS_PER_MIN = 1;

// For game levels
var $levelNode = $('.hud__level');
var gameLevel = 1;
var totalLevels = 20;

// For elapsed game time
var $gameTimeNode = $('.hud__time');
var startTime = null;
var lastGameTime = null;

function updateHudScore(currentScore) {
  $scoreNode.text(currentScore);
}

function updateHudLevel(currentLevel) {
  $levelNode.text(currentLevel);
}

function updateHudTime(currentTime) {
  $gameTimeNode.text(currentTime);
}
