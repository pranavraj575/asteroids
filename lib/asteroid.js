(function() {
  if (typeof Asteroids === 'undefined') {
    window.Asteroids = {};
  }

  var Asteroid = Asteroids.Asteroid = function(options) {
    this.velMult = options.velMult || 1;
    this.velocityVector = this.initialVelocity();
    this.position = options.position || this.initialPosition();
    this.canvas = options.canvas;
    this.type = options.type;
    this.size = (this.type * 30).toString();
    this.shape = this.randomShape();
    this.x_bounds = [0, 1024];
    this.y_bounds = [0, 768];
    this.topology=options.topology;
    this.inverted=false;
  };

  var sndLarge = new Audio('audio/bangLarge.wav');
  var sndMedium = new Audio('audio/bangMedium.wav');
  var sndSmall = new Audio('audio/bangSmall.wav');

  Asteroid.prototype.initialPosition = function() {
    var positionArray = [];
    positionArray.push(Math.round(Math.random() * 1024));
    positionArray.push(Math.round(Math.random() * 768));
    return positionArray;
  };

  Asteroid.prototype.randomShape = function() {
    var charCode = Math.floor(Math.random() * (70 - 65 + 1)) + 65;
    return String.fromCharCode('0xC' + String.fromCharCode(charCode));
  };

  Asteroid.prototype.render = function() {


    var stuff=[];
    stuff.push([this.position[0],this.position[1],0])
    pointingAt=[0,1];

    if (this.topology[0]==1){
      stuff.push([this.position[0]+(this.x_bounds[1]-this.x_bounds[0]),this.position[1],0]);
      stuff.push([this.position[0]-(this.x_bounds[1]-this.x_bounds[0]),this.position[1],0]);
    } else if (this.topology[0]==-1){
      var temp = this.y_bounds[1]-(this.position[1]-this.y_bounds[0]);
      var rot = Math.atan2(pointingAt[1],pointingAt[0]);
      stuff.push([this.position[0]+(this.x_bounds[1]-this.x_bounds[0]), temp,rot]);
      stuff.push([this.position[0]-(this.x_bounds[1]-this.x_bounds[0]), temp,rot]);
    }
    if (this.topology[1]==1){
      stuff.push([this.position[0],this.position[1]+(this.y_bounds[1]-this.y_bounds[0]),0]);
      stuff.push([this.position[0],this.position[1]-(this.y_bounds[1]-this.y_bounds[0]),0]);
    } else if (this.topology[1]==-1){
      var temp = this.x_bounds[1]-(this.position[0]-this.x_bounds[0]);
      var rot = Math.atan2(-pointingAt[1],-pointingAt[0]);
      stuff.push([temp,this.position[1]+(this.y_bounds[1]-this.y_bounds[0]),rot]);
      stuff.push([temp,this.position[1]-(this.y_bounds[1]-this.y_bounds[0]),rot]);
    }
    if (this.topology[0]*this.topology[1]!=0){
      for(var x_shift=-1; x_shift<=1; x_shift+=2){
        for(var y_shift=-1; y_shift<=1; y_shift+=2){
          pointer=[0,1];
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

    for(var i=0; i<stuff.length; i++){
      pos=[stuff[i][0],stuff[i][1]];
      rot=stuff[i][2];

      var ctx = this.canvas.getContext('2d');
      ctx.font = this.size + 'px vector_battleregular';
      ctx.fillStyle = 'white';
      ctx.fillText(this.shape, pos[0] - this.type * 10.5,
        pos[1] + this.type * 10.5);
      // ctx.restore();
    }
  };

  Asteroid.prototype.initialVelocity = function() {
    var velocityArray = [];

    for (var i = 0; i < 2; i++) {
      var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
      velocityArray.push(plusOrMinus * Math.random() * 1.5);
    }

    if (this.velMult > 1) {
      for (var j = 0; j < 2; j++) {
        velocityArray[j] *= this.velMult;
      }
    }

    return velocityArray;
  };

  Asteroid.prototype.move = function() {

    for (var i = 0; i < 2; i++) {
      this.position[i] += this.velocityVector[i];
    }

    for (var dim=0; dim < 2; dim++){
      var other_dim = 1-dim;
      var bounds = [this.x_bounds, this.y_bounds][dim]
      var other_bounds = [this.x_bounds, this.y_bounds][other_dim]

      if(this.topology[dim]==1 || this.topology[dim]==-1){
        var trans = false;
        if (this.position[dim] < bounds[0] && this.velocityVector[dim] < 0) {
          this.position[dim] = bounds[1];
          trans = true;
        }  else if (this.position[dim] > bounds[1] && this.velocityVector[dim] > 0) {
          this.position[dim] = bounds[0];
          trans = true;
        }
        if (trans && this.topology[dim]==-1){
          this.inverted=!this.inverted;
          this.position[other_dim] = other_bounds[1]-(this.position[other_dim]-other_bounds[0]);
          this.velocityVector[other_dim] = -this.velocityVector[other_dim];
        }
      } else {
        // topology[1] is 0, we simply rebound
        if ((this.position[dim] < bounds[0] && this.velocityVector[dim] < 0) ||
            this.position[dim] > bounds[1] && this.velocityVector[dim] > 0
            ){
          this.velocityVector[dim]= -this.velocityVector[dim];
        }
      }
    }

    return this;
  };

  Asteroid.prototype.newTrajectory = function(bulletVector, angle) {
    var oldAsteroidTraj = this.initialVelocity();
    var newAsteroidTraj = [(oldAsteroidTraj[0] + bulletVector[0]) * Math.cos(angle), (oldAsteroidTraj[1] + bulletVector[1]) * Math.sin(angle)];
    return newAsteroidTraj;
  };
})();
