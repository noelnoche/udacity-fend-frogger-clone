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
