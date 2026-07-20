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
    this.grad=[0,0,0,0];
    this.round = 0;
    this.active=false;
    this.bonuses=options.bonuses;
    this.bosses=options.bosses;
    this.lifeblood=false;
    this.aval_1up=0;
    this.ctrls=options.ctrls;
  };

  Game.prototype.start = function() {
    this.active=true;
    this.gameOverText = false;
    this.keyDownHandler();
    this.points = 0;
    this.round = 0;
    this.lives = 3;
    this.grad=[0,0,0,0];
    // 0 for boundary, 1 for connection with no flip, -1 for connection with flip

    this.ship = new Asteroids.Ship(this.canvas,this.topology,this.friendly_fire);
    this.asteroids = [];
    this.collision = new Asteroids.Collision(this);
    this.requestAsteroids = true;
    this.refresh();
  };

  Game.prototype.assignPoints = function(asteroid) {
    this.points += Math.round((2**(5-asteroid.type)));
  };

  Game.prototype.drawBackground = function() {
    this.canvas.width = 2048;
    this.canvas.height = 1536;
    //this.canvas.style.width = "1024px";
    //this.canvas.style.height = "768px";
    w=window.innerWidth
    h=window.innerHeight
    r=this.canvas.width/this.canvas.height
    if(h*r>w){
        h=w/r;
    }
    else{
        w=h*r;
    }
    this.canvas.style.width = w+"px";
    this.canvas.style.height = h+"px";
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


  Game.prototype.mouse_press = function(idx,val=1){
    this.grad[idx]=val;
  }

  Game.prototype.dwn = function(){
    if (this.ship) {
      this.ship.brake();
    }
  }
  Game.prototype.up = function(){
    if (this.ship) {
      this.ship.thrust();
    }
  }
  Game.prototype.lft = function(){
    if (this.ship) {
      this.ship.rotateLeft();
    }
  }
  Game.prototype.rt = function(){
    if (this.ship) {
      this.ship.rotateRight();
    }
  }
  Game.prototype.fire = function(){
    if (this.ship) {
      this.ship.fireBullet();
    }
  }

  Game.prototype.keyDownHandler = function() {
    kd.LEFT.down(function() {
      if(this.ctrls==0){
        this.lft();
      }
    }.bind(this));

    kd.RIGHT.down(function() {
      if(this.ctrls==0){
        this.rt();
      }
    }.bind(this));

    kd.UP.down(function() {
      if(this.ctrls==0){
        this.up();
      }
    }.bind(this));

    kd.DOWN.down(function() {
      if(this.ctrls==0){
        this.dwn();
      }
    }.bind(this));

    kd.A.down(function() {
      if(this.ctrls==1){
        this.lft();
      }
    }.bind(this));

    kd.D.down(function() {
      if(this.ctrls==1){
        this.rt();
      }
    }.bind(this));

    kd.W.down(function() {
      if(this.ctrls==1){
        this.up();
      }
    }.bind(this));

    kd.S.down(function() {
      if(this.ctrls==1){
        this.dwn();
      }
    }.bind(this));


    kd.SPACE.press(function() {
      this.fire();
    }.bind(this));

  };

  Game.prototype.makeAsteroids = function(num) {
    var bonus_scale=1.
    if (num){
        var number = num;
    } else {
        var number = [0,this.round%2,this.round%3, 4 + this.round, Math.floor(this.round/2),Math.floor(this.round/3)];
        if (this.bosses && this.round%5==4){
          var c=Math.ceil((this.round+1)/5)
          number = [0,0,0,0,0,1];
          for (var cc=0;cc<Math.min(c+44,3);cc++){
            number=[0].concat(number);
          }
          bonus_scale=.4
        }
    }

    if (this.asteroids.length === 0 && this.requestAsteroids) {
      if (this.ship) {
        this.ship.resetShip(false);
      }
      this.requestAsteroids = false;
      for (var k = 0; k<number.length; k++){
        for (var i = 0; i < number[k]; i++) {
            var bonus=0;
            if(k>3 && this.bonuses){
              var r=Math.random()*bonus_scale;
              if (r<.025){
                bonus=3 + (this.lives+this.aval_1up<4);
              } else if (r<.2){
                bonus=2;
              } else if (r<.4){
                bonus=3;
              } else if (r<.5){
                bonus=1;
              }
              if (bonus==4){
                this.aval_1up+=1;
              }
            }
            this.asteroids.push(new Asteroids.Asteroid({
              canvas: this.canvas,
              type: k,
              topology: this.topology,
              bonus:bonus,
            }));
          }
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
    if (this.ctrls==2){
      if(this.grad[0]){
        this.up();
      }
      if(this.grad[1]){
        this.lft();
      }
      if(this.grad[2]){
        this.dwn();
      }
      if(this.grad[3]){
        this.rt();
      }
    }

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
    if(this.ctrls==2){
      this.showCtrls();
    }
    this.checkGameOver();
  };
  Game.prototype.showCtrls = function() {
    buttons=[[100,600],[50,650],[100,700],[150,650]]
    var ctx = this.canvas.getContext('2d');
    for(var i=0;i<buttons.length;i++){
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(buttons[i][0]+30, buttons[i][1]);
      ctx.fillStyle = 'rgba(255,255,255,.25)';
      ctx.strokeStyle="green";
      ctx.ellipse(buttons[i][0], buttons[i][1], 30, 30,0,0,2*Math.PI);
      ctx.fill();
      if (this.grad[i]==1){
        ctx.stroke();
      }
      ctx.restore();
    }
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
    var ctx = this.canvas.getContext('2d');
    for (var i = 0; i < lives; i++) {
      ctx.save();
      ctx.lineWidth=1;
      ctx.strokeStyle='white';

      ctx.translate(20 + i * 15, 75);
      ctx.beginPath();
      ctx.moveTo(0,-12.8);
      ctx.lineTo(-8,10.4);
      ctx.lineTo(-4.8,6.4);
      ctx.lineTo(4.8,6.4);
      ctx.lineTo(8,10.4);
      ctx.lineTo(0,-12.8);
      ctx.stroke();
      if(i==lives-1 && this.lifeblood){
        ctx.fillStyle='blue';
        ctx.globalAlpha=.69;
        ctx.fill();
      }
      ctx.restore();
    }
  };

  Game.prototype.showPoints = function(show_lvl=true) {
    var ctx = this.canvas.getContext('2d');
    ctx.font = '32px vector_battleregular';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    stuff=this.points
    if (show_lvl){
        stuff=stuff+" LV."+this.round;
    }
    ctx.fillText(stuff, 10, 45);
  };
  Game.prototype.showBullets = function() {
    var ctx = this.canvas.getContext('2d');
    ctx.save();
    ctx.font = '20px vector_battleregular';
    if (this.friendly_fire){
      ctx.fillStyle = 'red';
      ctx.strokeStyle='red';
    } else{
      ctx.fillStyle = 'white';
      ctx.strokeStyle='white';
    }
    ctx.lineWidth = 1;
    ctx.textAlign = "left";
    bs=(this.ship.max_bullets)-(this.ship.bullets.length-this.ship.ps_fired);
    ctx.globalAlpha=.5;
    for (var i=0;i<bs+this.ship.piercing_shots;i++){
      if (i==bs){
        ctx.fillStyle="green";
        ctx.strokeStyle="yellow";
      }
      ctx.beginPath();
      ctx.ellipse(10,750, 1, 7, 0, 0, 2*Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.translate(5,0);
    }
    ctx.restore();
  };

})();
