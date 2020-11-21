let pg0, pg1, pg2, pg3, bb;
let shd0, shd1, shd2, bbshd;
let mouseVel;
let mousePosPrev, mousePosCur;

let img;
// .:-=+*#%@
let charArr = [];
let charString1 = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|(1{[?-_+~<i!lI;:,\"^`'. ";
let charString2 = " .:-=+*#%@";
let font;

let show;
let res;
let tsize;
function preload(){
  shd0 = loadShader('Shader0.vert', 'Shader0.frag');
  shd1 = loadShader('Shader1.vert', 'Shader1.frag');
  shd2 = loadShader('Shader2.vert', 'Shader2.frag');
  bbshd = loadShader('bbShader.vert', 'bbShader.frag');
  font = loadFont('Helvetica-Bold.ttf');
  
}
function setup() {
  createCanvas(600, 600, WEBGL);
  pg0 = createGraphics(width, height, WEBGL);
  pg1 = createGraphics(width, height, WEBGL);
  pg2 = createGraphics(width, height, WEBGL);
  
  bb = createGraphics(width, height, WEBGL);
  
  img = createImage(pg1.width, pg1.height);
  /*
  for (let i = charString1.length - 1; i >= 0; i--){
    charArr.push(charString1[i]);
  }
  */
  for (let i = 0; i < charString2.length; i++){
    charArr.push(charString2[i]);
  }
  tsize = 12;
  textSize(tsize);
  textFont(font);
  show = false;
  res = 60;
}

function draw() {
  
  background(0);
  orbitControl();
  /*
  var t = pg0;
  pg0 = pg1;
  pg1 = t;
  */
  pg0.background(0);
  pg0.shader(shd0);
  shd0.setUniform('resolution', [width, height]);
  shd0.setUniform('time', frameCount * 0.01);
  shd0.setUniform('backbuffer', bb);
  shd0.setUniform('mouse',[map(mouseX, 0, width, 0, 1),  map(mouseY, 0, height, 0, 1)]);
  pg0.rect(0, 0, width, height);
  pg0.resetMatrix();
  pg0._renderer._update();
 
  pg1.background(0);
  pg1.shader(shd1);
  shd1.setUniform('resolution', [width, height]);
  shd1.setUniform('time', frameCount * 0.01);
  shd1.setUniform('texture', pg0);
  shd1.setUniform('backbuffer', bb);
  shd1.setUniform('mouse',[map(mouseX, 0, width, 0, 1),  map(mouseY, 0, height, 0, 1)]);
  pg1.rect(0, 0, width, height);
  pg1.resetMatrix();
  pg1._renderer._update();
 
  if (show)image(pg1, -width * 0.5, -height * 0.5);
  
  // backbuffer 
  bb.background(0);
  bb.rotateX(PI);
  bb.image(pg0,-width * 0.5, -height * 0.5);
  bb.resetMatrix();
  bb._renderer._update();
  
  // p5.Graphics copied onto an image
  // the order is very important. also, avoid using the get() function at all costs
  img.copy(pg1, -width * 0.5, -height * 0.5, pg1.width, pg1.height, 0, 0, pg1.width, pg1.height);
  img.loadPixels();
  //image(img, - width * 0.5, -height * 0.5);
  //console.log(img.get(300, 300));
  
  // now we screw around with the image
  let num = 60;
  let div = int(width / num);
  let spos = [-width * 0.5, -height * 0.5];
  let pCount = 0;
  fill(255);
  asciiFilter(img, res, charArr);
  // update the image's pixels after the sketch has been drawn.
  img.updatePixels();
  
  
 
}

function mouseMoved(){
  mousePosPrev = mousePosCur;
  mousePosCur = [mouseX, mouseY];
  //mouseVel = 

}

// dim: number of characters per row/col, assuming numCol == numRow
function asciiFilter(image, dim, charSet){
  let num = dim;
  let div = int(width / num);
  let spos = [-width * 0.5, -height * 0.5];
  let pCount = 0;
  fill(255);
  for (let h = 0; h < num; h++){
    for (let w = 0; w < num; w++){
      pCount = h * div * width + w * div;
      let rgb = [img.pixels[pCount * 4], img.pixels[pCount * 4 + 1], img.pixels[pCount * 4 + 2]];
      let c = img.pixels[pCount * 4] + img.pixels[pCount * 4 + 1] + img.pixels[pCount * 4 + 2];
      fill(rgb[0] * 3.0, rgb[1] * 3.0, rgb[2] * 4.0);
      c = int(map(c / 1.4 , 0, 255, 0, charSet.length));
      text(charSet[c - 1], spos[0] + w * div, spos[1] + h * div);
    }
  }
}

function keyPressed(){
  switch(key){
    case 's':
      show = !show;
      break;
    case 'd':
      tsize -= 3;
      textSize(tsize);
      res += 10;
      break;
    case 'a':
      tsize += 3;
      textSize(tsize);
      res -= 10;
      break;
  }
}