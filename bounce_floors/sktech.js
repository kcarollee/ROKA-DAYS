class Plane{
    constructor(cposx, cposy, width, height, ty){ // ty-> translate y
      // canvas width
      this.width = width;
      this.height = height;
      this.ty = ty;
      // canvas pos -> x, y coords
      this.cposx = cposx;
      this.cposy = cposy;
      this.pg = createGraphics(this.width, this.height);
      this.collisionPoints = [];
      this.radiusArr = [];
      this.color = [random(0, 255), random(0, 255), random(0, 255)];
      this.displacement = 0;
    }
    
    setDisplacement(disp){this.displacement = disp;}
    
    distFromParticle(particle){return abs(particle.pos.y - this.ty);}
    
    withinBounds(particle){
      if (particle.pos.x < this.cposx || particle.pos.x > this.cposx + this.width) return false;
      if (particle.pos.z < this.cposy || particle.pos.z > this.cposy + this.height) return false;
      return true;
    }
    
    updateRadiusArr(){
      for (let i = 0; i < this.radiusArr.length; i++){
        this.radiusArr[i]++;
        if (this.radiusArr[i] > this.width * 2.0) {
          
          this.radiusArr.splice(i, 1);
          this.collisionPoints.splice(i, 1);
        }
      }
    }
    
    addToCollisionPoints(particle){
      this.collisionPoints.push([particle.pos.x - this.cposx, particle.pos.z - this.cposy]);
      this.radiusArr.push(1);
    }
    
    display(particleArr){
      this.pg.clear();
      this.pg.background(0, 0);
      for (let i = 0; i < this.collisionPoints.length; i++){
        this.pg.noFill();
        this.pg.stroke(this.color[0], this.color[1], this.color[2], 4000/ this.radiusArr[i]);
        this.pg.strokeWeight(4);
        this.pg.ellipse(this.collisionPoints[i][0], this.collisionPoints[i][1], 
                       this.radiusArr[i], this.radiusArr[i]);
      }
      push();
      translate(0, this.ty, 0); // y: use as plane position
      rotateX(Math.PI / 2 ) ;
      
      image(this.pg, this.cposx, this.cposy);
      pop();
      //clear();
    }
  }
  function preload(){
    font = loadFont('monoid.ttf');
  }
  class Particle{
    constructor(posx, posy, posz, id){
      this.pos = createVector(posx, posy, posz);
      this.vel = createVector(random(-0.01, 0.01), random(-0.01, 0.01), random(-0.01, 0.01));
      this.acc = createVector(random(-0.0001, 0.0001), random(0.001, 0.005), 0);
      this.id = id;
      this.bounceCount = 0;
    }
    
    // force: PVector
    addForce(force){
      this.acc.add(force);
    }
    
    display(){
      stroke(255);
      push();
      //this.acc = createVector(0, random(0.001, 0.005), 0);
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      translate(this.pos.x, this.pos.y, this.pos.z);
      sphere(4, 1, 1);
      pop();
    }
  }
  
  
  let tp;
  let tplane;
  let particleArr = [];
  let planeArr = [];
  let planeNum = 6;
  let particleNum = 20;
  let gl;
  let font;
  function preload(){
    font = loadFont('monoid.ttf');
  }
  function setup() {
   
    createCanvas(600, 600, WEBGL);
     textFont(font);
    // create particles
    for (let i = 0; i < particleNum; i++){
      let p = new Particle(random(-100, 200), random(-300, -250), random(-50, 50), i);
      particleArr.push(p);
    }
    
    // create planes
    for (let i = -5; i <= 6; i++){
      let plane = new Plane(-50 * i, -100, 200, 200, 50 * i);
      planeArr.push(plane);
    }
    /*
    for (let i = -10; i < 10; i++){
      let plane = new Plane(50 * i, -300, 200, 200, 50 * i);
      planeArr.push(plane);
    }
    */
    
    // disable depth test
    gl = this._renderer.GL;
    gl.disable(gl.DEPTH_TEST);
  }
  
  function draw() {  
    gl.disable(gl.DEPTH_TEST);
    background(0);
  
    orbitControl();
    planeArr.forEach(function(tplane){
      
      particleArr.forEach(function(tp){
        tp.display();
        //tp.addForce(createVector(0, random(0, 0.0001), 0));
        if (tplane.distFromParticle(tp) < 5 && tplane.withinBounds(tp)){
          tp.vel.x *= Math.sin(random(0, PI));
          tp.vel.y *= -1;
          tp.vel.z *= Math.cos(random(0, PI));
          tp.bounceCount++;
          // if bounce count > 3, delete particle
          if (tp.bounceCount > 3){
            let i = particleArr.indexOf(tp);
            particleArr.splice(i, 1);
          }
          tplane.addToCollisionPoints(tp);
        } 
        // get rid of particles that are out of sight
        if (tp.pos.y > 1000) {
          //console.log(particleArr.length);
          let i = particleArr.indexOf(tp);
          particleArr.splice(i, 1);
        }
      });
      tplane.display(particleArr);
      tplane.updateRadiusArr();
    });
   
    
  }
  
  function createParticles(){
    for (let i = 0; i < particleNum; i++){
      let p = new Particle(random(-400, 400), random(-300, -250), random(-50, 50), i);
      particleArr.push(p);
    }
  }
  
  function keyPressed(){
    switch(key){
      case 'p':
        createParticles();
        break;
    }
  }