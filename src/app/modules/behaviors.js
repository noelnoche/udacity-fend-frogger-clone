/**
 * @fileOverview Module for applying custom behaviors to game entities
 * @author Noel Noche
 * @version 1.0.0
 */
 
'use strict';

// Holds all properties used in the behavior methods
var allBehaviorProperties = {
  startTime: 0,
  elapsedTime: null,
  timeLimit: null,
  activeTimer: false,
  penaltyTile: false,
  topBlock: false,
  rightBlock: false,
  bottomBlock: false,
  leftBlock: false,
  blockCollision: false,
  playerLastX: null,
  playerLastY: null
};

// Holds methods used for a timer behavior
var setTimer = {
  startTimer: function() {
    this.startTime = new Date();
    this.activeTimer = true;
  },
  stopTimer: function() {
    this.startTime = 0;
    this.activeTimer = false;
  },
  updateTimer: function(timeLimit) {
    if (this.activeTimer === true) {
      this.elapsedTime = parseInt(((new Date()) - this.startTime) / 1000, 10);
      
      if (this.elapsedTime > timeLimit) {
        this.stopTimer();
      }
    }
  }
};

// Holds methods used for detecting collision with a non-enemy entity
var takeLife = {
  updateTimer: function(player) {
    if (this.x === player.x && this.y === player.y) {
      this.penaltyTile = true;
    }
    else {
      this.penaltyTile = false;
    }
  },
  update: function(player) {
    this.updateTimer(player);
    
    if (this.penaltyTile === true && player.y === this.y && player.x === this.x) {
      player.collided = true;
    }
  }
};

// Holds methods that make an entity impassable
var impassable = {
  updateTimer: function(player) {
    if (this.x === player.x && this.y === player.y) {
      this.blockCollision = true;
      
      if (this.playerLastY < this.y) {
        this.topBlock = true;
      }
      if (this.playerLastX > this.x) {
        this.rightBlock = true;
      }
      if (this.playerLastY > this.y) {
        this.bottomBlock = true;
      }
      if (this.playerLastX < this.x) {
        this.leftBlock = true;
      }
    }
  },
  update: function(player) {
    this.updateTimer(player);
    
    if (this.blockCollision === true) {
      if (this.topBlock === true) {
        player.y = this.y - 83;
        player.x = this.x;
        this.topBlock = false;
      }
      if (this.rightBlock === true) {
        player.x = this.x + 101;
        player.y = this.y;
        this.rightBlock = false;
      }
      if (this.bottomBlock === true) {
        player.y = this.y + 83;
        player.x = this.x;
        this.bottomBlock = false;
      }
      if (this.leftBlock === true) {
        player.x = this.x - 101;
        player.y = this.y;
        this.leftBlock = false;
      }
      this.blockCollision = false;
    }
    
    this.playerLastX = player.x;
    this.playerLastY = player.y;
  }
};

// Binds the behavior to the target entity
function addBehaviors(entityObject, behaviorsArray) {
  // var prop = null;

  // for (prop in allBehaviorProperties) {
  //   if (Object.prototype.hasOwnProperty.call(entityObject, prop)) {
  //     throw 'Entity property conflict!: ' + prop;
  //   }
  //   else {
  //     entityObject[prop] = allBehaviorProperties[prop];
  //   }
  // }

  var props = Object.keys(allBehaviorProperties);

  props.forEach(function(prop) {
    if (Object.prototype.hasOwnProperty.call(entityObject, prop)) {
      throw 'Entity property conflict!: ' + prop;
    }
    else {
      entityObject[prop] = allBehaviorProperties[prop];
    }    
  });
  
  // behaviorsArray.forEach(function(component) {
  //   for (prop in component) {
  //     entityObject[prop] = component[prop];
  //   }
  // });

  behaviorsArray.forEach(function(behaviorObj) {
    var methods = Object.keys(behaviorObj);
    for (var i = 0; i < methods.length; i++) {
      var method = methods[i];
      entityObject[method] = behaviorObj[method];
    }
  });
}

module.exports = {
  setTimer: setTimer,
  takeLife: takeLife,
  impassable: impassable,
  addBehaviors: addBehaviors
};
