class Line{
    // pos is a p5.Vector
    constructor(length, pos){
      this.length = length;
      this.pos = pos;
      //console.log(this.pos);
      this.gscaleArr = [];
      this.count = 0;
      this.morph = true;
      this.cur = 0;
      this.rand = random(0, 10);
    }
    setColor(img){
      this.color = img.get(this.pos.x, this.pos.y); 
      //console.log(this.color);
      this.gscale = this.color.slice(0, 3).reduce((a, b)=>a + b) / 3.0;
      this.gscaleArr.push(this.gscale);
      //console.log(this.gscale);
    }
    display(index){
      stroke(255);
      strokeWeight(1);
      noFill();
      let dec = 1.0;
      let r = 1.0;
      if (index > 0) {
        if (Math.abs(this.gscaleArr[index] - this.cur) >= 2.0 && this.morph){
  
          this.cur = this.gscaleArr[index - 1] + 
            (this.gscaleArr[index] - this.gscaleArr[index - 1]) / 5.0 * this.count; 
          
          this.count += 0.1;
          
          rect(this.pos.x + r * cos(this.rand + frameCount * 0.1), this.pos.y + r * sin(this.rand + frameCount * 0.1), 
             this.cur * 0.05 - dec, this.cur * 0.05 - dec);
        }
        else {
          //console.log("STOP");
          this.count = 0;
          this.morph = false;
          this.cur = this.gscaleArr[index] - 1.0; 
          
          rect(this.pos.x + r * cos(this.rand + frameCount * 0.1), this.pos.y + r * sin(this.rand + frameCount * 0.1), 
             this.cur * 0.05 - dec, this.cur * 0.05 - dec);
          
        }
      }
      else{ 
        this.cur = this.gscaleArr[index] - 1.0;
        
        rect(this.pos.x + r * cos(this.rand + frameCount * 0.1), this.pos.y + r * sin(this.rand + frameCount * 0.1), 
             this.cur * 0.05 - dec, this.cur * 0.05 - dec);
      }
    }
  }
  
  
  
  let testLine;
  let testImage;
  let testImage2;
  
  let imgArr = [];
  let imgNum = 13;
  let pLines;
  let pLineArr = [];
  let wsnum, hsnum;
  let gscaleIndex = 0;
  let p;
  
  function preload(){
    //testImage = loadImage('p0.png');
    //testImage2 = loadImage('p1.png');
    for (let i = 0; i < imgNum; i++){
      p = loadImage('p' + i + '.png');
      imgArr.push(p);
    }
    
  }
  function setup() {
    createCanvas(500, 500, WEBGL);
    wsnum = 10;
    hsnum = 10;
    testLine = new Line(100.0, new p5.Vector(1.0, 1.0));
    //console.log(testImage);
    //testImage.resize(width, height);
    //testImage2.resize(width, height);
    imgArr.forEach(p=>p.resize(width, height));
    for (let j = 0; j < height; j += hsnum){
      for (let i = 0; i < width; i += wsnum){
        let temp = new Line(50.0, new p5.Vector(i, j));
        //console.log(testImage.get(i, j));
        //temp.setColor(testImage); 
        //temp.setColor(testImage2);
        imgArr.forEach(p=>temp.setColor(p));
        pLineArr.push(temp); 
       }
    }
  }
  
  function draw() {
    //rectMode(CENTER);
    background(0);
    //rotateX(frameCount * 0.01);
    noStroke();
    push();
    translate(-width * 0.5, -height * 0.5);
    for (let i = 0; i < pLineArr.length; i++){
       pLineArr[i].display(gscaleIndex); 
    }
    pop();
    //image(testImage, 0, 0);
  }
  
  function keyPressed(){
      if (key == 'n') {
        gscaleIndex++;
        pLineArr.forEach(p=>p.morph = true);
        if (gscaleIndex == imgNum) gscaleIndex = 0;
      }
  }