class PeriodicSum{
    // a * sin(b * t) -> a: oc (outer coef), b: ic (inner coef)
    constructor(iterNum, ocRangeMin, ocRangeMax, icRangeMin, icRangeMax){
      this.outerCoefs = [];
      this.innerCoefs = [];
      this.iterNum = iterNum;
      this.sorc = []; // 0: sin, 1: cos
      for (let i = 0; i < this.iterNum; i++){
        let oc = random(ocRangeMin, ocRangeMax);
        let ic = random(icRangeMin, icRangeMax);
        let f = int(random(0, 2));
        this.outerCoefs.push(oc);
        this.innerCoefs.push(ic);
        this.sorc.push(f);
      }
    }
    
    getPSum(t){
      let sum = 0;
      for (let i = 0; i < this.iterNum; i++){
        switch(this.sorc[i]){
          case 0:
            sum += this.outerCoefs[i] * sin(this.innerCoefs[i] * t);
            break;
          case 1:
            sum += this.outerCoefs[i] * cos(this.innerCoefs[i] * t);
            break;
        }
      }
      return sum;
    }
  }
  
  class WavyLine{
    // sPos: size 3 array for xyz
    constructor(sPos, zDec, ampMax){
      this.perFunc = new PeriodicSum(100, -ampMax, ampMax, -2, 2);
      this.sPos = sPos;
      this.cPos = this.sPos; 
      this.zDec = zDec; // z decrement 
      let z = this.cPos[2] - this.zDec;
      this.nPos = [this.cPos[0], this.cPos[1] + this.perFunc.getPSum(z), z]; 
    }
    
    display(pg){
      
      pg.push();
      
      pg.line(this.cPos[0], this.cPos[1], this.cPos[2], this.nPos[0], this.nPos[1], this.nPos[2]);
      this.updateLine1();
      pg.pop();
    }
    
    updateLine1(){
      let t = this.nPos;
      this.cPos = t;
      
      let z = this.cPos[2] - this.zDec;
      this.nPos = [this.cPos[0], this.cPos[1] + this.perFunc.getPSum(z), z]; 
    }
  }
  
  let lineNum;
  let lineArr = [];
  let pg0, pg1, bb; // initial sketch, postprocessing, backbuffer
  let pg2; // bloom pass
  let bbImg; 
  let shd1, shd2;
  let currentColor = [];
  let floorLineArr = [];
  let floorLineNum = 60;
  let track;
  let fft;
  let bass;
  let treble;
  let mid;
  function preload(){
    shd1 = loadShader('pass1.vert', 'pass1.frag');
    shd2 = loadShader('pass2.vert', 'pass2.frag');
    track = loadSound('track.mp3');
  }
  function setup() {
    createCanvas(600, 600, WEBGL);
    pg0 = createGraphics(width, height, WEBGL);
    pg1 = createGraphics(width, height, WEBGL);
    pg2 = createGraphics(width, height, WEBGL);
    pg3 = createGraphics(width, height, WEBGL);
    bb = createGraphics(width, height, WEBGL);
    bbImg = createImage(width, height);
    lineNum = 20;
    let angleDiv = TWO_PI / lineNum; 
    setPosSides(200);
    currentColor = [random(0, 1), random(0, 1), random(0, 1)];
    
    fft = new p5.FFT(0.9, 256);
  }
  function setPosCircular(){
    let r = 500;
    for (let i = 0; i < lineNum; i++){
      let ln = new WavyLine([r * cos(angleDiv * i), r * sin(angleDiv * i), 400 + 50 * i], 50);
      lineArr.push(ln);
    }
  }
  function setPosSides(gap, ampMax){
    for (let i = 0; i < lineNum; i++){
      let ln;
      let r = int(random(0, 2));
      switch(r){
        case 0:
          ln = new WavyLine([-gap * 0.5, 0,400 + 50 * i], 100, ampMax)
          break;
        case 1:
          ln = new WavyLine([gap * 0.5, 0,400 + 50 * i], 100, ampMax)
          break;
      }
      lineArr.push(ln);
    }
  }
  let spectrum;
  let boxPos = 0;
  let boxRot = 0;
  
  function draw() {
    spectrum = fft.analyze();
    bass = 0;treble = 0;mid = 0;
    for (let i = 0; i < spectrum.length; i++){
      if (i < spectrum.length * 0.33){
        bass += spectrum[i];
      }
      else if (spectrum.length * 0.33 < i && i < spectrum.length * 0.66){
        mid += spectrum[i];
      }
      else treble += spectrum[i];
    }
    bass /= spectrum.length;
    mid /= spectrum.length;
    treble /= spectrum.length;
  
    
    // pg0
    pg0.camera(0, 0, 600, 0, 0, 200, 0, 1, 0);
    pg0.background(0);
    let planeNum = 100;
    let planeDim = 300;
    pg0.noFill();
    for (let i = 0; i < planeNum; i++){
      pg0.push();
      pg0.translate(0, height / 3.0, (frameCount * 5 - planeDim * i) % (frameCount * 1000));
      pg0.rotateX(HALF_PI);
      pg0.plane(planeDim);
      pg0.pop();
    }
    
    pg0.stroke(255);
    pg0.strokeWeight(3);
    lineArr.forEach(l => l.display(pg0));
    pg0.resetMatrix();
    pg0._renderer._update();
    
    pg1.shader(shd1);
    shd1.setUniform('resolution', [width, height]);
    shd1.setUniform('tex', pg0);
    shd1.setUniform('backbuffer', bb);
    shd1.setUniform('time', frameCount);
    shd1.setUniform('currentColor', currentColor);
    shd1.setUniform('vibration', map(bass, 0, 90, 0.002, 0.006));
    pg1.rect(0, 0, width, height);
    pg1.resetMatrix();
    pg1._renderer._update();
    
    // bloom pass
    pg2.shader(shd2);
    shd2.setUniform('resolution', [width, height]);
    shd2.setUniform('tex', pg1);
    shd2.setUniform('backbuffer', bb);
    shd2.setUniform('time', frameCount);
    pg2.rect(0, 0, width, height);
    image(pg2, -width * 0.5, -height * 0.5);
    pg2.resetMatrix();
    pg2._renderer._update();
    
    noStroke();
    texture(pg2);
    boxPos += 1;
    if (boxPos > 312) {
      boxPos = 0;
      boxRot = 0;
    }
    translate(0, 0, 100);
    rotateY(boxRot);
    rotateX(boxRot);
    rotateZ(boxRot);
    boxRot += 0.01;
    box(boxPos);
    
    // bb
    bb.rotateX(PI);
    bb.image(pg1,-width * 0.5, -height * 0.5);
    bb._renderer._update();
  }
  
  let angleStart = 0;
  function createNewLines(){
    if (lineArr.length > lineNum * 5) lineArr = [];
    setPosSides(300, map(bass, 0, 90, 0, 10));
    console.log(bass);
    /*
    let newLineNum = 30;
    let angleDiv = TWO_PI / lineNum; 
    let r = 150;
    angleStart += angleDiv * newLineNum + random(0, PI);
    for (let i = 0; i < newLineNum; i++){
      let ln = new WavyLine([r * cos(angleDiv * i + angleStart), 
                             -200 + r * sin(angleDiv * i + angleStart), -100 + 50 * i], random(50, 400));
      lineArr.push(ln);
    }
    */
  }
  
  let enableColor = false;
  function keyPressed(){
    switch(key){
      case 'n':
        if (!enableColor)currentColor = [1, 1, 1];
        else currentColor = [1.0, random(0.9, 1.0), random(0.9, 1.0)];
        createNewLines();
        break;
      case 'b':
        enableColor = !enableColor;
        break;
      case 'p':
        track.play();
        break;
    }
  }