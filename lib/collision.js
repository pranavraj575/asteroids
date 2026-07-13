(function() {
  if (typeof Asteroids === 'undefined') {
    window.Asteroids = {};
  }

  var Collision = Asteroids.Collision = function(game) {
    this.game = game;
    this.canvas = game.canvas;
    this.asteroids = game.asteroids;
    this.bullets = game.ship.bullets;
    this.ship = game.ship;
    this.shipNotSpawning = true;
    this.sndLarge = new Audio('audio/bangLarge.wav');
    this.sndSmall = new Audio('audio/bangSmall.wav');
    this.sndMedium = new Audio('audio/bangMedium.wav');
  };

  Collision.prototype.asteroidCollision = function() {
    if (this.game.active){
      for (var i = 0; i < this.asteroids.length; i++) {
        for (var j = 0; j < this.bullets.length; j++) {
          if (this.euclidean(this.asteroids[i].position,
              this.bullets[j].position) < this.asteroids[i].size / 3 + 5) {
            this.game.assignPoints(this.asteroids[i]);
            var type = this.asteroids[i].type - 1;
            var position = this.asteroids[i].position;
            this.explodeSound(this.asteroids[i]);
            this.asteroids.splice(i, 1);
            this.bullets.splice(j, 1);
            this.makeBrokenAsteroid(type, position);
            break;
          }
        }
      }
    }
  };

  Collision.prototype.explodeSound = function(asteroid=NaN) {
    if (asteroid.type === 1) {
      this.sndSmall.play();
    } else if (asteroid.type === 2) {
      this.sndMedium.play();
    } else {
      this.sndLarge.play();
    }
  };

  Collision.prototype.makeBrokenAsteroid = function(type, position) {
    if (type > 0) {
      for (var i = 0; i < 2; i++) {
        this.asteroids.push(new Asteroids.Asteroid({
          canvas: this.canvas,
          type: type,
          velMult: 4 - type,
          position: position.slice(0),
          topology:this.game.topology,
        }));
      }
    }
  };

  Collision.prototype.euclidean = function(x, y) {
    var xX = Math.pow(x[0] - y[0], 2);
    var yY = Math.pow(x[1] - y[1], 2);
    return Math.sqrt(xX + yY);
  };

  Collision.prototype.removeCollided = function() {
    this.asteroidCollision();
    if (this.ship.hide !== true && this.ship.invulnerable === false) {
      this.shipCollision();
    }
  };

  Collision.prototype.shipCollision = function() {
    var dead=false;
    var murderer=NaN;
    for (var i = 0; i < this.asteroids.length; i++) {
      if (this.euclidean(this.asteroids[i].position, this.ship.position) < this.asteroids[i].size / 3 + 16) {
        dead=true;
        murderer=this.asteroids[i];
        break;
      }
    }
    if (!dead){
      for (var j = 0; j < this.bullets.length; j++) {
        if (this.bullets[j].friendly_fire && this.bullets[j].max_life-this.bullets[j].life>10){
          if (this.euclidean(this.ship.position,
            this.bullets[j].position) < 20) {
            dead=true;
            this.bullets.splice(j, 1);
            break;
          }
        }
      }
    }
    if (dead){
      this.explodeSound(murderer);
        this.ship.hide = true;
        this.ship.canFire = false;
        this.game.lives -= 1;
        if (this.game.lives !== 0) {
          setTimeout(function() {
            this.ship.resetShip();
            this.ship.hide = false;
            this.ship.canFire = true;
          }.bind(this), 1000);
        }
    }
  };
})();
