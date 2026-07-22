(function() {
  if (typeof Asteroids === 'undefined') {
    window.Asteroids = {};
  }

  var GameStart = Asteroids.GameStart = function(canvas) {
    this.playedOnce = false;
    this.canvas = canvas;
    this.ALLOW_MOUSE = false;
    this.bonuses = true;
    this.bosses = true;
    this.topology_idx = 0;
    this.ctrls = 0;
    this.friendly_fire = false;
    this.settings = false;
    this.start();
  };

  GameStart.prototype.get_topology = function() {
    return[[0, 0], [0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]][this.topology_idx % 9];
  }

  GameStart.prototype.get_topology_name = function() {
    return["square (boring)", "cylinder", "cylinder", "m\u00F6bius strip", "m\u00F6bius strip", "torus", "klien bottle", "klien bottle", "RP2"][this.topology_idx % 9];
  }
  GameStart.prototype.start = function() {
    this.keyHandler();

    this.game = new Asteroids.Game(this.canvas, this, {
      topology: this.get_topology(),
      friendly_fire: this.friendly_fire,
      ctrls: this.ctrls,
      bonuses: this.bonuses,
      bosses: this.bosses,
      spf: 1000/90, // milliseconds per frame
    });
    if (!this.playedOnce) {
      this.welcomeLoop();
      if (this.ALLOW_MOUSE) {
        this.canvas.addEventListener('mousedown', this.clickHandler.bind(this), false);
        this.canvas.addEventListener('mouseup', function(event) {
          this.ms_ctrl(event, -1)
        }.bind(this), false);
      }
    }
    else {
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
    this.settings = false;
    $('#game-over').hide();
    listener.reset();
  }
  GameStart.prototype.ms_ctrl = function(event, pressing) {
    if (this.ctrls != 2) {
      return;
    }
    w = window.innerWidth
    h = window.innerHeight
    r = this.canvas.width / this.canvas.height
    if (h * r > w) {
      h = w / r;
    }
    else {
      w = h * r;
    }
    var x = event.offsetX * 1024 / w;
    var y = event.offsetY * 768 / h;
    if (x > 512 && pressing == 1) {
      this.game.fire();
    }
    buttons = [
      [100, 600],
      [50, 650],
      [100, 700],
      [150, 650]]
    if (x < 512) {
      if (pressing == 1) {
        for (var i = 0; i < buttons.length; i++) {
          if (Math.pow(x - buttons[i][0], 2) + Math.pow(y - buttons[i][1], 2) < 900) {
            this.game.mouse_press(i);
          }
        }
      } else if (pressing == -1) {
        for (var i = 0; i < buttons.length; i++) {
          if (Math.pow(x - buttons[i][0], 2) + Math.pow(y - buttons[i][1], 2) < 900) {
            this.game.mouse_press(i, 0);
          }
        }
      }
    }
  }
  GameStart.prototype.clickHandler = function(event) {
    w = window.innerWidth
    h = window.innerHeight
    r = this.canvas.width / this.canvas.height
    if (h * r > w) {
      h = w / r;
    }
    else {
      w = h * r;
    }
    var x = event.offsetX * 1024 / w;
    var y = event.offsetY * 768 / h;
    if (!this.game.active) {
      this.ctrls = 2;
      this.game.ctrls = 2;

      if (Math.abs(512 - x) < 300 && Math.abs(210 - y) < 30) {
        this.enter_game();
      }
      if (Math.abs(512 - x) < 190 && Math.abs(265 - y) < 18) {
        this.enter_game();
      }
      if (Math.abs(512 - x) < 200 && Math.abs(520 - y) < 18) {
        this.inc_topology(1);
      }
      if (Math.abs(512 - x) < 50 && Math.abs(590 - y) < 50) {
        this.inc_topology(1);
      }
      if (Math.abs(512 - x) < 150 && Math.abs(666 - y) < 18) {
        this.inc_topology(1);
      }
      if (Math.abs(512 - x) < 300 && Math.abs(710 - y) < 18) {
        this.toggle_friendly_fire();
      }
      if (Math.abs(512 - x) < 110 && Math.abs(750 - y) < 18) {
        window.location.href = "../../..";
      }
    }
    else {
      this.ms_ctrl(event, 1);
    }
  }

  var listener = new window.keypress.Listener();

  GameStart.prototype.keyHandler = function() {
    listener.simple_combo('enter', this.enter_game.bind(this));

    kd.Z.press(function() {
      if (!this.game.active) {
        this.settings = !this.settings;
      }
    }.bind(this));

    kd.T.press(function() {
      if (!this.game.active) {
        this.inc_topology(1);
      }
    }.bind(this));

    kd.F.press(function() {
      if (!this.game.active) {
        this.toggle_friendly_fire();
        this.settings = true;
      }
    }.bind(this));

    kd.P.press(function() {
      if (!this.game.active) {
        this.bonuses = !this.bonuses;
        this.update_bonuses();
        this.settings = true;
      }
    }.bind(this));

    kd.B.press(function() {
      if (!this.game.active) {
        this.bosses = !this.bosses;
        this.settings = true;
      }
    }.bind(this));

    kd.W.press(function() {
      if (!this.game.active) {
        this.ctrls = 1;
        this.game.ctrls = 1;
        this.settings = true;
      }
    }.bind(this));

    kd.UP.press(function() {
      if (!this.game.active) {
        this.ctrls = 0;
        this.game.ctrls = 0;
        this.settings = true;
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

  GameStart.prototype.gameOverText = function() {};

  var requestId;

  GameStart.prototype.renderMenu = function(gameover = false) {
    this.game.borderHints(this.get_topology());
    if (this.settings) {
      this.renderSettings();
      return;
    }
    toppyImg = new Image();
    toppyImg.src = ['img/square.png', 'img/cylinder.png', 'img/cylinder2.png', 'img/mobius.png', 'img/mobius2.png', 'img/torus.png', 'img/klien.png', 'img/klien2.png', 'img/rp2.png', ][this.topology_idx % 9];

    var ctx = this.canvas.getContext('2d');
    ctx.textAlign = "center";
    ctx.fillStyle = "white"

    ctx.save();
    ctx.translate(512, 210);
    ctx.font = "bold 50px vector_battleregular";
    ctx.letterSpacing = "25px";
    if (gameover) {
      this.fillThickly(ctx, "Game over");
    } else {
      this.fillThickly(ctx, "Asteroids");
    }
    ctx.restore();

    ctx.save();
    ctx.translate(512, 370);
    ctx.font = "bold 20px vector_battleregular"
    ctx.letterSpacing = "1px"
    if (this.ctrls == 0) {
      this.fillThickly(ctx, "Move: \u2190 \u2191 \u2192 \u2193  Fire: space", .3);
    } else if (this.ctrls == 1) {
      this.fillThickly(ctx, "Move: W A S D  Fire: space", .3);
    } else {
      this.fillThickly(ctx, "Move: swipe on left half  Fire: tap right half", .3);
      ctx.translate(0, 40);
      this.fillThickly(ctx, "(press W/\u2191 to swap)", .3);
    }
    ctx.restore();

    ctx.save();
    ctx.translate(512, 520);
    ctx.font = "bold 17px vector_battleregular"
    ctx.letterSpacing = "3px"
    this.fillThickly(ctx, "Topology: " + this.get_topology_name(), .25)
    ctx.restore();

    ctx.save();
    ctx.translate(512, 590);
    //ctx.rotate(rot * -1);
    ctx.drawImage(toppyImg, -50, -50, 100, 100);
    ctx.restore();

    ctx.save();
    ctx.translate(512, 666);
    ctx.font = "bold 17px vector_battleregular"
    ctx.letterSpacing = "3px"
    if (this.ctrls == 2) {
      this.fillThickly(ctx, "(click to change)", .25)
    } else {
      this.fillThickly(ctx, "(press T to change)", .25)
    }
    ctx.restore();

    ctx.save();
    ctx.translate(512, 710);
    ctx.font = "bold 17px vector_battleregular"
    ctx.letterSpacing = "3px";
    ctx.textAlign = "center";
    this.fillThickly(ctx, "[z]: Settings", .25)

    ctx.translate(0, 40);
    if (this.ctrls == 2) {
      this.fillThickly(ctx, "click to quit", .25)
    } else {
      this.fillThickly(ctx, "[Q]: quit", .25)
    }

    ctx.restore();

    ctx.save();
    ctx.translate(512, 265);
    // if(gameover){
    //  ctx.translate(0,60);
    // }
    ctx.font = "bold 23px vector_battleregular";
    mx = .9;
    mn = 0;
    if (isNaN(this.alpha)) {
      this.alpha = mx;
      this.gradient = -.03
    }
    ctx.fillStyle = "rgba(255, 255, 255, " + this.alpha + ")"
    this.alpha += this.gradient
    this.alpha = Math.min(Math.max(this.alpha, mn), mx);
    if (this.alpha == mx || this.alpha == mn) {
      this.gradient = -this.gradient;
    }
    ctx.letterSpacing = "3px";
    if (this.ctrls == 2) {
      this.fillThickly(ctx, "click here to play", .25);
    } else {
      this.fillThickly(ctx, "press enter to play", .25);
    }
    ctx.restore();
  };

  GameStart.prototype.renderSettings = function() {
    toppyImg = new Image();
    toppyImg.src = ['img/square.png', 'img/cylinder.png', 'img/cylinder2.png', 'img/mobius.png', 'img/mobius2.png', 'img/torus.png', 'img/klien.png', 'img/klien2.png', 'img/rp2.png', ][this.topology_idx % 9];

    var ctx = this.canvas.getContext('2d');
    ctx.textAlign = "center";
    ctx.fillStyle = "white"
    ctx.save();

    ctx.translate(512, 210);
    ctx.font = "bold 50px vector_battleregular";
    ctx.letterSpacing = "25px";
    this.fillThickly(ctx, "Settings");

    ctx.translate(0, 40);
    ctx.font = "bold 17px vector_battleregular"
    ctx.letterSpacing = "3px";
    if (this.ctrls == 2) {
      this.fillThickly(ctx, "click to quit", .25)
    } else {
      this.fillThickly(ctx, "[Z]: exit", .25)
    }
    ctx.translate(0, 90);

    ctx.font = "bold 20px vector_battleregular"
    ctx.letterSpacing = "1px"
    if (this.ctrls == 0) {
      this.fillThickly(ctx, "Move [w]: \u2190 \u2191 \u2192 \u2193", .3);
    } else if (this.ctrls == 1) {
      this.fillThickly(ctx, "Move [\u2191]: W A S D", .3);
    } else {
      this.fillThickly(ctx, "Move: swipe on left half  Fire: tap right half", .3);
      ctx.translate(0, 40);
      this.fillThickly(ctx, "(press W/\u2191 to swap)", .3);
    }
    ctx.translate(0, 45);

    ctx.font = "bold 17px vector_battleregular"
    ctx.letterSpacing = "3px";
    ctx.textAlign = "center";
    var ff = "Friendly fire [f]: "
    if (this.friendly_fire) {
      ff = ff + "ON";
      ctx.strokeStyle = "red";
      ctx.fillStyle = "red";
    } else {
      ff = ff + "OFF";
    }
    this.fillThickly(ctx, ff, .25)
    ctx.translate(0, 45);

    ctx.fillStyle = "white";
    ctx.font = "bold 17px vector_battleregular"
    ctx.letterSpacing = "3px";
    ctx.textAlign = "center";
    var ff = "Powerups [P]: "
    if (this.bonuses) {
      ff = ff + "ON";
      ctx.fillStyle = "yellow";
    } else {
      ff = ff + "OFF";
    }
    this.fillThickly(ctx, ff, .25);
    ctx.translate(0,45);

    ctx.fillStyle = "white";
    ctx.font = "bold 17px vector_battleregular"
    ctx.letterSpacing = "3px";
    ctx.textAlign = "center";
    var ff = "Bosses [B]: "
    if (this.bosses) {
      ff = ff + "ON";
      ctx.fillStyle = "red";
    } else {
      ff = ff + "OFF";
    }
    this.fillThickly(ctx, ff, .25);
    ctx.translate(0,45);

    ctx.fillStyle = "white";
    ctx.font = "bold 17px vector_battleregular"
    ctx.letterSpacing = "3px"
    this.fillThickly(ctx, "Topology [T]: " + this.get_topology_name(), .25)
    ctx.translate(0, 70);
    //ctx.rotate(rot * -1);
    ctx.drawImage(toppyImg, -50, -50, 100, 100);
    ctx.translate(0, 70);

  };

  GameStart.prototype.welcomeLoop = function() {
    requestId = window.requestAnimationFrame(this.welcomeLoop.bind(this));
    this.game.drawBackground();
    this.game.drawBorder();
    this.game.makeAsteroids([0, 3, 2, 1, 1, 2, 1]);
    for (var i = 0; i < this.game.asteroids.length; i++) {
      this.game.asteroids[i].move().render();
    }
    this.renderMenu();
  };
  GameStart.prototype.fillThickly = function(ctx, text, scale = .5) {
    ctx.fillText(text, 0, 0);
    ctx.fillText(text, 0, scale);
    ctx.fillText(text, 0, 2 * scale);
    ctx.fillText(text, 0, -scale);
    ctx.fillText(text, 0, -2 * scale);
    ctx.fillText(text, scale, 0);
    ctx.fillText(text, -scale, 0);
  };
  GameStart.prototype.renderMenuLoop = function(gameover = false) {
    requestId = window.requestAnimationFrame(this.renderMenuLoop.bind(this));
    this.renderMenu(gameover);
  };

  GameStart.prototype.inc_topology = function(i) {
    this.topology_idx = this.topology_idx + i;
    this.game.update_topology(this.get_topology());
  };

  GameStart.prototype.toggle_friendly_fire = function(i) {
    this.friendly_fire = !this.friendly_fire;
    this.game.update_friendly_fire(this.friendly_fire);
  };

  GameStart.prototype.update_bonuses = function() {
    for (var i = 0; i < this.game.asteroids.length; i++) {
      var ass = this.game.asteroids[i];
      if (ass.type > 3 && this.bonuses) {
        var r = Math.random();
        if (r < .025) {
          ass.bonus = 4;
        } else if (r < .2) {
          ass.bonus = 2;
        } else if (r < .4) {
          ass.bonus = 3;
        } else if (r < .5) {
          ass.bonus = 1;
        }

      } else {
        ass.bonus = 0;
      }
    }
  };
})();