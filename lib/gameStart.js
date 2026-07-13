(function() {
  if (typeof Asteroids === 'undefined') {
    window.Asteroids = {};
  }

  var GameStart = Asteroids.GameStart = function(canvas) {
    this.playedOnce = false;
    this.canvas = canvas;
    this.start();
  };

  GameStart.prototype.get_topology_idx = function() {
    if(isNaN(this.topology_idx)){
      this.topology_idx=0;
    }
    return this.topology_idx;
  }
  GameStart.prototype.get_friendly_fire = function() {
    if(isNaN(this.friendly_fire)){
      this.friendly_fire=false;
    }
    return this.friendly_fire;
  }

  GameStart.prototype.get_topology = function() {
    return [[0,0],[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]][this.get_topology_idx()%9];
  }

  GameStart.prototype.get_topology_name = function() {
    return ["square (boring)","cylinder","cylinder","m\u00F6bius strip","m\u00F6bius strip","torus","klien bottle","klien bottle","RP2"][this.get_topology_idx()%9];
  }
  GameStart.prototype.start = function() {
    this.keyHandler();

    this.game = new Asteroids.Game(this.canvas, this, {
          topology: this.get_topology(),
          friendly_fire:this.get_friendly_fire(),
        });
    if (!this.playedOnce) {
      this.welcomeLoop();
    }
    else{
      this.renderMenuLoop(true);

    }
  };

  GameStart.prototype.endGame = function() {
    this.playedOnce = true;
    this.start();
    /*setTimeout(function() {
      $('#start').toggle();
      this.start();
    }.bind(this), 3000);*/
  };

  var listener = new window.keypress.Listener();

  GameStart.prototype.keyHandler = function() {
    listener.simple_combo('enter', function() {
      if (this.playedOnce) {
        this.game.remove();
      }
      window.cancelAnimationFrame(requestId);
      this.removeTitles();
      this.game.start();
      $('#game-over').hide();
      listener.reset();
    }.bind(this));

    kd.T.press(function() {
      if(!this.game.active){
        this.inc_topology(1);
      }
    }.bind(this));
    kd.F.press(function() {
      if(!this.game.active){
        this.toggle_friendly_fire();
      }
    }.bind(this));
    kd.Q.press(function() {
      window.location.href = "../../..";
    }.bind(this));
  };

  GameStart.prototype.removeTitles = function() {
    $('#start').hide();
    $('#instructions').hide();
    $('#credits').hide();
  };

  GameStart.prototype.gameOver = function() {
    this.start();
  };

  GameStart.prototype.gameOverText = function() {
  };

  var requestId;

  GameStart.prototype.renderMenu = function(gameover) {
    toppyImg = new Image();
    toppyImg.src = ['img/square.png',
    'img/cylinder.png','img/cylinder2.png',
    'img/mobius.png','img/mobius2.png',
    'img/torus.png',
    'img/klien.png','img/klien2.png',
    'img/rp2.png',
    ][this.get_topology_idx()%9];


    var ctx = this.canvas.getContext('2d');

    ctx.save();
    ctx.translate(512,520);
    ctx.font="bold 17px vector_battleregular"
    ctx.fillStyle="white"
    ctx.strokeStyle = "white";
    ctx.fontWeight = "40"
    ctx.letterSpacing = "3px"
    ctx.textAlign = "center";
    this.fillThickly(ctx,"Topology: "+this.get_topology_name(),.25)
    ctx.restore();

    var ctx = this.canvas.getContext('2d');
    ctx.save();
    ctx.translate(512,590);
    //ctx.rotate(rot * -1);
    ctx.drawImage(toppyImg, -50, -50, 100, 100);
    ctx.restore();


    ctx.save();
    ctx.translate(512,666);
    ctx.font="bold 17px vector_battleregular"
    ctx.fillStyle="white"
    ctx.strokeStyle = "white";
    ctx.letterSpacing = "3px"
    ctx.textAlign = "center";
    this.fillThickly(ctx,"(press T to change)",.25)
    ctx.restore();

    ctx.save();
    ctx.translate(512,710);
    ctx.font="bold 17px vector_battleregular"
    ctx.fillStyle="white"
    ctx.letterSpacing = "3px"
    ctx.textAlign = "center";
    var ff="Friendly fire: "
    if (this.get_friendly_fire()){
      ff=ff+"ON";
      ctx.strokeStyle = "red";
      ctx.fillStyle="red"
    } else{
      ff=ff+"OFF";
      ctx.strokeStyle = "white";
    }
    ff=ff+" (F to toggle)"
    this.fillThickly(ctx,ff,.25)
    ctx.restore();

    ctx.save();
    ctx.translate(512,750);
    ctx.font="bold 17px vector_battleregular"
    ctx.fillStyle="white"
    ctx.letterSpacing = "3px"
    ctx.textAlign = "center";
    this.fillThickly(ctx,"Q to quit",.25)
    ctx.restore();

    this.game.borderHints(this.get_topology());

    if(gameover){
      ctx.save();
      ctx.translate(512,210);
      ctx.font="bold 50px vector_battleregular";
      ctx.fillStyle="white"
      ctx.strokeStyle = "white";
      ctx.letterSpacing = "25px";
      ctx.textAlign = "center";
      this.fillThickly(ctx,"Game over");
      ctx.restore();
    }


    ctx.save();
    ctx.translate(512,265);
    if(gameover){
      ctx.translate(0,60);
    }
    ctx.font="bold 23px vector_battleregular";
    mx=.9;
    mn=0;
    if (isNaN(this.alpha)){
      this.alpha=mx;
      this.gradient=-.03
    }
    ctx.fillStyle="rgba(255, 255, 255, "+this.alpha+")"
    this.alpha+=this.gradient
    this.alpha=Math.min(Math.max(this.alpha,mn),mx);
    if (this.alpha==mx || this.alpha==mn){
      this.gradient=-this.gradient;
    }

    ctx.strokeStyle = "white";
    ctx.letterSpacing = "3px";
    ctx.textAlign = "center";
    this.fillThickly(ctx,"Press enter to play",.25);
    ctx.restore();
  };
  GameStart.prototype.welcomeLoop = function() {
    requestId = window.requestAnimationFrame(this.welcomeLoop.bind(this));
    this.game.drawBackground();
    this.game.drawBorder();
    this.game.makeAsteroids([0,5,4,3,2,1]);
    for (var i = 0; i < this.game.asteroids.length; i++) {
      this.game.asteroids[i].move().render();
    }

    var ctx = this.canvas.getContext('2d');
    ctx.save();
    ctx.translate(512,220);
    ctx.font="bold 50px vector_battleregular";
    ctx.fillStyle="white"
    ctx.strokeStyle = "white";
    ctx.letterSpacing = "25px";
    ctx.textAlign = "center";
    this.fillThickly(ctx,"Asteroids");
    ctx.restore();


    ctx.save();
    ctx.translate(512,370);
    ctx.font="bold 20px vector_battleregular"
    ctx.fillStyle="white"
    ctx.strokeStyle = "white";
    ctx.letterSpacing = "1px"
    ctx.textAlign = "center";
    this.fillThickly(ctx,"Move: \u2190 \u2191 \u2192 \u2193 Fire: space",.3);
    ctx.restore();


    this.renderMenu();
  };
  GameStart.prototype.fillThickly = function(ctx,text,scale=.5) {
    ctx.fillText(text, 0,0);
    ctx.fillText(text, 0,scale);
    ctx.fillText(text, 0,2*scale);
    ctx.fillText(text, 0,-scale);
    ctx.fillText(text, 0,-2*scale);
    ctx.fillText(text, scale,0);
    ctx.fillText(text, -scale,0);
  };
  GameStart.prototype.renderMenuLoop = function(gameover=false) {
    requestId = window.requestAnimationFrame(this.renderMenuLoop.bind(this));
    this.renderMenu(gameover);
  };

  GameStart.prototype.inc_topology = function(i) {
    this.topology_idx=this.get_topology_idx()+i;
    this.game.update_topology(this.get_topology());
  };

  GameStart.prototype.toggle_friendly_fire = function(i) {
    this.friendly_fire=!this.get_friendly_fire();
    this.game.update_friendly_fire(this.get_friendly_fire());
  };

})();
