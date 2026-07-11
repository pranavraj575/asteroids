(function() {
  if (typeof Asteroids === 'undefined') {
    window.Asteroids = {};
  }

  var Game = Asteroids.Game = function(canvas, gameStart, options) {
    this.topology=options.topology;
    this.friendly_fire = options.friendly_fire;
    this.gameStart = gameStart;
    this.canvas = canvas;
    this.requestAsteroids = true;
    this.asteroids = [];
    this.round = 0;
    this.active=false;
  };

  Game.prototype.start = function() {
    this.active=true;
    this.gameOverText = false;
    this.keyDownHandler();
    this.points = 0;
    this.round = 0;
    this.lives = 3;
    // 0 for boundary, 1 for connection with no flip, -1 for connection with flip

    this.ship = new Asteroids.Ship(this.canvas,this.topology,this.friendly_fire);
    this.asteroids = [];
    this.collision = new Asteroids.Collision(this);
    this.requestAsteroids = true;
    this.refresh();
  };

  Game.prototype.assignPoints = function(asteroid) {
    if (asteroid.size === 3) {
      this.points += 20;
    } else if (asteroid.size === 2) {
      this.points += 50;
    } else {
      this.points += 100;
    }
  };

  Game.prototype.drawBackground = function() {
    this.canvas.width = 2048;
    this.canvas.height = 1536;
    this.canvas.style.width = "1024px";
    this.canvas.style.height = "768px";
    var ctx = this.canvas.getContext('2d');
    ctx.scale(2, 2);
    ctx.fillRect(0, 0, 1024, 768);
  };

  Game.prototype.drawBorder = function() {
    var ctx = this.canvas.getContext('2d');
    ctx.rect(0, 0, 1024, 768);
    ctx.lineWidth = '3';
    ctx.strokeStyle = 'white';
    ctx.stroke();
    if (this.active){
      this.borderHints(this.topology);
    }

  };
  Game.prototype.borderHints = function(topology){
    ht=13;
    lnth=20;
    cnt=1;
    for (dim=0;dim<2;dim++){
      dim_max=[1024,768][1-dim];
      if (topology[1-dim]==0){
        continue;
      }
      for (d_0=0;d_0<=dim_max;d_0+=dim_max){
        if (d_0==0){
          d_p=d_0 + ht;
          dir=1;
        }
        else{
          d_p=d_0 - ht;
          dir=topology[1-dim];
        }
        var ctx = this.canvas.getContext('2d');
        ctx.beginPath();
        pos=[512, 384]
        pos[1-dim]=d_0;
        ctx.moveTo(pos[0],pos[1]);
        pos[1-dim]=d_p;
        ctx.lineTo(pos[0],pos[1]);
        pos[dim]+=dir*lnth;
        pos[1-dim]=d_0;
        ctx.lineTo(pos[0],pos[1]);
        if (cnt>1){
          pos=[512, 384];
          pos[1-dim]=d_0;
          ctx.lineTo(pos[0],pos[1]);
          pos[dim]-=dir*lnth;
          pos[1-dim]=d_p;
          ctx.lineTo(pos[0],pos[1]);
          pos[1-dim]=d_0;
          ctx.lineTo(pos[0],pos[1]);
        }

        ctx.fillStyle='green';
        ctx.fill();
      }
      cnt++;
    }
  }

  Game.prototype.keyDownHandler = function() {
    kd.LEFT.down(function() {
      this.ship.rotateLeft();
    }.bind(this));

    kd.RIGHT.down(function() {
      this.ship.rotateRight();
    }.bind(this));

    kd.UP.down(function() {
      this.ship.thrust();
    }.bind(this));

    kd.DOWN.down(function() {
      this.ship.brake();
    }.bind(this));

    kd.SPACE.press(function() {
      this.ship.fireBullet();
    }.bind(this));

  };

  Game.prototype.makeAsteroids = function(num) {
    var number = num || 4 + this.round * 2;
    if (this.asteroids.length === 0 && this.requestAsteroids) {
      if (this.ship) {
        this.ship.resetShip(false);
      }
      this.requestAsteroids = false;
      for (var i = 0; i < number; i++) {
        this.asteroids.push(new Asteroids.Asteroid({
          canvas: this.canvas,
          type: 3,
          topology: this.topology,
        }));
      }
      this.requestAsteroids = true;
      this.round += 1;

    }
  };

  var requestId;

  Game.prototype.refresh = function() {
    if (this.gameOverText !== true) {
      kd.tick();
    }
    this.drawBackground();
    this.drawBorder();
    this.makeAsteroids();

    if (this.gameStart.flash === true) {
      this.gameStart.welcome();
    }

    this.collision.removeCollided();
    this.makeAsteroids();
    for (var i = 0; i < this.asteroids.length; i++) {
      this.asteroids[i].move().render();
    }

    this.ship.moveBullets().renderBullets();

    if (this.ship.hide !== true) {
      this.ship.move().render();
    }

    requestId = window.requestAnimationFrame(this.refresh.bind(this));
    this.showPoints();
    this.showBullets();
    this.showLives();
    this.checkGameOver();
  };

  Game.prototype.checkGameOver = function() {
    if (this.lives === 0 && this.gameOverText === false) {
      this.gameStart.endGame();
      this.gameStart.gameOverText();
      this.gameOverText = true;
      this.active=false;
    }
  };
  Game.prototype.update_topology= function(topology){
    this.topology=topology;
    for (var i = 0; i < this.asteroids.length; i++) {
        this.asteroids[i].topology=topology;
      }
    if (!isNaN(this.ship)){
      this.ship.topology=topology;
    }
  }
  Game.prototype.update_friendly_fire= function(friendly_fire){
    this.friendly_fire=friendly_fire;
    if (!isNaN(this.ship)){
      this.ship.update_friendly_fire(friendly_fire);
    }
  }
  Game.prototype.remove = function() {
    window.cancelAnimationFrame(requestId);
  };

  Game.prototype.showLives = function() {
    var lives = this.lives;
    for (var i = 0; i < lives; i++) {
      var ctx = this.canvas.getContext('2d');
      ctx.font = '32px vector_battleregular';
      ctx.fillStyle = 'white';
      ctx.fillText(String.fromCharCode("0xC5"), 150 - i * 15, 75);
    }
  };


  Game.prototype.showPoints = function() {
    var ctx = this.canvas.getContext('2d');
    ctx.font = '32px vector_battleregular';
    ctx.fillStyle = 'white';
    ctx.fillText(this.points, 150, 45);
  };
  Game.prototype.showBullets = function() {
    var ctx = this.canvas.getContext('2d');
    ctx.font = '32px vector_battleregular';
    ctx.fillStyle = 'white';
    ctx.fillText(this.ship.max_bullets-this.ship.bullets.length, 10, 750);
    ctx.fillText(this.ship.max_bullets-this.ship.bullets.length, 10.5, 750);
    ctx.fillText(this.ship.max_bullets-this.ship.bullets.length, 9.5, 750);
    ctx.fillText(this.ship.max_bullets-this.ship.bullets.length, 10, 750.5);
    ctx.fillText(this.ship.max_bullets-this.ship.bullets.length, 10, 749.5);
  };


})();
