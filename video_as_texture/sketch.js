class Quad{
    constructor(cx, cy, width, height, id, offset){
      this.cx = cx; this.cy = cy; // center coordinates. z = 0
      this.w = width; this.h = height;
      this.vertexcoords = [
        this.cx - this.w * 0.5, this.cy - this.h * 0.5, // 0
        this.cx + this.w * 0.5, this.cy - this.h * 0.5, // 1
        this.cx - this.w * 0.5, this.cy + this.h * 0.5, // 2
        this.cx + this.w * 0.5, this.cy + this.h * 0.5  // 3
      ];
      this.vertIndices = [0, 1, 3, 3, 2, 0]; // order in which to create triangle fans
      this.id = id;
      this.offset = 4 * offset; //  keep in mind that each pixel is a size 4 array
    }
    // x, y: uv coords of the top left vertex
    // dx : 1 / wnum, dy : 1 / hnum
    setuvcoords(x, y, dx, dy){
      this.uvcoords = [
        x, y, // 0
        x + dx, y, // 1
        x, y - dy,  // 2
        x + dx, y - dy // 3
      ];
      //console.log(this.uvcoords);
    }
    
    display(){
     // beginShape();
      //stroke(video.get(map(this.cx, -twidth * 0.5, twidth * 0.5, 0, video.width), 
      //                map(this.cy, -theight * 0.5, theight * 0.5, 0, video.height)));
      
      let r = shdTex.pixels[this.offset];
      let g = shdTex.pixels[this.offset + 1];
      let b = shdTex.pixels[this.offset + 2];
      //console.log(r + ' ' + g + ' ' + b);
      let z = (r + g + b) / 3.0;
      //if (z > mouseY) z = 0;
      //z = pow(z, 1.2);
      //console.log(z);
      for (let i = 0; i < 6; i++){
        let index = this.vertIndices[i];
        //mainSketch.stroke(200 + 50 * sin(frameCount * 0.1 + this.id))
        //mainSketch.strokeWeight(0.5);
        mainSketch.vertex(this.vertexcoords[2 * index] , this.vertexcoords[2 * index + 1],  z,
               this.uvcoords[2 * index], this.uvcoords[2 * index + 1]);
      }
      //endShape(CLOSE);
    }
    
  }
  
  let video;
  let shd;
  let shdTex;
  let shd2;
  let gl;
  let tq;
  let wnum, hnum;
  let quadw, quadh;
  let quadArr = [];
  let wdiv, hdiv;
  let twidth, theight;
  let mainSketch;
  let font;
  let fontSize;
  let rgbDiff;
  let shadeText;
  let modes = ['RANDOM', 'SINE', 'CONSTANT'];
  let bloomOn;
  let modeCount;
  let bloomStrength;
  let bloomIntensity;
  let distort;
  function preload(){
    video = createVideo('fingers.mov');
    shd2 = loadShader('test.vert', 'test.frag');
    
    shd = loadShader('VidTest.vert', 'VidTest.frag');
    font = loadFont('helveticabold.ttf');
    fontSize = 15;
    mainSketch = createGraphics(600, 600, WEBGL);
    mainSketch.font = loadFont('helveticabold.ttf');
    mainSketch.textFont(font);
    mainSketch.textSize(fontSize);
  }
  function setup() {
    createCanvas(600, 600, WEBGL);
    shdTex = createGraphics(600, 600, WEBGL);
    
    wnum = 75;
    hnum = 75;
    quadw = 8;
    quadh = 8;
    wdiv = 1.0 / wnum;
    hdiv = 1.0 / hnum;
    twidth = wnum * quadw; //  total width
    theight = hnum * quadh; // total height
    let offsetWidth = shdTex.width / wnum;
    let offsetHeight = shdTex.height / hnum;
    for (let h = 0; h < hnum; h++){
      for (let w = 0; w < wnum; w++){
        let q = new Quad(-twidth * 0.5 + quadw * w, -theight * 0.5 + quadh * h,
                         quadw, quadh, w + wnum * h, offsetWidth * w + h * shdTex.width * offsetHeight);
        q.setuvcoords(0.0 + wdiv * w, 0.0 + hdiv * h, wdiv, hdiv);
        //console.log(offsetWidth * w + h * shdTex.width * offsetHeight);
        quadArr.push(q);
      }
    }
  
  
    video.loop();
    video.play();
    video.hide();
    
    
    textFont(font);
    textSize(fontSize);
    rgbDiff = 2.0;
    shadeText = false;
    modeCount = 0;
    bloomOn = false;
    bloomStrength = 10.0;
    bloomIntensity = 1.0;
    distort = 0.01;
  }
  
  function draw() {
  
   // texture(video);
    //tq.display();
    shdTex.loadPixels();
    //let z = 700;
    mainSketch.clear();
    mainSketch.background(0, 10);
    //mainSketch.camera(0, 0, z, 0, 0, z - 400, 0, 1, 0);
    mainSketch.push();
    mainSketch.translate(0, 0, -400);
    //mainSketch.rotateX(frameCount * 0.01);
    mainSketch.rotateY(-frameCount * 0.03);
    mainSketch.rotateZ(frameCount * 0.01);
    
    //push();
    //noStroke();
    
    shdTex.background(0);
    shdTex.shader(shd);
    shd.setUniform('videoTex', video);
    shd.setUniform('resolution', [width, height]);
    shd.setUniform('time', frameCount);
    shdTex.rect(0, 0, width, height);
    
    //console.log(video.get(10, 10));
    //image(shdTex, 100, 100);
    // shdTex : modified video
    mainSketch.texture(shdTex);
    
    mainSketch.beginShape(QUADS);
    quadArr.forEach(q => q.display());
    mainSketch.endShape();
    mainSketch.pop();
    //pop();
    //image(mainSketch, -300, -300);
    
    let diff;
    switch(modeCount){
      case 0:
        diff = random(-rgbDiff, rgbDiff);
        break;
      case 1:
        diff = rgbDiff * sin(frameCount * 0.1);
        break;
      case 2:
        diff = rgbDiff;
    }
    
    if (shadeText){
      bloomOn = false;
      mainSketch.text("RGB DIFF MAX: " + rgbDiff, -width * 0.5 + fontSize * 0.5, -height * 0.5 +fontSize);
      mainSketch.text("RGB DIFF: " + diff, -width * 0.5 + fontSize * 0.5, -height * 0.5 +fontSize * 2);
      mainSketch.text("RGB DIFF MODE: " + modes[modeCount], -width * 0.5 + fontSize * 0.5, -height * 0.5 +fontSize * 3);
       mainSketch.text("SHADE TEXT: ON" , -width * 0.5 + fontSize * 0.5, -height * 0.5 +fontSize * 4);
      mainSketch.text("BLOOM: " + (bloomOn?"ON":"OFF") , -width * 0.5 + fontSize * 0.5, -height * 0.5 +fontSize * 5);
      mainSketch.text("BLOOM STRENGTH: " + bloomStrength , -width * 0.5 + fontSize * 0.5, -height * 0.5 +fontSize * 6);
      mainSketch.text("BLOOM INTENSITY: " + bloomIntensity.toFixed(2) , -width * 0.5 + fontSize * 0.5, -height * 0.5 +fontSize * 7);
      mainSketch.text("DISTORT: " + distort.toFixed(3) , -width * 0.5 + fontSize * 0.5, -height * 0.5 +fontSize * 8);
    }
    mainSketch.resetMatrix();
    mainSketch._renderer._update();
    
    // post process mainSketch
    
    
    shader(shd2);
    shd2.setUniform('tex', mainSketch);
    shd2.setUniform('time', frameCount);
    shd2.setUniform('resolution', [width, height]);
    shd2.setUniform('rgbDiff', diff);
    shd2.setUniform('bloomOn', bloomOn);
    shd2.setUniform('bloomStrength', bloomStrength);
    shd2.setUniform('bloomIntensity', 2.0 - bloomIntensity);
    shd2.setUniform('distort', distort);
    rect(0, 0, 10, 10);
    _renderer._update(); //  text won't show without this
    
  
    if (!shadeText){
      text("RGB DIFF MAX: " + rgbDiff, -width * 0.5 + fontSize * 0.5, -height * 0.5 +fontSize);
      text("RGB DIFF: " + diff, -width * 0.5 + fontSize * 0.5, -height * 0.5 +fontSize * 2);
      text("RGB DIFF MODE: " + modes[modeCount], -width * 0.5 + fontSize * 0.5, -height * 0.5 +fontSize * 3);
      text("SHADE TEXT: OFF" , -width * 0.5 + fontSize * 0.5, -height * 0.5 +fontSize * 4);
      text("BLOOM: " + (bloomOn?"ON":"OFF") , -width * 0.5 + fontSize * 0.5, -height * 0.5 +fontSize * 5);
      text("BLOOM STRENGTH: " + bloomStrength , -width * 0.5 + fontSize * 0.5, -height * 0.5 +fontSize * 6);
      text("BLOOM INTENSITY: " + bloomIntensity.toFixed(2) , -width * 0.5 + fontSize * 0.5, -height * 0.5 +fontSize * 7);
      text("DISTORTION: " + distort.toFixed(3) , -width * 0.5 + fontSize * 0.5, -height * 0.5 +fontSize * 8);
    }
  }
  
  function keyPressed(){
    switch(key){
      case 'w':
        rgbDiff += 1.0;
        rgbDiff = abs(rgbDiff);
        break;
      case 's':
        rgbDiff -= 1.0;
        rgbDiff = abs(rgbDiff);
        break;
      case 't':
        shadeText = !shadeText;
        break;
      case 'm':
        modeCount += 1;
        modeCount %= 3; 
        break;
      case 'b':
        bloomOn = !bloomOn;
        break;
      case 'q':
        distort -= 0.01;
        break;
      case 'e':
        distort += 0.01;
        break;
    }
    switch (keyCode){
        case UP_ARROW:
        bloomStrength += 1.0;
        break;
      case DOWN_ARROW:
        bloomStrength -= 1.0;
        break;
      case LEFT_ARROW:
        bloomIntensity -= 0.1;
        break;
      case RIGHT_ARROW:
        bloomIntensity += 0.1;
        break;
    }
  }