let osc1;
let env;
let oscArr = [];
let oscNum = 10;
let allArr = [220, 110, 55, 164.81, 329.63, 82.41, 277.18, 138.59, 69.30];

let noteArr = [];
let currentNote = 0;
let typeArr = ['sine', 'triangle', 'sawtooth', 'square'];
let freqModeTextArr = ['KEY', 'SEQ', '---'];

const lowestFreqArr = [16.35, 17.32, 18.35, 19.45, 20.60, 21.83, 23.12, 24.50, 25.96, 27.50, 29.14, 30.87, 32.70]; //c0 ~ c1
let allNoteArr = [];
let octaveNum;
let defaultKeyboardArr = [];
let font;
let fontSize;

let bgpg;

let s;
let s2;
let synthArr = [];
let synthNum = 1;
let seqArr = [];
let keyboard;
let testSeq;
let shd;

let ADSRPannelArr = [];
function preload(){
  font = loadFont('dos.ttf');
  shd = loadShader('Shader.vert', 'Shader.frag');
}
function setup() {

  createCanvas(1200, 675);
  bgpg = createGraphics(width, height, WEBGL);
 // testSeq = new NoteSequencer(100, 300, 100, 300);
   octaveNum = 9;
  for (let i = 0; i < octaveNum; i++){
    let octave = [];
    for (let j = 0; j < 12; j++){
      octave.push(lowestFreqArr[j] * pow(2.0, float(i)));
    }
    allNoteArr.push(octave);
  }

  console.log(allNoteArr);
  lowestFreqArr.forEach(function (e){
    defaultKeyboardArr.push(e * pow(2.0, 3.0));
  });
  console.log(defaultKeyboardArr);

  // adsr pannel
  let w = 120;
  let h = 1.5 * w;
  for (let i = 0; i < 1; i++){
    let tp = new ADSRPannel(w, h, w, h);
    ADSRPannelArr.push(tp);
  }
  textFont(font);
  fontSize = 12;
  textSize(fontSize);
  keyboard = new KeyBoard(0, 0, 400, 100);
}
let nstep = 0.0;
function draw(){
  smooth();
  strokeWeight(1.0);

  bgpg.background(0);
  bgpg.shader(shd);
  shd.setUniform('resolution', [width, height]);
  shd.setUniform('synthNum', synthArr.length - 1);
  shd.setUniform('time', frameCount * 0.01);

  shd.setUniform('mouse', [mouseX, mouseY]);
  let fsum = 0;
  let ssum = 0;
  synthArr.forEach(function(s){
      fsum += s.freq;
      ssum += map(s.spectrum[0], -1, 1, 0, 1);
  });
  fsum /= synthArr.length;
  ssum /= synthArr.length;

  shd.setUniform('freqAvg', map(fsum, 0, 1000, 0, 1.0));
  shd.setUniform('ampAvg', ssum);
  shd.setUniform('nstep', nstep);
  nstep += 0.01;
  bgpg.rect(10, 10, 10, 10);
  image(bgpg,0, 0);

 // background(0);
  //translate(-width * 0.5, -height * 0.5);
  synthArr.forEach(s => s.displaySynth());

  keyboard.displayKeyBoard();

  synthArr.forEach(function (s){
    s.osc.connect();
    // if sequence mode
    if (s.freqButton.mode == 1) {
        s.setFreq(s.connectedSeqRef.getNoteFreq());
        if (s.envEnabled && s.connectedSeqRef.sentNewFreq) s.env.triggerAttack();
        s.connectedSeqRef.sentNewFreq = false;
    }
  })
  seqArr.forEach(seq => seq.display());

  ADSRPannelArr.forEach(p => p.display());
}
function mouseClicked(){
  synthArr.forEach(s => s.mouseC());
  seqArr.forEach(seq => seq.clicked());
  //testSeq.clicked();
}
function mousePressed(){
//s.moveSynth();
  //s2.moveSynth();
}
function mouseDragged(){
  seqArr.forEach(function(seq){
    seq.dragged();
    seq.lookForSynth(synthArr);
  });
  if (!keyboard.outlet.dragged && !SimpleSynth.outletDragged && !NoteSequencer.outletDragged){
    synthArr.forEach(s =>s.moveSynth());
    ADSRPannelArr.forEach(p => p.mDragged());
  }

  synthArr.forEach(function(s){
    if (s.outlet.dragged){
      //s.lookForSynth(synthArr)
      s.lookForADSR(ADSRPannelArr);
      s.lookForKnob(knobArr);
    }
  });
  keyboard.keyboardDragged();
  keyboard.lookForSynth(synthArr);
  //ADSRPannelArr.forEach(p => p.mDragged());
}

function mouseReleased(){
  synthArr.forEach(s => s.mouseR());
 keyboard.outletReleased();
  seqArr.forEach(seq => seq.released());
}

function mouseMoved(){

}


let atLeastOnePressed = true;
function keyPressed(){
  atLeastOnePressed = true;
  switch(key){
    case 'a':
      currentNote = 0;
      keyboard.whiteKeyArr[0].pressed = true;
      break;
    case 'w':
      currentNote = 1;
      keyboard.blackKeyArr[0].pressed = true;
      break;
    case 's':
      currentNote = 2;
      keyboard.whiteKeyArr[1].pressed = true;
      break;
    case 'e':
      currentNote = 3;
      keyboard.blackKeyArr[1].pressed = true;
      break;
    case 'd':
      currentNote = 4;
      keyboard.whiteKeyArr[2].pressed = true;
      break;
    case 'f':
      currentNote = 5;
      keyboard.whiteKeyArr[3].pressed = true;
      break;
    case 't':
      currentNote = 6;
      keyboard.blackKeyArr[3].pressed = true;
      break;
    case 'g':
      currentNote = 7;
      keyboard.whiteKeyArr[4].pressed = true;
      break;
    case 'y':
      currentNote = 8;
      keyboard.blackKeyArr[4].pressed = true;
      break;
    case 'h':
      currentNote = 9;
      keyboard.whiteKeyArr[5].pressed = true;
      break;
    case 'u':
      currentNote = 10;
      keyboard.blackKeyArr[5].pressed = true;
      break;
    case 'j':
      currentNote = 11;
      keyboard.whiteKeyArr[6].pressed = true;
      break;
    case 'k':
      currentNote = 12;
      keyboard.whiteKeyArr[7].pressed = true;
      break;
    case 'n':
      let synth = new SimpleSynth(0, random(50, 440), 'sine', mouseX, mouseY);
      synthArr.push(synth);
      break;
    case 'm':
      let t = new NoteSequencer(mouseX, mouseY, 100, 300);
      seqArr.push(t);
      break;
    default:
  }
  synthArr.forEach(function (s){
    if (s.freqButton.mode == 0 && !s.toOther){
      s.setFreq(defaultKeyboardArr[currentNote]);
    }
    s.kPressed();
    if (s.envEnabled){
      // if keyboad mode
      if (s.freqButton.mode == 0) s.env.triggerAttack();
    }
  })

  //testSeq.kPressed();
  seqArr.forEach(seq => seq.kPressed());
}
function keyReleased(){
  synthArr.forEach(function (s){
    if (s.envEnabled){
      // if keyboard mode
      if (s.freqButton.mode % 2 == 0) s.env.triggerRelease();
    }
  })
  switch(key){
    case 'a':
      currentNote = 0;
      keyboard.whiteKeyArr[0].pressed = false;
      break;
    case 'w':
      currentNote = 1;
      keyboard.blackKeyArr[0].pressed = false;
      break;
    case 's':
      currentNote = 2;
      keyboard.whiteKeyArr[1].pressed = false;
      break;
    case 'e':
      currentNote = 3;
      keyboard.blackKeyArr[1].pressed = false;
      break;
    case 'd':
      currentNote = 4;
      keyboard.whiteKeyArr[2].pressed = false;
      break;
    case 'f':
      currentNote = 5;
      keyboard.whiteKeyArr[3].pressed = false;
      break;
    case 't':
      currentNote = 6;
      keyboard.blackKeyArr[3].pressed = false;
      break;
    case 'g':
      currentNote = 7;
      keyboard.whiteKeyArr[4].pressed = false;
      break;
    case 'y':
      currentNote = 8;
      keyboard.blackKeyArr[4].pressed = false;
      break;
    case 'h':
      currentNote = 9;
      keyboard.whiteKeyArr[5].pressed = false;
      break;
    case 'u':
      currentNote = 10;
      keyboard.blackKeyArr[5].pressed = false;
      break;
    case 'j':
      currentNote = 11;
      keyboard.whiteKeyArr[6].pressed = false;
      break;
    case 'k':
      currentNote = 12;
      keyboard.whiteKeyArr[7].pressed = false;
      break;
  }
}
