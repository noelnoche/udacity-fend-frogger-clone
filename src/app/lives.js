/**
 * @fileOverview Lives-related code
 * @author Noel Noche
 * @version 1.0.0
 */
 
 // For lives indicator
var $livesNode = $('.hud__lives');
var heartNode = '<img class="heart" src="assets/images/heart-small.png">';
var lives = null;

// Removes a life heart
function removeHeart() {
  var $heart = $('.heart');
  lives -= 1;
  
  if ($heart) {
    if (lives === 5) {
      $livesNode.html('');
      for (i = 0; i < 5; i++) {
        $livesNode.append(heartNode);
      }
    }
    if (lives <= 5) {
      $heart[0].remove();
    }
    else {
      $livesNode.html(heartNode + ' = ' + lives);
    } 
  }
}

// Adds extra heart bonuses
function addHeart() {
  lives += 1;

  if (lives <= 5) {
    $livesNode.append(heartNode);
  }
  else {
    $livesNode.html(heartNode + ' = ' + lives);
  }
}

// Resets lives
function resetLives(numLives) {
  var $heart = $('.heart');
  $heart.remove();
  $livesNode.html('');

  for (i = 0; i < numLives; i++) {
    $livesNode.append(heartNode);
  }

  lives = numLives;
}