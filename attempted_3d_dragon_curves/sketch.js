let directionArrXY = [
    [1, 0, 0],
    [0, 1, 0],
    [-1, 0, 0],
    [0, -1, 0],
  ];
  
  let directionArrYZ = [
    [0, 1, 0],
    [0, 0, 1],
    [0, -1, 0],
    [0, 0, -1],
  ];
  
  let directionArrZX = [
    [0, 0, 1],
    [1, 0, 0],
    [0, 0, -1],
    [-1, 0, 0],
  ];
  
  class Curve{
    constructor(initString, genNum, width, pos){
      this.initString = initString;
      this.genNum = genNum;
      this.displayIndex = 0;
      this.xylineDirIndex = 0;
      this.yzlineDirIndex = 0;
      this.zxlineDirIndex = 0;
      this.currentDir = createVector(directionArrXY[this.xylineDirIndex][0], 
                                     directionArrXY[this.xylineDirIndex][1],
                                     directionArrXY[this.xylineDirIndex][2]);
      this.lineWidth = width;
      this.initPos = createVector(pos.x, pos.y, pos.z);
      this.p0 = createVector(pos.x, pos.y, pos.z);
      this.p1 = this.p0.copy().add(this.currentDir.mult(this.lineWidth));
      //console.log(this.p0 + " " + this.p1);
      this.color = color(255, 0, 0);
      this.lineVecArr = [];
      this.lineVecArr.push(this.p0);
      this.lineVecArr.push(this.p1);
    }
    
    setInstructions(xNext, yNext, zNext){
      this.xn = xNext;
      this.yn = yNext;
      this.zn = zNext;
    }
    
    nextGenString(str){
      let nextStr = '';
      for (let i = 0; i < str.length; i++){
        switch(str[i]){
          case 'X':
            nextStr = nextStr.concat(this.xn);
            break;
          case 'Y':
            nextStr = nextStr.concat(this.yn);
            break;
          case 'Z':
            nextStr = nextStr.concat(this.zn);
            break;
          default:
            nextStr = nextStr.concat(str[i]);
        }
      }
      return nextStr;
    }
    
    generateFinalString(){
      for (let i = 0; i < this.genNum; i++){
        this.initString = this.nextGenString(this.initString);
      }
    }
    
    manageIndex(index){
      if (index < 0) index = 3;
      else index %= 4;
    }
    displayByIndex(pg){
      pg.strokeWeight(10);
      //stroke(random(0, 255),random(0, 255), 100);
      for (let i = 0; i < this.lineVecArr.length - 1; i++){
        pg.line(this.lineVecArr[i].x, this.lineVecArr[i].y, this.lineVecArr[i].z,
             this.lineVecArr[i + 1].x, this.lineVecArr[i + 1].y, this.lineVecArr[i + 1].z);
      }
      
      switch(this.initString[this.displayIndex++]){
        // move forward
        case 'F':
          //console.log(this.p0 + " " + this.p1);
          //stroke(this.color);
          //line(this.p0.x, this.p0.y, this.p0.z,
          //    this.p1.x, this.p1.y, this.p1.z);
          this.p0 = this.p1;
          this.lineVecArr.push(this.p1);
          //console.log(this.p0);
          break;
        // rotate 90 deg ccw (xy)
        case '+':
         // this.color = color(0, 255, 0);
          this.xylineDirIndex++;
          this.xylineDirIndex %= 4;
          this.currentDir = createVector(directionArrXY[this.xylineDirIndex][0], 
                                     directionArrXY[this.xylineDirIndex][1],
                                     directionArrXY[this.xylineDirIndex][2]);
          this.p1 = this.p0.copy().add(this.currentDir.mult(this.lineWidth));
          //this.lineVecArr.push(this.p1);
          break;
        // rotate 90 deg cw (xy)
        case '-':
        //  this.color = color(0, 0, 255);
          this.xylineDirIndex--;
          if(this.xylineDirIndex < 0) this.xylineDirIndex = 3; 
          this.currentDir = createVector(directionArrXY[this.xylineDirIndex][0], 
                                     directionArrXY[this.xylineDirIndex][1],
                                     directionArrXY[this.xylineDirIndex][2]);
          this.p1 = this.p0.copy().add(this.currentDir.mult(this.lineWidth));
          //this.lineVecArr.push(this.p1);
          break;
        // rotate 90 deg ccw (yz)
        case '*':
         // this.color = color(0, 255, 0);
          this.yzlineDirIndex++;
          this.yzlineDirIndex %= 4;
          this.manageIndex(this.yzlineDirIndex);
          this.currentDir = createVector(directionArrYZ[this.yzlineDirIndex][0], 
                                     directionArrYZ[this.yzlineDirIndex][1],
                                     directionArrYZ[this.yzlineDirIndex][2]);
          this.p1 = this.p0.copy().add(this.currentDir.mult(this.lineWidth));
          //this.lineVecArr.push(this.p1);
          break;
        // rotate 90 deg cw (yz)
        case '/':
         // this.color = color(0, 0, 255);
          this.yzlineDirIndex--;
          if(this.yzlineDirIndex < 0) this.yzlineDirIndex = 3; 
          this.manageIndex(this.yzlineDirIndex);
          this.currentDir = createVector(directionArrYZ[this.yzlineDirIndex][0], 
                                     directionArrYZ[this.yzlineDirIndex][1],
                                     directionArrYZ[this.yzlineDirIndex][2]);
          this.p1 = this.p0.copy().add(this.currentDir.mult(this.lineWidth));
          //this.lineVecArr.push(this.p1);
          break;
        // rotate 90 deg ccw (zx)
        case '?':
         // this.color = color(0, 255, 0);
          this.zxlineDirIndex++;
          this.zxlineDirIndex %= 4;
          this.manageIndex(this.yxlineDirIndex);
          this.currentDir = createVector(directionArrZX[this.zxlineDirIndex][0], 
                                     directionArrZX[this.zxlineDirIndex][1],
                                     directionArrZX[this.zxlineDirIndex][2]);
          this.p1 = this.p0.copy().add(this.currentDir.mult(this.lineWidth));
         // this.lineVecArr.push(this.p1);
          break;  
        // rotate 90 deg cw (zx)
        case '!':
          //this.color = color(0, 0, 255);
          this.zxlineDirIndex--;
          if(this.zxlineDirIndex < 0) this.zxlineDirIndex = 3; 
          this.manageIndex(this.zxlineDirIndex);
          this.currentDir = createVector(directionArrZX[this.zxlineDirIndex][0], 
                                     directionArrZX[this.zxlineDirIndex][1],
                                     directionArrZX[this.zxlineDirIndex][2]);
          this.p1 = this.p0.copy().add(this.currentDir.mult(this.lineWidth));
          //this.lineVecArr.push(this.p1);
          break;
      }
      
      
    }
    
    
    displayWhole(){
      
    }
  }
  let tc;
  let curveArr = [];
  let operators = ['+', '-', '*', '/', '?', '!'];
  let operands = ['X', 'Y', 'Z', 'FX', 'FY', 'FZ', 'XF', 'YF', 'ZF'];
  let gap;
  let depth;
  let rowNum;
  let lineSize;
  let font;
  let ms; // mainsketch
  let shd;
  let gl;
  function generateRules(){
    let str = '';
    let opt1 = floor(random(0, 6)), opt2 = floor(random(0, 6));
    let oprnd1 = floor(random(0, 9)), oprnd2 = floor(random(0, 9)), oprnd3 = floor(random(0, 9));
    str += operands[oprnd1] + operators[opt1] + operands[oprnd2] + operators[opt2] + operands[oprnd3];
    //console.log(str);
    return str;
   
  }
  function preload(){
     ms = createGraphics(600, 600, WEBGL);
    ms.font = loadFont('monoid.ttf');
    shd = loadShader('SketchShader.vert', 'SketchShader.frag');
  }
  function setup() {
    createCanvas(500, 500, WEBGL);
   
    
    gap = 400;
    depth = 100;
    lineSize = 90;
    rowNum = 8;
    for (let i = 0; i < rowNum; i++){
      let lc = new Curve(operands[floor(random(0, 9))], floor(random(2, 7)), lineSize, new p5.Vector(gap, depth, -gap * i));
      let rc = new Curve(operands[floor(random(0, 9))], floor(random(2, 7)), lineSize, new p5.Vector(-gap, depth, -gap * i));
      lc.setInstructions(generateRules(), generateRules(), generateRules());
      lc.generateFinalString();
      
      rc.setInstructions(generateRules(), generateRules(), generateRules());
      rc.generateFinalString();
      
      curveArr.push(lc);
      curveArr.push(rc);
    }
    
    ms.textFont(ms.font);
    ms.textSize(12);
  }
  
  function draw() {
   
    let z = 600 - frameCount * 5;
    //if (z < 0) z *= -1;
    //console.log(z);
    if (z % 300 == 0){
      curveArr.splice(0, 2);
      
      let lc = new Curve(operands[floor(random(0, 9))], floor(random(2, 7)), lineSize, new p5.Vector(gap, depth, z - gap * rowNum));
      let rc = new Curve(operands[floor(random(0, 9))], floor(random(2, 7)), lineSize, new p5.Vector(-gap, depth, z - gap * rowNum));
      lc.setInstructions(generateRules(), generateRules(), generateRules());
      lc.generateFinalString();
      
      rc.setInstructions(generateRules(), generateRules(), generateRules());
      rc.generateFinalString();
      
      curveArr.push(lc);
      curveArr.push(rc);
      
    
    }
    
    ms.camera(0, 0, z, 0, 0, z - 400, 0, 1, 0);
    
    ms.background(255);
   
    
    curveArr.forEach(a=>a.displayByIndex(ms));
    
   
    image(ms, -width * 0.5, -height * 0.5);
    
   
    // ooooooooooooooooooohhhhh shit
    ms.resetMatrix();
    ms._renderer._update();
    ms.fill(0);
    ms.push();
    ms.translate(0, 0, z - 400);
    ms.text("NEW RULES\nX->" + curveArr[curveArr.length - 1].xn + '\nY->' + 
         curveArr[curveArr.length - 1].yn + '\nZ->' + 
         curveArr[curveArr.length - 1].zn, -200, -200);
    ms.text("NEW RULES\nX->" + curveArr[curveArr.length - 1].xn + '\nY->' + 
         curveArr[curveArr.length - 1].yn + '\nZ->' + 
         curveArr[curveArr.length - 1].zn, 120, -200);
    ms.pop();
    
    shader(shd);
    shd.setUniform('resolution', [width, height]);
    shd.setUniform('time', frameCount);
    shd.setUniform('tex', ms);
    rect(0, 0, 1, 1);
    
  }