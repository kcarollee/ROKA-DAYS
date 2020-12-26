class ADSRPannel{
  constructor(posx, posy, w, h){
    this.posx = posx;
    this.posy = posy;
    this.w = w;
    this.h = h;
    this.eigthWidth = this.w * 0.125;
    this.twelfthHeight = this.h / 12.0;

    var r = this.w * 0.18;
    this.minAmpKnob = new Knob(0, r, this.posx - 3 * this.eigthWidth, this.posy + 3 * this.twelfthHeight, 0, 1);
    this.maxAmpKnob = new Knob(0, r, this.posx - this.eigthWidth, this.minAmpKnob.y, 0, 1.0);
    this.attackKnob = new Knob(0, r, this.posx - 3 * this.eigthWidth, this.minAmpKnob.y + 2 * this.twelfthHeight, 0.0, 1.0);
    this.delayKnob = new Knob(0, r, this.posx - this.eigthWidth, this.attackKnob.y, 0.0, 1.0);
    this.sustainKnob = new Knob(0, r, this.posx + this.eigthWidth, this.attackKnob.y, 0.0, 1.0);
    this.releaseKnob = new Knob(0, r, this.posx + 3 * this.eigthWidth, this.attackKnob.y, 0.1, 1.0);
    this.timeRangeKnob = new Knob(0, r, this.sustainKnob.x, this.minAmpKnob.y, 0.1, 10);
    this.connectedSynthArr = [];

    this.minAmp = 0.0;
    this.maxAmp = 1.0;

    this.timeRange = 1.0; // default 1sec
    this.attackCoef = 0.1;
    this.delayCoef = 0.1;
    this.sustainCoef = 0.5; // multipled to this.maxAmp
    this.releaseCoef = 0.5;
    this.sustainTimeCoef = 1.0 - this.attackCoef - this.delayCoef - this.releaseCoef;
    this.graphBox = {
      x : this.posx,
      y : this.posy - this.twelfthHeight * 2.0,
      w : this.w
    };

    this.inputArea = {
      x : this.posx - this.w * 0.5,
      y : this.posy,
      radius : 18,
      dragged : false
    }

    let originX = this.posx - this.w * 0.5;
    let originY = this.posy + this.twelfthHeight * 2.0;
    this.p0 = [originX, originY];
    this.p1 = [originX + map(this.attackCoef * this.timeRange, 0, this.timeRange, 0, this.w),
               originY - map(this.maxAmp, 0, 1, 0, this.graphBox.w)];
    this.p2 = [this.p1[0] + map(this.delayCoef * this.timeRange, 0, this.timeRange, 0, this.w),
              originY - map(this.sustainCoef * this.maxAmp, 0, this.maxAmp, 0, this.graphBox.w)];
    this.p4 = [this.posx + this.w * 0.5, this.p0[1]];
    this.p3 = [this.p4[0] -  map(this.releaseCoef * this.timeRange, 0, this.timeRange, 0, this.w),
              this.p2[1]];

    this.attack = this.attackCoef * this.timeRange;
    this.delay = this.delayCoef * this.timeRange;
    this.sustain = this.sustainCoef * this.maxAmp;
    this.release = this.attackCoef * this.timeRange;

  }

  display(){
    rectMode(CENTER);
    rect(this.posx, this.posy, this.w, this.h);


    this.minAmpKnob.display();
    this.maxAmpKnob.display();
    this.attackKnob.display();
    this.delayKnob.display();
    this.sustainKnob.display();
    this.releaseKnob.display();
    this.timeRangeKnob.display();

    // adsr graph box
    rect(this.graphBox.x, this.graphBox.y, this.graphBox.w);
    rectMode(CORNER);

    // adsr graph
    line(this.p0[0], this.p0[1], this.p1[0], this.p1[1]);
    line(this.p1[0], this.p1[1], this.p2[0], this.p2[1]);
    line(this.p2[0], this.p2[1], this.p3[0], this.p3[1]);
    line(this.p3[0], this.p3[1], this.p4[0], this.p4[1]);

    // input area
    circle(this.inputArea.x, this.inputArea.y, this.inputArea.radius);
    this.connectedSynthArr.forEach(function(s){

    });
  }



  updatePosition(){
    this.posx = mouseX;
    this.posy = mouseY;


    this.minAmpKnob.updatePosition(this.posx - 3 * this.eigthWidth, this.posy + 3 * this.twelfthHeight);
    this.maxAmpKnob.updatePosition(this.posx - this.eigthWidth, this.minAmpKnob.y);
    this.attackKnob.updatePosition(this.posx - 3 * this.eigthWidth, this.minAmpKnob.y + 2 * this.twelfthHeight);
    this.delayKnob.updatePosition(this.posx - this.eigthWidth, this.attackKnob.y);
    this.sustainKnob.updatePosition(this.posx + this.eigthWidth, this.attackKnob.y);
    this.releaseKnob.updatePosition(this.posx + 3 * this.eigthWidth, this.attackKnob.y);
    this.timeRangeKnob.updatePosition(this.sustainKnob.x, this.minAmpKnob.y);

    this.graphBox.x = this.posx;
    this.graphBox.y = this.posy - this.twelfthHeight * 2.0;

    this.inputArea.x = this.posx - this.w * 0.5;
    this.inputArea.y = this.posy;
  }

  isInsideArea(x, y, w, h, mx, my){
    if (mx > x - w * 0.5 && mx < x + w * 0.5 &&
        my > y - h * 0.5 && my < y + h * 0.5) {
      return true;
    }
    else return false;
  }

  mDragged(){
    let attackPrev = this.attackCoef;
    let delayPrev = this.delayCoef;
    let releasePrev = this.releasePrev;


    if (this.isInsideArea(this.posx, this.posy, this.w, this.h, mouseX, mouseY)){

    if(this.minAmpKnob.mouseIsInside()){
      this.minAmpKnob.manageKnobDegree();

    }
    else if (this.maxAmpKnob.mouseIsInside()){
      this.maxAmpKnob.manageKnobDegree();
      this.maxAmp = this.maxAmpKnob.mapDegToVal();
    }
    else if (this.attackKnob.mouseIsInside()){
      this.attackKnob.manageKnobDegree();
      this.attackCoef = this.attackKnob.mapDegToVal();
    }
    else if (this.delayKnob.mouseIsInside()){
      this.delayKnob.manageKnobDegree();
      this.delayCoef = this.delayKnob.mapDegToVal();
    }
    else if (this.sustainKnob.mouseIsInside()){
      this.sustainKnob.manageKnobDegree();
      this.sustainCoef = this.sustainKnob.mapDegToVal();
    }
    else if (this.releaseKnob.mouseIsInside()){
      this.releaseKnob.manageKnobDegree();
      this.releaseCoef = this.releaseKnob.mapDegToVal();
    }
    else if (this.timeRangeKnob.mouseIsInside()){
      this.timeRangeKnob.manageKnobDegree();
      this.timeRange = this.timeRangeKnob.mapDegToVal();

    }
    else {
      this.updatePosition();
    }

    this.sustainTimeCoef = 1.0 - this.attackCoef - this.delayCoef - this.releaseCoef;

    let originX = this.posx - this.w * 0.5;
    let originY = this.posy + this.twelfthHeight * 2.0;
    this.p0 = [originX, originY];
    this.p4 = [this.posx + this.w * 0.5, this.p0[1]];
    this.p1 = [originX + map(this.attackCoef * this.timeRange, 0, this.timeRange, 0, this.w),
               originY - map(this.maxAmp, 0, 1, 0, this.graphBox.w)];
    this.p2 = [this.p1[0] + map(this.delayCoef * this.timeRange, 0, this.timeRange, 0, this.w),
              originY - map(this.sustainCoef * this.maxAmp, 0, 1, 0, this.graphBox.w)];

    this.p3 = [this.p4[0] -  map(this.releaseCoef * this.timeRange, 0, this.timeRange, 0, this.w),
              this.p2[1]];

    this.attack = this.attackCoef * this.timeRange;
    this.delay = this.delayCoef * this.timeRange;
    this.sustain = this.sustainCoef * this.maxAmp;
    this.release = this.attackCoef * this.timeRange;

    let a = this.attack;
    let d = this.delay;
    let ss = this.sustain;
    let r = this.release;
    let mxa = this.maxAmp;
    let mna = this.minAmp;
    //console.log(a + ' ' + d + ' ' + ss + ' ' + r);
    //console.log(this.connectedSynthArr);
    this.connectedSynthArr.forEach(function (s){
      s.env.setADSR(a, d, ss, r);
      s.env.setRange(mxa, mna);
    });
  }
  }


}
