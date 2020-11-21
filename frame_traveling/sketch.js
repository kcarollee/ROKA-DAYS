


class Canvas{
    constructor(frameOffset, cposx, cposy, width, height, mode){
      this.cposx = cposx;
      this.cposy = cposy;
      this.width = width;
      this.height = height;
      this.frameOffset = frameOffset;
      this.frame = frameCount + this.frameOffset; //  frameCount
      this.subStrIndex = 0;
      switch(mode){
        case 'P2D':
          this.pg = createGraphics(this.width, this.height);
          break;
        // WEBGL mode breaks everything, shit.
        case 'WEBGL':
          this.pg = createGraphics(this.width, this.height, WEBGL);
      }
    }
    
    makeStatusString(i){
      if (this.frameOffset < 0) this.statusString = 'frame ' + i + ' is ' + (-this.frameOffset) + ' frames into the past';
      else this.statusString = 'frame ' + i + ' is ' + this.frameOffset + ' frames into the future';
    }
    
    returnString(){
      if (this.subStrIndex < this.statusString.length){
        return this.statusString.substr(0, this.subStrIndex++);
      }
      else return this.statusString;
    }
    display(){
      this.pg.background(255);
      this.pg.noFill();
      //this.pg.strokeWeight(2 + Math.sin(this.frame * 0.01));
      this.pg.stroke(0);
      this.pg.push();
      this.pg.translate(-this.cposx, -this.cposy);
      
      
      for (let i = 0; i < 20; i++){
      this.pg.ellipse(250, 250, 20 * i + 100 * Math.sin(this.frame * 0.02), 
              20 *i + 100 * Math.sin(this.frame * 0.02));
      }
      
      
     
      
      this.pg.pop();
      image(this.pg, this.cposx, this.cposy);
      
    }
    
    updateFrameCount(){this.frame = frameCount + this.frameOffset;}
  }
  
  let origCanvas; // let original canvas also be a Canvas instance. this.frameOffset = 0;
  let cnvArr = [];
  let pcnvArr = []; // prepared canvas
  let initCnvPos;
  let finalCnvPos;
  let font;
  let mouseDragged;
  let randomOffset;
  let showText = false;
  let pcnvMode = false;
  function preload(){
    font = loadFont('monoid.ttf');
  }
  function setup() {
    createCanvas(500, 500);
    //textSize(12);
    textFont(font);
    origCanvas = new Canvas(0, 0, 0, width, height, 'P2D');
    let w = 100;
    let h = 100;
    for (let i = 0; i < height; i += h){
      for (let j = 0; j < width; j += w){
        let c = new Canvas(Math.floor(random(-500, 500)), j, i, w, h, 'P2D');
        
        pcnvArr.push(c);
      }
    }
    
  }
  
  function draw() {
    origCanvas.display();
    origCanvas.updateFrameCount();
    // other canvases
    if (pcnvMode){
      fill(0);
      textSize(10);
      pcnvArr.forEach(a=>a.display());
      pcnvArr.forEach(a=>a.updateFrameCount());
      text('prepared frames: ' + pcnvArr.length, 10, 30);
    }
    else {
      
      
      if (cnvArr.length != 0){
        cnvArr.forEach(a=>a.display());
        for (let i = 0; i < cnvArr.length; i++){
          cnvArr[i].updateFrameCount();
          if (showText){
              text(cnvArr[i].returnString(), 10, 20*(i+3));
          }
        }
      }
      if (mouseDragged){
        if (randomOffset >= 0) text(randomOffset + ' frames into the future', 
                                 initCnvPos.x + 2, initCnvPos.y + 12);
        else text(-randomOffset + ' frames into the past',
               initCnvPos.x + 2, initCnvPos.y + 12);
        noFill();
        rect(initCnvPos.x, initCnvPos.y, mouseX -  initCnvPos.x, mouseY - initCnvPos.y);
        
      }  
      fill(0);
      textSize(10);
      text('number of frames: ' + cnvArr.length, 10, 30);
    }
    
    
    
    
  }
  
  function mousePressed(){
    initCnvPos = createVector(mouseX, mouseY);
    randomOffset = Math.floor(random(-500, 500));
    mouseDragged = true;
  }
  
  function mouseReleased(){
    mouseDragged = false;
    finalCnvPos = createVector(mouseX, mouseY);
    let cnv = new Canvas(randomOffset, initCnvPos.x, initCnvPos.y,
                         Math.abs(finalCnvPos.x - initCnvPos.x),
                         Math.abs(finalCnvPos.y - initCnvPos.y),
                         'P2D');
    cnv.makeStatusString(cnvArr.length);
    cnvArr.push(cnv);            
  }
  
  function keyPressed(){
    switch(key){
      case 't':
        showText = !showText;
        break;
      case 'p':
        pcnvMode = !pcnvMode;
        break;
    }
  }