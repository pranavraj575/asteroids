(function() {
  if (typeof Asteroids === 'undefined') {
    window.Asteroids = {};
  }

  var Ship = Asteroids.Ship = function(canvas,topology,friendly_fire) {
    this.hide = false;
    this.invulnerable = 0;
    this.canFire = true;
    this.max_bullets=13;
    this.piercing_shots=0;
    this.ps_fired=0;
    this.friendly_fire=friendly_fire;
    if(this.friendly_fire){
      this.bullet_life=-1;
    } else{
      this.bullet_life=42;
    }

    this.canvas = canvas;
    this.velocity = [0, 0];
    this.position = [512, 384];
    this.x_bounds = [0, 1024];
    this.y_bounds = [0, 768];
    this.pointingAt = [0, -1];
    this.rotation = 90 * Math.PI / 180;
    this.bullets = [];

    this.topology = topology;
    this.inverted = false;
    this.speed_cap=20;
  };

  Ship.prototype.update_friendly_fire= function(friendly_fire){
    this.friendly_fire=friendly_fire;
    if(this.friendly_fire){
      this.bullet_life=-1;
    } else{
      this.bullet_life=42;
    }
  }
  Ship.prototype.fireBullet = function() {
    if (this.canFire && (this.bullets.length-this.ps_fired)<this.max_bullets+this.piercing_shots) {
      if (this.piercing_shots){
        this.piercing_shots-=1;
        this.ps_fired+=1;
        this.bullets.push(new Asteroids.Bullet(this.position,
          this.pointingAt, this.canvas, this.velocity,this.topology,420,false,true));
      } else  {
        this.bullets.push(new Asteroids.Bullet(this.position,
          this.pointingAt, this.canvas, this.velocity,this.topology,this.bullet_life,this.friendly_fire));
      }
    }
  };

  Ship.prototype.move = function() {

    for (var i = 0; i < 2; i++) {
      this.position[i] += this.velocity[i];
    }

    for (var dim=0; dim < 2; dim++){
      var other_dim = 1-dim;
      var bounds = [this.x_bounds, this.y_bounds][dim]
      var other_bounds = [this.x_bounds, this.y_bounds][other_dim]

      if(this.topology[dim]==1 || this.topology[dim]==-1){
        var trans = false;
        if (this.position[dim] < bounds[0] && this.velocity[dim] < 0) {
          this.position[dim] = bounds[1];
          trans = true;
        } else if (this.position[dim] > bounds[1] && this.velocity[dim] > 0) {
          this.position[dim] = bounds[0];
          trans = true;
        }
        if (trans && this.topology[dim]==-1){
          this.inverted=!this.inverted;
          this.position[other_dim] = other_bounds[1]-(this.position[other_dim]-other_bounds[0]);
          this.velocity[other_dim] = -this.velocity[other_dim];
          this.pointingAt[other_dim] = -this.pointingAt[other_dim];
          this.rotation = Math.atan2(-this.pointingAt[1],this.pointingAt[0]);
        }
      } else {
        // topology[1] is 0, we simply rebound
        if ((this.position[dim] < bounds[0] && this.velocity[dim] < 0) ||
            this.position[dim] > bounds[1] && this.velocity[dim] > 0
            ){
          this.velocity[dim]= -this.velocity[dim];
          // force ship in bounds
          this.position[dim]=Math.min(Math.max(this.position[dim],bounds[0]),bounds[1]);
        }
      }
    }

    return this;
  };

  Ship.prototype.moveBullets = function() {
    for (var i = this.bullets.length-1; i >= 0; i--) {
      this.bullets[i].move();
      if (this.bullets[i].life==0){
        this.ps_fired-=this.bullets[i].piercing;
        this.bullets.splice(i, 1);
      }
    }

    return this;
  };

  Ship.prototype.newPointingAt = function() {
    this.pointingAt[1] = Math.sin(this.rotation) * -1;
    this.pointingAt[0] = Math.cos(this.rotation);
  };

  Ship.prototype.render = function() {

    var stuff=[];
    stuff.push([this.position[0],this.position[1],this.rotation])

    if (this.topology[0]==1){
      stuff.push([this.position[0]+(this.x_bounds[1]-this.x_bounds[0]),this.position[1],this.rotation]);
      stuff.push([this.position[0]-(this.x_bounds[1]-this.x_bounds[0]),this.position[1],this.rotation]);
    } else if (this.topology[0]==-1){
      var temp = this.y_bounds[1]-(this.position[1]-this.y_bounds[0]);
      var rot = Math.atan2(this.pointingAt[1],this.pointingAt[0]);
      stuff.push([this.position[0]+(this.x_bounds[1]-this.x_bounds[0]), temp,rot]);
      stuff.push([this.position[0]-(this.x_bounds[1]-this.x_bounds[0]), temp,rot]);
    }
    if (this.topology[1]==1){
      stuff.push([this.position[0],this.position[1]+(this.y_bounds[1]-this.y_bounds[0]),this.rotation]);
      stuff.push([this.position[0],this.position[1]-(this.y_bounds[1]-this.y_bounds[0]),this.rotation]);
    } else if (this.topology[1]==-1){
      var temp = this.x_bounds[1]-(this.position[0]-this.x_bounds[0]);
      var rot = Math.atan2(-this.pointingAt[1],-this.pointingAt[0]);
      stuff.push([temp,this.position[1]+(this.y_bounds[1]-this.y_bounds[0]),rot]);
      stuff.push([temp,this.position[1]-(this.y_bounds[1]-this.y_bounds[0]),rot]);
    }
    if (this.topology[0]*this.topology[1]!=0){
      for(var x_shift=-1; x_shift<=1; x_shift+=2){
        for(var y_shift=-1; y_shift<=1; y_shift+=2){
          pointer=[this.pointingAt[0],this.pointingAt[1]];
          pos=[this.position[0],this.position[1]];
          if (this.topology[0]==1){
            pos[0]+=x_shift*(this.x_bounds[1]-this.x_bounds[0]);
          } else if (this.topology[0]==-1){
            pos[0]+=x_shift*(this.x_bounds[1]-this.x_bounds[0]);
            pos[1]=this.y_bounds[1]-(pos[1]-this.y_bounds[0]);
            pointer[1]=-pointer[1];
          }
          if (this.topology[1]==1){
            pos[1]+=y_shift*(this.y_bounds[1]-this.y_bounds[0]);
          } else if (this.topology[0]==-1){
            pos[1]+=y_shift*(this.y_bounds[1]-this.y_bounds[0]);
            pos[0]=this.x_bounds[1]-(pos[0]-this.x_bounds[0]);
            pointer[0]=-pointer[0];
          }
          stuff.push([pos[0],pos[1],Math.atan2(-pointer[1],pointer[0])]);
        }
      }
    }
    var buff=50;
    var ctx = this.canvas.getContext('2d');
    ctx.fillStyle='white';
    ctx.lineWidth = 2;
    if (this.invulnerable){
      ctx.strokeStyle = 'green';
      //ctx.drawImage(this.shipinvImg, -16, -16, 44, 32);
    }
    //else {//ctx.drawImage(this.shipImg, -16, -16, 44, 32);}
    for(var i=0; i<stuff.length; i++){
      pos=[stuff[i][0],stuff[i][1]];
      if((pos[0]>=this.x_bounds[0]-buff && pos[0]<=this.x_bounds[1]+buff) &&
           (pos[1]>=this.y_bounds[0]-buff && pos[1]<=this.y_bounds[1]+buff)){
          rot=stuff[i][2];
          ctx.save();
          ctx.translate(pos[0], pos[1]);
          ctx.rotate(rot * -1);
          ctx.beginPath();
          ctx.moveTo(16,0);
          ctx.lineTo(-13,-10);
          ctx.lineTo(-8,-6);
          ctx.lineTo(-8,6);
          ctx.lineTo(-13,10);
          ctx.lineTo(16,0);
          if (this.invulnerable){
            ctx.stroke();
          }
          ctx.fill();
          ctx.restore();
      }
    }
  };

  Ship.prototype.rotateLeft = function() {
    if (this.inverted){
      this.rotation -= 7 * Math.PI / 180;
    }
    else{
      this.rotation += 7 * Math.PI / 180;
    }

    if (this.rotation > 360 * Math.PI / 180) {
      this.rotation -= 360 * Math.PI / 180;
    }

    this.newPointingAt();
  };

  Ship.prototype.rotateRight = function() {
    if (this.inverted){
      this.rotation += 7 * Math.PI / 180;
    }
    else{
      this.rotation -= 7 * Math.PI / 180;
    }

    if (this.rotation < 0) {
      this.rotation += 360 * Math.PI / 180;
    }

    this.newPointingAt();
  };

  Ship.prototype.renderBullets = function() {
    for (var i = 0; i < this.bullets.length; i++) {
      this.bullets[i].render();
    }

    return this;
  };

  Ship.prototype.resetShip = function(resetpos=true,invul_time=2000) {
    this.invulnerable += 1;
   /* var resetting = setInterval(function() {
      if (this.hide === false) {
        this.hide = true;
      } else {
        this.hide = false;
      }
    }.bind(this), 200);*/

    setTimeout(function() {
      //clearInterval(resetting);
      this.invulnerable -= 1;
      this.hide = false;
    }.bind(this), invul_time);
    if (resetpos){
      this.position = [512, 384];
      this.pointingAt = [0, -1];
      this.rotation = 90 * Math.PI / 180;
      this.velocity = [0, 0];
      this.inverted=false;
    }
  };

  Ship.prototype.showLives = function(posX, posY) {
    var ctx = this.canvas.getContext('2d');
    ctx.drawImage(this.shipImgLife, posX, posY);
  };

  Ship.prototype.thrust = function() {

    for (var i = 0; i < 2; i++) {
      this.velocity[i] += this.pointingAt[i] * 0.12;
      if (Math.abs(this.velocity[i]) > this.speed_cap) {
        if (this.velocity[i] > 0) {
          this.velocity[i] = this.speed_cap;
        } else {
          this.velocity[i] = -this.speed_cap;
        }
      }
    }
  };
  Ship.prototype.brake = function() {
    var speed = Math.sqrt(Math.pow(this.velocity[0],2)+Math.pow(this.velocity[1],2));
    if (speed<0.12){
      this.velocity=[0,0]
    } else if(speed>0){
    var unit_vel = [this.velocity[0]/speed, this.velocity[1]/speed];
    for (var i = 0; i < 2; i++) {
        this.velocity[i] -= unit_vel[i] * 0.12;
      }
    }
  };
})();
