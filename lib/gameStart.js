(function() {
  if (typeof Asteroids === 'undefined') {
    window.Asteroids = {};
  }

  var GameStart = Asteroids.GameStart = function(canvas) {
    this.playedOnce = false;
    this.canvas = canvas;
    this.held=false;
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
  GameStart.prototype.get_ctrls = function() {
    if(isNaN(this.ctrls)){
      this.ctrls=0;
    }
    return this.ctrls;
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
          ctrls:this.get_ctrls(),
        });
    if (!this.playedOnce) {
      this.welcomeLoop();
      this.mouse_listen=this.canvas.addEventListener('mousedown', this.clickHandler.bind(this), false);
      this.mouse_listen=this.canvas.addEventListener('mousemove', function(event){this.ms_ctrl(event,0)}.bind(this), false);
      this.mouse_listen=this.canvas.addEventListener('mouseup', function(event){this.ms_ctrl(event,-1)}.bind(this), false);

      this.mouse_listen=this.canvas.addEventListener('touchmove', function(event){this.ms_ctrl(event,0)}.bind(this), false);
      this.mouse_listen=this.canvas.addEventListener('touchend', function(event){this.ms_ctrl(event,-1)}.bind(this), false);
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
  GameStart.prototype.enter_game = function() {
    if (this.playedOnce) {
        this.game.remove();
      }
      window.cancelAnimationFrame(requestId);
      this.removeTitles();
      this.game.start();
      $('#game-over').hide();
      listener.reset();
  }
  GameStart.prototype.ms_ctrl = function(event,pressing){
    if (this.ctrls!=2){
      //return;
    }
    w=window.innerWidth
    h=window.innerHeight
    r=this.canvas.width/this.canvas.height
    if(h*r>w){h=w/r;}
    else{w=h*r;}
    var x=event.offsetX*1024/w;
    var y=event.offsetY*768/h;
    if(x>512 && pressing==1){
      this.game.fire();
    }
    if (x<512){
      if (pressing==1){
        this.last_pos=[x,y];
        this.held=true;
        this.game.mouse_ctrl([0,0,0,0],[x,y],true);
      } else if (pressing == -1){
        this.held=false;
        this.game.mouse_ctrl([0,0,0,0],[x,y],false);
      } else if (this.held) {
        grad=[x-this.last_pos[0],this.last_pos[1]-y];
        if (grad[0]!=0 || grad[1]!=0){
          ang=Math.atan2(grad[1],grad[0]);
          pressed=[false, false, false, false]; //wasd
          if (Math.abs(ang-Math.PI/2)<Math.PI/3){
            pressed[0]=true;
          }
          if (Math.abs(ang)>Math.PI*2/3){
            pressed[1]=true;
          }
          if (Math.abs(ang+Math.PI/2)<Math.PI/3){
            pressed[2]=true;
          }
          if (Math.abs(ang)<Math.PI/3){
            pressed[3]=true;
          }
          this.game.mouse_ctrl(pressed,[x,y],true);
        }
      }
    }
  }
  GameStart.prototype.clickHandler = function(event) {
    w=window.innerWidth
    h=window.innerHeight
    r=this.canvas.width/this.canvas.height
    if(h*r>w){h=w/r;}
    else{w=h*r;}
    var x=event.offsetX*1024/w;
    var y=event.offsetY*768/h;
    if(!this.game.active){
      this.ctrls=2;
      this.game.ctrls=2;

      if(Math.abs(512-x)<300 && Math.abs(210-y)<30){
        this.enter_game();
      }
      if(Math.abs(512-x)<190 && Math.abs(265-y)<18){
        this.enter_game();
      }
      if(Math.abs(512-x)<200 && Math.abs(520-y)<18){
        this.inc_topology(1);
      }
      if(Math.abs(512-x)<50 && Math.abs(590-y)<50){
        this.inc_topology(1);
      }
      if(Math.abs(512-x)<150 && Math.abs(666-y)<18){
        this.inc_topology(1);
      }
      if(Math.abs(512-x)<300 && Math.abs(710-y)<18){
        this.toggle_friendly_fire();
      }
      if(Math.abs(512-x)<110 && Math.abs(750-y)<18){
        window.location.href = "../../..";
      }
    }
    else {
      this.ms_ctrl(event,1);
    }
  }

  var listener = new window.keypress.Listener();

  GameStart.prototype.keyHandler = function() {
    listener.simple_combo('enter', this.enter_game.bind(this));

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

    kd.W.press(function() {
      if(!this.game.active){
        this.ctrls=1;
        this.game.ctrls=1;
      }
    }.bind(this));
    kd.A.press(function() {
      if(!this.game.active){
        this.ctrls=1;
        this.game.ctrls=1;
      }
    }.bind(this));
    kd.S.press(function() {
      if(!this.game.active){
        this.ctrls=1;
        this.game.ctrls=1;
      }
    }.bind(this));
    kd.D.press(function() {
      if(!this.game.active){
        this.ctrls=1;
        this.game.ctrls=1;
      }
    }.bind(this));

    kd.UP.press(function() {
      if(!this.game.active){
        this.ctrls=0;
        this.game.ctrls=0;
      }
    }.bind(this));
    kd.LEFT.press(function() {
      if(!this.game.active){
        this.ctrls=0;
        this.game.ctrls=0;
      }
    }.bind(this));
    kd.DOWN.press(function() {
      if(!this.game.active){
        this.ctrls=0;
        this.game.ctrls=0;
      }
    }.bind(this));
    kd.RIGHT.press(function() {
      if(!this.game.active){
        this.ctrls=0;
        this.game.ctrls=0;
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
    ctx.translate(512,370);
    ctx.font="bold 20px vector_battleregular"
    ctx.fillStyle="white"
    ctx.strokeStyle = "white";
    ctx.letterSpacing = "1px"
    ctx.textAlign = "center";
    if (this.get_ctrls()==0){
      this.fillThickly(ctx,"Move: \u2190 \u2191 \u2192 \u2193  Fire: space",.3);
    } else if (this.get_ctrls()==1){
      this.fillThickly(ctx,"Move: W A S D  Fire: space",.3);
    } else {
      this.fillThickly(ctx,"Move: swipe on left half  Fire: tap right half",.3);
      ctx.translate(0,40);
      this.fillThickly(ctx,"(press WASD/\u2190\u2191\u2192\u2193 to swap)",.3);
    }
    ctx.restore();

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
    if(this.get_ctrls()==2){
      this.fillThickly(ctx,"(click to change)",.25)
    } else {
      this.fillThickly(ctx,"(press T to change)",.25)
    }

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
    if(this.get_ctrls()==2){
      ff=ff+" (click to toggle)"
    } else {
      ff=ff+" (F to toggle)"
    }

    this.fillThickly(ctx,ff,.25)
    ctx.restore();

    ctx.save();
    ctx.translate(512,750);
    ctx.font="bold 17px vector_battleregular"
    ctx.fillStyle="white"
    ctx.letterSpacing = "3px"
    ctx.textAlign = "center";

    if(this.get_ctrls()==2){
      this.fillThickly(ctx,"click to quit",.25)
    } else {
      this.fillThickly(ctx,"Q to quit",.25)
    }

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
    // if(gameover){
    //  ctx.translate(0,60);
    // }
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
    if(this.get_ctrls()==2){
      this.fillThickly(ctx,"click here to play",.25);
    } else{
      this.fillThickly(ctx,"press enter to play",.25);
    }
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
