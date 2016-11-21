/**
 * @fileOverview Gem-specific code
 * @author Noel Noche
 * @version 2.0.0
 */

// Holds the gem instance produced by initialize_objects
var gemInstance = null;

// Ensures one gem at a time appears
var activeGem = false;

// For generating a randomly weighted gem type
var gemMetadata = [{
  name: 'gem-blue',
  weight: 0.500
}, {
  name: 'gem-green',
  weight: 0.350
}, {
  name: 'gem-orange',
  weight: 0.135
}, {
  name: 'heart',
  weight: 0.15
}];

var weightedGemList = RandTools.make_weighted(gemMetadata);

// Used to keep track of gem positions so they won't appear in a position occupied by a finished character
var gemCols = [0, 101, 202, 303, 404];

// Using pseudo-classical inheritance for creating each gem type
// There are 4 types: blue, green, orange and the life heart
var Gem = function(sprite) {
  this.name = null;
  this.sprite = null;
  this.x = null;
  this.y = null;
  this.w = 101;
  this.h = 171;
  this.points = null;
  this.bonusLife = false;
  this.taken = false;
};

Gem.prototype = {

  // Checks if the player took the gem
  check_player_get: function(player) {

    if (this.x === player.x && this.y === player.y) {
      this.taken = true;

      if (this.name === 'heart') {
        this.bonusLife = true;
      }
    }
  },

  update: function() {

    if (this.taken) {

      if (soundOn) {
        play_sound('start');
      }

      if (this.bonusLife) {
        add_heart();
      } else {
        score += this.points;
        $scoreNode.text('Score ' + score);
      }
      this.activeTimer = false;
      this.taken = false;
      this.sprite = '';
      activeGem = false;
    }
  },

  render: function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
};

// Generates a Gem instance
function generate_gem(xPos, yPos) {
  var randIndex = RandTools.gen_rand_index(weightedGemList.length, 0);
  var gemName = weightedGemList[randIndex];
  var gemComponents = [Behaviors.setTimer];

  var gem = new Gem();
  gem.name = gemName;
  gem.x = xPos;
  gem.y = yPos;

  switch (gemName) {
    case 'gem-blue':
      gem.sprite = 'assets/images/gem-blue.png';
      gem.points = 5;
      break;
    case 'gem-green':
      gem.sprite = 'assets/images/gem-green.png';
      gem.points = 10;
      break;
    case 'gem-orange':
      gem.sprite = 'assets/images/gem-orange.png';
      gem.points = 15;
      break;
    case 'heart':
      gem.sprite = 'assets/images/heart.png';
      gem.bonusLife = true;
      break;
  }

  Behaviors.add_behaviors(gem, gemComponents);

  return gem;
}
