# Asteroids (played on different 2d manifolds)

[play here](http://pranavraj575.github.io/assets/html/assteroids)

<img src="https://github.com/pranavraj575/asteroids/blob/master/display/playing.gif">

[Changes from original repo](https://github.com/pranavraj575/asteroids/blob/master/changes.md)

## Controls

* Thrust: &#8593;
* Pivot ship left: &#8592;
* Pivot ship right: &#8594;
* Brake: &#8595;
* Fire: <kbd>space</kbd><br>

## Topologies

The boundary pairs (left/right and top/bottom) are can be kept as boundaries, joined in the same orientation, or joined in the inverted orientation.
This creates 6 unique topologies to play on.

### square
<img src="https://github.com/pranavraj575/asteroids/blob/master/img/square.png" width=100>
<img src="https://github.com/pranavraj575/asteroids/blob/master/display/square.png">

### cylinder
<img src="https://github.com/pranavraj575/asteroids/blob/master/img/cylinder.png" width=100>
<img src="https://github.com/pranavraj575/asteroids/blob/master/display/cylinder.png">

### m&ouml;bius strip
<img src="https://github.com/pranavraj575/asteroids/blob/master/img/mobius.png" width=100>
<img src="https://github.com/pranavraj575/asteroids/blob/master/display/mobius.png">

### torus
<img src="https://github.com/pranavraj575/asteroids/blob/master/img/torus.png" width=100>
<img src="https://github.com/pranavraj575/asteroids/blob/master/display/torus.png">

### klien bottle
<img src="https://github.com/pranavraj575/asteroids/blob/master/img/klien.png" width=100>
<img src="https://github.com/pranavraj575/asteroids/blob/master/display/klien.png">

### RP&sup2;
<img src="https://github.com/pranavraj575/asteroids/blob/master/img/rp2.png" width=100>
<img src="https://github.com/pranavraj575/asteroids/blob/master/display/rp2.png">

## How to play locally (if you dont like spooky links)

* Clone/cd into repo
  ```bash
  git clone https://github.com/pranavraj575/asteroids
  cd asteroids
  ```
* Start `index.html`
  * Windows: `start index.html`
  * Linux:  `xdg-open index.html`
  * Mac (2 steps):
    * Get a new computer
    * Run one of the other two commands
