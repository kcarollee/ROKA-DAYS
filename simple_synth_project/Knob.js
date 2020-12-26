let knobArr = [];
class Knob{
  constructor(deg, radius, x, y, min, max){
    this.deg = deg;
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.knobHeld = false;
    this.connectedToLFO = false;
    this.connectedLFORef = null;
    knobArr.push(this);
    //console.log(knobArr);
    this.min = min;
    this.max = max;
    this.visible = true;
    this.xOffSet = 0;

 /*
 we need modulationMode because amp and freq need special treatment
 when connected to another osc obj
 0: default
 1: amp
 2: freq
 */
    this.modulationMode = 0;
    this.synthRef = null;
  }

  manageKnobDegree(){
    if (!this.connectedToLFO){
      let inc = map(constrain(mouseY - this.y, -100, 100), -100, 100, 0, TWO_PI);
      this.deg = map(constrain(mouseY - this.y, -10, 10), -10, 10, 0, TWO_PI);
    }
    //this.deg = map(10 * sin(frameCount * 0.1), -10, 10, 0, TWO_PI);
    //this.osc.amp(map(this.ampKnob.deg, 0, TWO_PI, 0, 1.0));
  }
  setNewMinMax(min, max){
    this.min = min; this.max = max;
  }
  mapDegToVal(){
    //console.log(this.min + " " + this.max);
    return map(this.deg, 0, TWO_PI, this.min, this.max);
  }
  automateDegViaLFO(){
    // if connected to LFO and isn't an ampKnob or a freqKnob
    //console.log(this.connectedToLFO + ' ');
    if (this.connectedToLFO && this.modulationMode == 0){
      this.deg = map(this.connectedLFORef.getSinValue(this.xOffSet, 0),
                    -this.connectedLFORef.osc.getAmp(), this.connectedLFORef.osc.getAmp(),
                    0, TWO_PI);
    }
  }
  display(){
    this.automateDegViaLFO()
    circle(this.x, this.y, this.radius);
    push();
    translate(this.x, this.y);
    circle(5 * cos(this.deg - HALF_PI), 5 * sin(this.deg - HALF_PI), 2);
    pop();
  }
  updatePosition(newX, newY){
    this.x = newX;
    this.y = newY;
  }

  mouseIsInside(){
    if (dist(mouseX, mouseY, this.x, this.y) < this.radius) return true;
    else return false;
  }
  mDragged(){
    Knob.draggedCount++;
  }
  mReleased(){
    Knob.draggedCount = 0;
  }
}

Knob.draggedCount = 0;
