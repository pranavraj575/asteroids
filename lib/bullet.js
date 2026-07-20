(function() {
  if (typeof Asteroids === 'undefined') {
    window.Asteroids = {};
  }

  var Bullet = Asteroids.Bullet = function(position, direction, canvas, velocity, topology, max_life, friendly_fire, piercing = false) {
    var keep_ship_velocity = true;
    var bulletspeed = 15 + 15 * piercing;
    this.max_life = max_life;
    this.life = this.max_life;
    this.friendly_fire = friendly_fire;
    this.x_bounds = [0, 1024];
    this.y_bounds = [0, 768];
    this.topology = topology;
    this.piercing = piercing;

    var snd = new Audio('audio/fire.wav');
    snd.play();
    this.position = position.slice(0);
    this.canvas = canvas;

    this.velocity = [direction[0] * bulletspeed, direction[1] * bulletspeed];
    if (keep_ship_velocity) {
      for (var i = 0; i < 2; i++) {
        this.velocity[i] = this.velocity[i] + velocity[i];
      }
    }
    this.speed = Math.sqrt(Math.pow(this.velocity[0], 2) + Math.pow(this.velocity[1], 2));
    this.orientation = Math.atan2(this.velocity[1], this.velocity[0])
  };

  Bullet.prototype.move = function() {
    this.life -= 1;
    for (var i = 0; i < 2; i++) {
      this.position[i] = this.position[i] + this.velocity[i];
    }

    for (var dim = 0; dim < 2; dim++) {
      var other_dim = 1 - dim;
      var bounds = [this.x_bounds, this.y_bounds][dim];
      var other_bounds = [this.x_bounds, this.y_bounds][other_dim];

      if (this.topology[dim] == 1 || this.topology[dim] == -1) {
        var trans = false;
        if (this.position[dim] < bounds[0] && this.velocity[dim] < 0) {
          this.position[dim] = bounds[1];
          trans = true;
        } else if (this.position[dim] > bounds[1] && this.velocity[dim] > 0) {
          this.position[dim] = bounds[0];
          trans = true;
        }
        if (trans && this.topology[dim] == -1) {
          this.inverted = !this.inverted;
          this.orientation = -this.orientation;
          this.position[other_dim] = other_bounds[1] - (this.position[other_dim] - other_bounds[0]);
          this.velocity[other_dim] = -this.velocity[other_dim];
        }
      } else {
        // topology[1] is 0, we simply rebound
        if ((this.position[dim] < bounds[0] && this.velocity[dim] < 0) || this.position[dim] > bounds[1] && this.velocity[dim] > 0) {
          this.velocity[dim] = -this.velocity[dim];
          this.orientation = -this.orientation;
        }
      }
    }

    return this;
  };

  Bullet.prototype.render = function() {
    var ctx = this.canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(this.position[0], this.position[1]);
    if (this.life < 0) {
      size = 1;
    }
    else {
      size = .75 + this.life / this.max_life;
    }
    ctx.ellipse(this.position[0], this.position[1], size * Math.max(this.speed / 3, 1), size, this.orientation, 0, 2 * Math.PI);
    ctx.lineWidth = 1;
    if (this.friendly_fire) {
      if (this.max_life - this.life > 10) {
        ctx.strokeStyle = 'red';
      }
      else {
        ctx.strokeStyle = 'red';
      }
      ctx.fillStyle = 'red';
    } else if (this.piercing) {
      ctx.strokeStyle = 'yellow';
      ctx.fillStyle = 'green';
    } else {
      ctx.strokeStyle = 'white';
      ctx.fillStyle = 'white';
    }

    ctx.stroke();
    ctx.fill();
  };
})();