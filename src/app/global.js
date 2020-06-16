/**
 * @fileOverview  Global modules and variables
 * @author Noel Noche
 * @version 1.0.0
 */
 
'use strict';

// Import custom node files
var RandTools = require('./modules/randtools');
var Behaviors = require('./modules/behaviors');
var Resources = require('./modules/resources');

// Used throughout for positioning entities, collision detection etc
var ROWS = [-43, 60, 143, 226, 309, 392];
var COLS = [0, 101, 202, 303, 404];

// For for-loops throughout
var i = null;
var len = null;