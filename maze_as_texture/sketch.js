var pg;
class DisjointSets{
  constructor(numElem){
    this.numElem = numElem;  
    this.set = [];
    for (let i = 0; i < this.numElem; i++){
      this.set.push(-1);
    }
  }
  
  unionSets(root1, root2){
     this.set[root2] = root1; 
  }
  
  find(x){
    if (this.set[x] < 0) return x;
    else return find(this.set[x]);
  }
  
 
  isSingleSet(){
     for (let i = 0; i < this.set.length; i++){
       if (this.set[i] < 0) return false;
     }
    return true;
  }
}

class Wall{
  constructor(mode){
    this.mode = mode; // 0: vert, 1: hori    
    this.r = 0;
    this.color = color(this.r, this.r, this.r);
    this.knockedDown = false;
  }
  // dim is a p5.vector instance
  setDim(dim){this.dim = dim;}
  // pos is also a p5.vector instance
  setPos(pos){this.pos = pos;}
  setAdjNum(x, y){this.a1 = x; this.a2 = y;}
  decrementDim(){
    this.color.r += 0.1;
    //this.dim.y -= 0.1;
  }
  display(pg){
    pg.rectMode(CENTER);

    //shader(bgShader);
    if (this.knockedDown) {
      this.r += 5;
      this.color = color(this.r, 255, this.r);
    }
    pg.noStroke();
    pg.noFill();
    pg.fill(this.color);
    pg.rect(this.pos.x, this.pos.y, this.dim.x, this.dim.y);
  }
  
  display2(){
    rectMode(CENTER);
    noStroke();
    //shader(bgShader);
    if (this.knockedDown) {
      this.r += 5;
      this.color = color(this.r, 255, this.r);
    }
    fill(this.color);
    push();
    translate(-width * 0.5, -height * 0.5);
    rect(this.pos.x, this.pos.y, this.dim.x, this.dim.y);
    pop();
  }
  disappear(){
    this.knockedDown = true;
  }
 

}

var dim;
var numPerRow;
var ndiv;
var mazeWidth;
var wallWidth;
var wallArr = [];
var validIndex; // index at which the first valid wall is stored in wallArr 
var disjSets;
var indexArr = [];
var zDist;
var zInc = false;
var zDec = false;

var gl;

function setup() {

  createCanvas(600, 600, WEBGL);
 

  pg = createGraphics(600, 600);
  mazeWidth = width;
  numPerRow = 30;
  ndiv = mazeWidth / numPerRow;
  wallWidth = 5;
  disjSets = new DisjointSets(numPerRow * numPerRow);
  var horiDim = createVector(ndiv, wallWidth);
  var vertDim = createVector(wallWidth, ndiv);
  // hori dummy wallshis.r += 5;
  for (let i = 0; i < numPerRow; i++){
    var temp1 = new Wall(1);
    var temp2 = new Wall(1);
    temp1.setPos(new p5.Vector((2 * i + 1) * ndiv * 0.5, 0));
    temp1.setDim(horiDim);
    temp2.setPos(new p5.Vector((2 * i + 1) * ndiv * 0.5, mazeWidth));
    temp2.setDim(horiDim);
    wallArr.push(temp1);
    wallArr.push(temp2);
  }
  
  // vert dummy walls
  for (let i = 0; i < numPerRow; i++){
    var temp3 = new Wall(0);
    var temp4 = new Wall(0);
    temp3.setPos(new p5.Vector(0, (2 * i + 1) * ndiv * 0.5));
    temp3.setDim(vertDim);
    temp4.setPos(new p5.Vector(mazeWidth, (2 * i + 1) * ndiv * 0.5));
    temp4.setDim(vertDim);
    wallArr.push(temp3);
    wallArr.push(temp4);
  }
  
  validIndex = wallArr.length;
  // vert walls
  for (let i = 0, h = 1; i < numPerRow; i++, h += 2){
     for (let a = i * numPerRow, w = 1; a < numPerRow * (i + 1) - 1; a++, w++){
       var temp5 = new Wall(0);
       temp5.setPos(new p5.Vector(ndiv * w, ndiv * 0.5 * h));
       temp5.setDim(vertDim);
       temp5.setAdjNum(a, a + 1);
       wallArr.push(temp5);
     }
  }
  
  // hori wallshis.r += 5;
  let indexCount = 0;
  for (let i = 0; i <= Math.pow(numPerRow, 2) - numPerRow - 1; i++){
    var temp6 = new Wall(1); 
    temp6.setAdjNum(i, i + numPerRow);
    temp6.setDim(horiDim);
    wallArr.push(temp6);
    if (i == 0) indexCount = wallArr.length - 1;
  }
  
  let hCount = 0;
  for (let h = 0; h < numPerRow - 1; h++){
     for (let w = 0; w < numPerRow; w++){
        wallArr[indexCount + hCount].setPos(new p5.Vector((2 * w + 1) * ndiv * 0.5, ndiv * (h + 1))); 
        hCount++;
     }
  }
  
  // init indexArr
  for (let i = validIndex; i < wallArr.length; i++) indexArr.push(i);
  
  zDist = -width * 0.5;
  
  gl = this._renderer.GL;
  gl.disable(gl.DEPTH_TEST);
}

function draw() {
  //var gl = document.getElementById('defaultCanvas0').getContext('webgl');
  
  
  //shader(bgShader);
  background(255, 255, 255);
  pg.background(255, 255, 255);
  pg.noStroke();
  //console.log(wallArr.length);
  for (let i = 0; i < wallArr.length; i++){
    wallArr[i].display(pg); 
    
  }
  
  if (!disjSets.isSingleSet() && indexArr.length != 0){
      chooseRandomWall();
  }
  //disjSets.printSet();
  
  gl.disable(gl.DEPTH_TEST);
  push();
  translate(-width * 0.5, -height * 0.5);
  image(pg, 0, 0, width, height);
  pop();
  
  gl.enable(gl.DEPTH_TEST);
  push();
  translate(0, 0, zDist);
  rotateY(frameCount * 0.01);
  push();
  rotateX(frameCount * 0.01);
  translate(-width * 0.5, -height * 0.5, width * 0.5);
  image(pg, 0, 0, width, height);
  pop();
  
  push();
  rotateX(frameCount * 0.01 + HALF_PI);
  translate(-width * 0.5, -height * 0.5, width * 0.5);
  image(pg, 0, 0, width, height);
  pop();
  
  push();
  rotateX(frameCount * 0.01 + PI);
  translate(-width * 0.5, -height * 0.5, width * 0.5);
  image(pg, 0, 0, width, height);
  pop();
  
  push();
  rotateX(frameCount * 0.01 + HALF_PI * 3.0);
  translate(-width * 0.5, -height * 0.5, width * 0.5);
  image(pg, 0, 0, width, height);
  pop();
  
  push();
  rotateY(HALF_PI);
  rotateZ(frameCount * 0.01);
  translate(-width * 0.5, -height * 0.5, -width * 0.5);
  //rotateZ(frameCount * 0.01);
  image(pg, 0, 0, width, height);
  pop();
  
  push();
  rotateY(HALF_PI * 3.0);
  rotateZ(-frameCount * 0.01);
  translate(-width * 0.5, -height * 0.5, -width * 0.5);
  //rotateZ(frameCount * 0.01);
  image(pg, 0, 0, width, height);
  pop();
  pop();
  
  
  
  if (zDec) zDist -= 10;
  if (zInc) zDist += 10;
}

function chooseRandomWall(){
  let r = int(random(0, indexArr.length)); 
  let ri = indexArr[r];
  //printIndexArr();
  if(disjSets.find(wallArr[ri].a1) != disjSets.find(wallArr[ri].a2)){     
    disjSets.unionSets(wallArr[ri].a1, wallArr[ri].a2);
    wallArr[ri].disappear();
    if (indexArr.length != 0) indexArr.splice(r, 1);
  }
}

function printIndexArr(){
  //console.log("INDEX");
   for (let i = 0; i < indexArr.length; i++) console.log(indexArr[i]); 
}

function keyPressed(){ 
  switch (keyCode){
    case UP_ARROW:
      zInc = true; zDec = false;
      break;
    case DOWN_ARROW:
      zInc = false; zDec = true;
      break;
    case 32:
      zInc = false; zDec = false;
      break;
  }
}

/*
function keyReleased(){
  switch (keyCode){
    case UP_ARROW:
      zInc = false; zDec = false;
      break;
    case DOWN_ARROW:
      zInc = false; zDec = false;
      break;
  }
}

*/