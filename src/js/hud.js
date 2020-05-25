/**
 * @fileOverview modules, top-level variables, hud and audio code is organized here.
 * @author Noel Noche
 * @version 3.0.0
 */
 
'use strict';

// Import custom node files
var RandTools = require('./modules/randtools');
var Behaviors = require('./modules/behaviors');
var Resources = require('./modules/resources');

// Used throughout for positioning entities, collision detection etc
var ROWS = [-43, 60, 143, 226, 309, 392];
var COLS = [0, 101, 202, 303, 404];

// For game score
var $scoreNode = $('.hud__score');
var score = null;
var PTS_PER_MIN = 1;

// For game levels
var $levelNode = $('.hud__level');
var gameLevel = 1;
var totalLevels = 20;

// For game rate and duration
var $gameTimeNode = $('.hud__time');
var startTime = null;
var lastGameTime = null;

// For showing/hiding game info during initial page load
var $hud = $('.hud').css('opacity', 0);
var $body = $('body');
var $footer = $('.footer').css('opacity', 0);

// For for-loops throughout
var i = null;
var len = null;
