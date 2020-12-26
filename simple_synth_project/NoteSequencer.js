class NoteSequencer{
  // allNoteArr[octaveNum][note(c ~ b)]
  /*
  each note is represented using three digits: XAB, where
  X = octave, AB: one of the twelve notes represented as as number between 0 and 11
  00: C
  01: C#/Db
  02: D
  03: D#/Eb
  04: E
  05: F
  06: F#/Gb
  07: G
  08: G#/Ab
  09: A
  10: A#/Bb
  11: B
  000 001 109 206
  */
  constructor(posx, posy, w, h){
    this.posx = posx;
    this.posy = posy;
    this.w = w;
    this.h = h;
    this.editMode = false;
    //this.noteArr = ['305', '406', '213', '201', '303', '401', '211'];
    this.noteArr = ['100', '200', '300', '100', '200', '300', '200', '400'];
    this.noteArrCopy = this.noteArr.slice(0, this.noteArr.length);
    this.noteArrIndex = 0;
    this.editIndex = null;
    this.noteStr = '';
    this.outlet = {
      x : this.posx + this.w * 0.4,
      y : this.posy,
      radius : 10,
      dragged : false
    };

    this.editButton = {
      x : this.posx - this.w * 0.4,
      y : this.posy - this.h * 0.45,
      radius : 10
    }

    this.editBPMButton = {
      x : this.posx - this.w * 0.4,
      y : this.posy + this.h * 0.45,
      radius : 10
    }
    this.connectedSynthArr = [];

    this.editBPMMode = false;
    this.bpm = 120;
    this.bpmCopy = this.bpm;
    this.bpmStr = '';
    this.nthFrame = int(3600 / this.bpm);
    this.sentNewFreq = false;
  }
  lookForSynth(synthArr){
    if (this.outlet.dragged){
      let arrRef = this.connectedSynthArr;
      let self = this;
      synthArr.forEach(function (s){
            if (dist(s.inputArea.x, s.inputArea.y, mouseX, mouseY) < s.inputArea.radius &&
                s.freqButton.mode != 1){
          s.freqButton.mode = 1;
          s.osc.connect();
          s.connectedSeqRef = self;
          arrRef.push(s);
          }
      });
    }
  }
  getNoteOctave(noteString){
    return int(Number(noteString[0]));
  }

  getNote(noteString){
    return int(Number(noteString[1] + noteString[2]));
  }

  getNoteFreq(){
    this.nthFrame = int(3600 / this.bpm);
    if (frameCount % this.nthFrame == 0){
      this.noteArrIndex++;
      this.noteArrIndex %= this.noteArr.length;
      this.sentNewFreq = true;
    }
    return allNoteArr[this.getNoteOctave(this.noteArr[this.noteArrIndex])][this.getNote(this.noteArr[this.noteArrIndex])];
  }

  display(){
    rectMode(CENTER);
    noFill();
    stroke(255);
    rect(this.posx, this.posy, this.w, this.h);

    // notes
    let nw = this.w * 0.6; // width of each note block
    let nh = this.h * 0.8 / float(this.noteArr.length); //  height of each note block
    let sx = this.posx; // starting x
    let sy = this.posy - this.h * 0.5 + 1.5 * nh; // starting y
    textAlign(CENTER);
    for (let i = 0; i < this.noteArr.length; i++){
      this.noteArrIndex == i ? fill(60) : noFill();
      rect(sx, sy + nh * i, nw, nh);
      fill(255);
      text(this.noteArrCopy[i], sx, sy + nh * i);
    }

    rectMode(CORNER);
    // edit button
    if (this.editMode) text("EDIT", this.posx, this.editButton.y + fontSize * 0.5);
    this.editMode ? fill(255) : noFill();
    circle(this.editButton.x, this.editButton.y, this.editButton.radius);

    // bpm text, edit bpm button
    this.editBPMMode ? fill(255) : noFill();
    circle(this.editBPMButton.x, this.editBPMButton.y, this.editBPMButton.radius);
    this.editBPMMode ? fill(100) : fill(255);
    text(this.bpmCopy + "BPM", sx, sy + nh * 8);
    textAlign(LEFT);
    // outlet
    noFill();
    circle(this.outlet.x, this.outlet.y, this.outlet.radius);
    if (this.outlet.dragged){
      line(this.outlet.x, this.outlet.y, mouseX, mouseY);
    }
    this.connectedSynthArr.forEach(
      s => line(this.outlet.x, this.outlet.y, s.inputArea.x, s.inputArea.y)
    );

  }
  isInsideArea(x, y, w, h, mx, my){
    if (mx > x - w * 0.5 && mx < x + w * 0.5 &&
        my > y - h * 0.5 && my < y + h * 0.5) {
      return true;
    }
    else return false;
  }
  // mouseDragged
  dragged(){
    if (this.isInsideArea(this.posx, this.posy, this.w, this.h, mouseX, mouseY)){
      if (dist(this.outlet.x, this.outlet.y, mouseX, mouseY) < this.outlet.radius){
        this.outlet.dragged = true;
        NoteSequencer.outletDragged = true;
      }
      else{
        if (!this.outlet.dragged){
          this.posx = mouseX;
          this.posy = mouseY;
          this.outlet.x = this.posx + this.w * 0.4;
          this.outlet.y = this.posy;

          this.editButton.x = this.posx - this.w * 0.4;
          this.editButton.y = this.posy - this.h * 0.45;

          this.editBPMButton.x = this.posx - this.w * 0.4;
          this.editBPMButton.y = this.posy + this.h * 0.45;
        }
      }
    }
  }
  // mouseClicked
  clicked(){
    if (dist(this.editButton.x, this.editButton.y, mouseX, mouseY) < this.editButton.radius){
      this.editMode = !this.editMode;
    }
    if (dist(this.editBPMButton.x, this.editBPMButton.y, mouseX, mouseY) < this.editBPMButton.radius){
      this.editBPMMode = !this.editBPMMode;
    }
    if (this.editMode){
      let nw = this.w * 0.6; // width of each note block
      let nh = this.h * 0.8 / float(this.noteArr.length); //  height of each note block
      let sx = this.posx; // starting x
      let sy = this.posy - this.h * 0.5 + 1.5 * nh; // starting y
      for (let i = 0; i < this.noteArr.length; i++){
        if (this.isInsideArea(sx, sy + nh * i, nw, nh, mouseX, mouseY)){
          //text(this.noteArrCopy[i], sx, sy + nh * i);
          this.noteArrCopy[i] = '';
          this.editIndex = i;
        }
      }
    }
  }
  // mouseReleased
  released(){
    this.outlet.dragged = false;
    NoteSequencer.outletDragged = false;
  }
  // key pressed
  kPressed(){
    if (this.editMode){
      if (key >= 0 && key <= 9){
        this.noteStr += key;
        this.noteArrCopy[this.editIndex] = this.noteStr;
        if (this.noteStr.length == 3) {
          this.editMode = false;
          this.noteArr[this.editIndex] = this.noteStr;
          this.noteStr = '';
        }
      }
    }
    if (this.editBPMMode){
      if (key >= 0 && key <= 9){
        this.bpmStr += key;
        this.bpmCopy = Number(this.bpmStr);
        if (this.bpmStr.length == 3) {
          this.editBPMMode = false;
          this.bpm = Number(this.bpmStr);
          this.bpmStr = '';
        }
      }
    }
  }
}
NoteSequencer.outletDragged = false;
