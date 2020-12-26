class KeyBoard{
  constructor(posx, posy, width, height){
    this.posx = posx;
    this.posy = posy;
    this.width = width;
    this.height = height;

    this.whiteKeyArr = [];
    this.wsposx = this.posx + this.width * 0.1; // white keys starting position x
    this.wsposy = this.posy + this.height * 0.25; // white keys starting position y
    this.whiteKeyWidth = this.width * 0.1;
    this.whiteKeyHeight = this.height * 0.75;
    for (let i = 0; i < 8; i++){
      this.whiteKeyArr[i]  = {
        x : this.wsposx + this.whiteKeyWidth * i,
        y : this.wsposy,
        pressed : false
      };
    }

    this.blackKeyArr = [];
    this.bsposx = this.wsposx + this.whiteKeyWidth * 0.5;
    this.bsposy = this.wsposy;
    this.blackKeyWidth = this.whiteKeyWidth;
    this.blackKeyHeight = this.whiteKeyHeight * 0.5;
    for (let i = 0; i < 7; i++){
      if (i == 2 || i == 6) continue;
      this.blackKeyArr[i] = {
        x : this.bsposx + this.blackKeyWidth * i,
        y : this.bsposy,
        pressed : false
      }
    }

    this.outlet = {
      x : this.posx + this.width * 0.05,
      y : this.posy + this.height * 0.5,
      radius : 20,
      dragged : false
    }
    this.connectedSynthArr = [];
  }

  displayKeyBoard(){
    // keyboard
    stroke(255);
    rect(this.posx, this.posy, this.width, this.height);
    // keys
    let wkw = this.whiteKeyWidth;
    let wkh = this.whiteKeyHeight;
    this.whiteKeyArr.forEach(function(k){
      k.pressed ? fill(100) : noFill();
      rect(k.x, k.y, wkw, wkh);
    });
    fill(255);
    let bkw = this.blackKeyWidth;
    let bkh = this.blackKeyHeight;
    this.blackKeyArr.forEach(function(k) {
      k.pressed ? fill(100) : fill(255);
      rect(k.x, k.y, bkw, bkh);
    });
    // cable outlet
    noFill();
    circle(this.outlet.x, this.outlet.y, this.outlet.radius);
    if (this.outlet.dragged){
      line(mouseX, mouseY, this.outlet.x, this.outlet.y);
    }
    this.connectedSynthArr.forEach(s => line(this.outlet.x, this.outlet.y, s.inputArea.x, s.inputArea.y));
    noFill();
  }
  isInsideArea(x, y, w, h, mx, my){
    if (mx > x && mx < x + w && my > y && my < y + h) return true;
    else return false;
  }

  lookForSynth(synthArr){
    if (this.outlet.dragged){
      let arr = this.connectedSynthArr;
      synthArr.forEach(function (s){
        if (dist(s.inputArea.x, s.inputArea.y, mouseX, mouseY) < s.inputArea.radius && s.freqButton.mode != 0){
          s.freqButton.mode = 0;
          s.osc.connect();
          arr.push(s);

        }
      });
    }
  }
  outletReleased(){
    this.outlet.dragged = false;
  }
  keyboardDragged(){
    if (this.isInsideArea(this.posx, this.posy, this.width, this.height, mouseX, mouseY)){
      if (dist(this.outlet.x, this.outlet.y, mouseX, mouseY) < this.outlet.radius){
        this.outlet.dragged = true;
      }
      else {
        if (!this.outlet.dragged){
        this.wsposx = this.posx + this.width * 0.1; // white keys starting position x
        this.wsposy = this.posy + this.height * 0.25; // white keys starting position y
        this.posx = mouseX - this.width * 0.5;
        this.posy = mouseY - this.height * 0.5;
        for (let i = 0; i < 8; i++){
          this.whiteKeyArr[i]  = {
            x : this.wsposx + this.whiteKeyWidth * i,
            y : this.wsposy
          };
        }
        this.bsposx = this.wsposx + this.whiteKeyWidth * 0.5;
        this.bsposy = this.wsposy;
        for (let i = 0; i < 7; i++){
          if (i == 2 || i == 6) continue;
          this.blackKeyArr[i] = {
            x : this.bsposx + this.blackKeyWidth * i,
          y : this.bsposy
          }
      }
          this.outlet.x = this.posx + this.width * 0.05;
          this.outlet.y = this.posy + this.height * 0.5;
      }
      }
    }
  }
}
