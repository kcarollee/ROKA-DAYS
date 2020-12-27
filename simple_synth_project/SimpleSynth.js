

class SimpleSynth{

  constructor(amp, freq, type, posx, posy){
    
    this.osc = new p5.Oscillator();
    this.freq = freq;
    this.amp = amp;
    this.osc.setType(type);
    this.osc.amp(this.amp);
    this.osc.freq(this.freq);
    this.osc.disconnect();
    this.osc.start();
    
    this.envEnabled = false;
    this.posx = posx; this.posy = posy;
    this.w = 200; this.h = 80;
    
    this.filterEnabled = false;
    
    this.connectedSeqRef = null;
    
    this.toOther = false;
    this.connectedSynthArr = [];
    this.connectedADSRRef = null;
    this.connectedKnobArr = [];
    this.ampKnob = new Knob(map(this.amp, 0, 1, 0, TWO_PI), this.h * 0.2,
                            this.posx + this.w * 0.1, this.posy + this.h * 0.5, 0, 1);
    this.ampKnob.modulationMode = 1;
    this.ampKnob.synthRef = this;
    this.typeButton = {
      width : this.w * 0.3,
      height : this.ampKnob.radius,
      x : this.posx + this.w * 0.2,
      y : this.ampKnob.y - this.ampKnob.radius * 0.5,
      typeIndex : 0
    };
    
    this.freqButton = {
      width : this.w * 0.15,
      height : this.ampKnob.radius,
      x : this.posx + this.w * 0.6,
      y : this.ampKnob.y - this.ampKnob.radius * 0.5,
      mode : 2, // 0: keyboard, 1: array, 2: ---
    };
    
   
    
    this.freqKnob = new Knob(0, this.h * 0.2, this.posx + this.w * 0.1, this.posy + this.h * 0.75, 20, 22050);
    this.freqKnob.modulationMode = 2;
    this.freqKnob.synthRef = this;

    this.oscViewBox = {
      width : this.w,
      height : this.w,
      x : this.posx,
      y : this.posy - this.w,
      mode : 0, //0: waveform 1: frequency bars
    }
    
    this.inputArea = {
      x : this.oscViewBox.x,
      y : this.oscViewBox.y + (this.oscViewBox.height + this.h) * 0.5,
      radius : 18,
      dragged : false
    }
    this.outlet = {
      x : this.oscViewBox.x + this.oscViewBox.width,
      y : this.oscViewBox.y + (this.oscViewBox.height + this.h) * 0.5,
      radius : 20,
      dragged : false
    }
    
    // effects
    this.effectsEnabled = false;
    // effects button
    this.effectsButton = {
      width : this.w * 0.15,
      height : this.ampKnob.radius,
      x : this.posx + this.w * 0.8,
      y : this.ampKnob.y - this.ampKnob.radius * 0.5,
    }
    // effects box
    this.effectsBox = {
      width : this.h,
      height : this.h + this.oscViewBox.height,
      x : this.oscViewBox.x + this.oscViewBox.width,
      y : this.oscViewBox.y,
    };
    this.ekr = 15; // effects knob radius
    // delay knobs
    this.delay = new p5.Delay();
    this.delayTime = 0.1; // 0 ~ 1
    this.delayFeedback = 0.7; // 0 ~ 1
    this.delayFilterFreq = 2300;
    
    this.delayTimeKnob = new Knob(map(this.delayTime, 0, 1, 0, TWO_PI),
                                  this.ekr, this.effectsBox.x + this.effectsBox.width * 0.25, 
                                 this.effectsBox.y + this.ekr * 2, 0, 1);
    this.delayFeedbackKnob = new Knob(map(this.delayFeedback, 0, 1, 0, TWO_PI),
                                      this.ekr, this.effectsBox.x + this.effectsBox.width * 0.75, 
                                 this.effectsBox.y + this.ekr * 2, 0, 0.99);
    this.delayFilterFreqKnob = new Knob(map(this.delayFilterFreq, 0, 2500, 0, TWO_PI),
                                        this.ekr, this.effectsBox.x + this.effectsBox.width * 0.25, 
                                 this.effectsBox.y + this.ekr * 4, 0, 2500);
    this.delayTimeKnob.visible = false;
    this.delayFeedbackKnob.visible = false;
    this.delayFilterFreqKnob.visible = false;
    // reverb knobs
    this.reverb= new p5.Reverb();
    this.reverbTime = 3; // 0 ~ 5 secs
    this.reverbDecayRate = 2; // 0 ~ 100 percent
    
    this.reverbTimeKnob = new Knob(map(this.reverbTime, 0, 5, 0, TWO_PI),
                                   this.ekr, this.effectsBox.x + this.effectsBox.width * 0.25,
                              this.effectsBox.y + this.ekr * 7, 0, 5);
    this.reverbDecayRateKnob = new Knob(map(this.reverbDecayRate, 0, 100, 0, TWO_PI),
                                        this.ekr, this.effectsBox.x + this.effectsBox.width * 0.75,
                              this.effectsBox.y + this.ekr * 7, 0, 100);
    
    this.reverbTimeKnob.visible = false;
    this.reverbDecayRateKnob.visible = false;
    // pan knob
    this.panKnob = new Knob(map(0, -1, 1, 0, TWO_PI), this.h * 0.2, 
                           this.posx + this.w * 0.1,
                           this.posy + this.h * 0.2, -1, 1);
    this.panKnob.synthRef = this;
    //this.addFilter();
    this.fft = new p5.FFT(0.8, 256);
    
    this.fft.setInput(this.osc); // passing this.osc shows individual oscillations, unaffected by filters, but affected by ADSR. passcircle(knob.x, knob.y, knob.radius);
    
    this.xOffSet = 0;
    this.xOffSetCopy = this.xOffSet;
    this.xOffSetStr = '000';
    this.xOffSetEditMode = false;
    
    this.spectrum = this.fft.waveform();
    
  }
  
 
  
  drawOscView(){
    this.spectrum = this.fft.waveform();
    noFill();
    beginShape();
    //console.log(spectrum[0]);
    for (let i = 0; i < this.spectrum.length ; i++) {
      vertex(map(i, 0, this.spectrum.length, this.oscViewBox.x, this.oscViewBox.x + this.oscViewBox.width),
                 this.oscViewBox.y + this.oscViewBox.height * 0.5 + map(this.spectrum[i], 0, 10, 0, height));
    }
    endShape();
  }
  
  
  manageKnobDegree(knob){
    let inc = map(constrain(mouseY - knob.y, -100, 100), -100, 100, 0, TWO_PI);
    knob.deg = map(constrain(mouseY - knob.y, -10, 10), -10, 10, 0, TWO_PI);
    //this.osc.amp(map(this.ampKnob.deg, 0, TWO_PI, 0, 1.0));
    
    
  }
  
  drawKnob(knob){
    circle(knob.x, knob.y, knob.radius);
    push();
    translate(knob.x, knob.y);
    circle(5 * cos(knob.deg - HALF_PI), 5 * sin(knob.deg - HALF_PI), 2);
    pop();
  }
  displaySynth(){
    
    /*
    if (this.toOther) {
      console.log("freq: " + this.osc.f);
      console.log("amp: " + this.osc.getAmp());
      console.log("VAL: " + this.getSinValue(0, 0));
    }
    */
    noFill();
    stroke(255);
    rect(this.posx, this.posy, this.w, this.h);
    // ampKnob
    if (this.ampKnob.knobHeld){
      this.manageKnobDegree(this.ampKnob);
      this.osc.amp(this.ampKnob.mapDegToVal());
    }
    //this.osc.amp(0.5 * sin(frameCount * 10));
    this.ampKnob.display();
    // pan knob
    this.panKnob.display();
    if (this.panKnob.knobHeld){
      this.panKnob.manageKnobDegree();
      this.osc.pan(this.panKnob.mapDegToVal(), 0.1);
    }
    else if (this.panKnob.connectedToLFO && !isNaN(this.panKnob.deg) ){
      this.osc.pan(this.panKnob.mapDegToVal(), 0.1);
    }
    if (this.toOther){
      if (this.freqKnob.knobHeld){
        this.freqKnob.manageKnobDegree();
        this.osc.freq(map(this.freqKnob.deg, 0, TWO_PI, 0, 20));
      }
      this.freqKnob.display();
    }
    else circle(this.freqKnob.x, this.freqKnob.y, this.freqKnob.radius);
    
    if (this.freqKnob.connectedToLFO){
      this.osc.freq(this.freq);
    }
    // input
    circle(this.inputArea.x, this.inputArea.y, this.inputArea.radius);
    // outlet
    circle(this.outlet.x, this.outlet.y, this.outlet.radius);
    if (this.outlet.dragged){
      circle(mouseX, mouseY, 5);
      line(mouseX, mouseY, this.outlet.x, this.outlet.y);
    }
    let o = this.outlet;
    let self = this;
    this.connectedSynthArr.forEach(function (s){
      if (s !== self) line(o.x, o.y, s.ampKnob.x, s.ampKnob.y);
    });
    // type button
    //noFill();
    rect(this.typeButton.x, this.typeButton.y, this.typeButton.width, this.typeButton.height);
    fill(255);
    textAlign(CENTER);
    text(typeArr[this.typeButton.typeIndex % 4], this.typeButton.x + this.typeButton.width * 0.5, this.typeButton.y + fontSize);
    
    // freq button
    fill(255);
    if (!this.toOther){
      text(freqModeTextArr[this.freqButton.mode], 
           this.freqButton.x + this.freqButton.width * 0.5, this.freqButton.y + fontSize);
      noFill();
    }
    else {
      text("OFFSET", this.freqButton.x + this.freqButton.width * 0.5, this.freqButton.y - fontSize);
      text(this.xOffSetCopy, 
           this.freqButton.x + this.freqButton.width * 0.5, this.freqButton.y + fontSize);
      if (this.xOffSetEditMode){
        fill(100, 60);
      }
      else{
        noFill();
      }
    }
    rect(this.freqButton.x, this.freqButton.y, this.freqButton.width, this.freqButton.height);
    
    if (this.connectedADSRRef != null){
      line(this.outlet.x, this.outlet.y, this.connectedADSRRef.inputArea.x, this.connectedADSRRef.inputArea.y);
    }
    
    // osc view
    if (!this.toOther){
      noFill();
      rect(this.oscViewBox.x, this.oscViewBox.y, this.oscViewBox.width, this.oscViewBox.width);
      this.drawOscView();
    }
    noFill();
    // effects
    rect(this.effectsButton.x, this.effectsButton.y, this.effectsButton.width, this.effectsButton.height);
    fill(255);
    text("FX", this.effectsButton.x + this.effectsButton.width * 0.5, this.effectsButton.y + fontSize);
    noFill();
    if (this.effectsEnabled){
      rect(this.effectsBox.x, this.effectsBox.y, this.effectsBox.width, this.effectsBox.height);
      this.delayTimeKnob.display();
      this.delayFeedbackKnob.display();
      this.delayFilterFreqKnob.display();
      this.reverbTimeKnob.display();
      this.reverbDecayRateKnob.display();
      if (this.delayTimeKnob.knobHeld) this.delayTimeKnob.manageKnobDegree();
      else if (this.delayFeedbackKnob.knobHeld) this.delayFeedbackKnob.manageKnobDegree();
      else if (this.delayFilterFreqKnob.knobHeld) this.delayFilterFreqKnob.manageKnobDegree();
      else if (this.reverbTimeKnob.knobHeld) this.reverbTimeKnob.manageKnobDegree();
      else if (this.reverbDecayRateKnob.knobHeld) this.reverbDecayRateKnob.manageKnobDegree();
      fill(255);
      text("DELAY", this.effectsBox.x + this.effectsBox.width * 0.5, this.effectsBox.y + fontSize * 1.25);
      text("REVERB", this.effectsBox.x + this.effectsBox.width * 0.5, this.effectsBox.y + fontSize * 7.5);
    }
    noFill();
    
    this.connectedKnobArr.forEach(k => line(this.outlet.x, this.outlet.y, k.x, k.y));
  }
  
  setFreq(newFreq){
    if (this.envEnabled){
      this.env.triggerRelease();
      //console.log("RELEASE");
    } 
    this.freq = newFreq;
    this.osc.freq(this.freq);
  }
  
  // use in the mouseDragged() function
  moveSynth(){
    if (mouseX > this.posx && mouseX < this.posx + this.w && 
        mouseY > this.posy && mouseY < this.posy + this.h){
      if (dist(mouseX, mouseY, this.ampKnob.x, this.ampKnob.y) < this.ampKnob.radius){
        this.ampKnob.knobHeld = true;
        
      }
      else if (dist(mouseX, mouseY, this.panKnob.x, this.panKnob.y) < this.panKnob.radius){
        this.panKnob.knobHeld = true;
      }
      else if (dist(mouseX, mouseY, this.freqKnob.x, this.freqKnob.y) < this.freqKnob.radius){
        if (this.toOther) this.freqKnob.knobHeld = true;
      }
      else{
        if (!this.ampKnob.knobHeld && !this.outlet.dragged && !this.freqKnob.knobHeld && !this.panKnob.knobHeld ){
          this.posx = mouseX - this.w * 0.5;
          this.posy = mouseY - this.h * 0.5;
        }
      }
    }
    
    else if (dist(mouseX, mouseY, this.outlet.x, this.outlet.y) < this.outlet.radius){
        this.outlet.dragged = true;
        SimpleSynth.outletDragged =true;
    }
    else if (dist(mouseX, mouseY, this.delayTimeKnob.x, this.delayTimeKnob.y) < this.delayTimeKnob.radius){
        this.delayTimeKnob.knobHeld = true;
        this.delayTime = this.delayTimeKnob.mapDegToVal();
        this.delay.process(this.osc, this.delayTime, this.delayFeedback, this.delayFilterFreq);
        
    }
    else if (dist(mouseX, mouseY, this.delayFeedbackKnob.x, this.delayFeedbackKnob.y) < 
             this.delayFeedbackKnob.radius){
        this.delayFeedbackKnob.knobHeld = true;
      this.delayFeedback = this.delayFeedbackKnob.mapDegToVal();
      this.delay.process(this.osc, this.delayTime, this.delayFeedback, this.delayFilterFreq);
    }
    else if (dist(mouseX, mouseY, this.delayFilterFreqKnob.x, this.delayFilterFreqKnob.y) < 
             this.delayFilterFreqKnob.radius){
        this.delayFilterFreqKnob.knobHeld = true;
      this.delayFilterFreq = this.delayFilterFreqKnob.mapDegToVal();
      this.delay.process(this.osc, this.delayTime, this.delayFeedback, this.delayFilterFreq);
    }
    else if (dist(mouseX, mouseY, this.reverbTimeKnob.x, this.reverbTimeKnob.y) < 
             this.reverbTimeKnob.radius){
        this.reverbTimeKnob.knobHeld = true;
      this.reverbTime = this.reverbTimeKnob.mapDegToVal();
      this.reverb.process(this.osc, this.reverbTime, this.reverbDecayRate);
    }
    else if (dist(mouseX, mouseY, this.reverbDecayRateKnob.x, this.reverbDecayRateKnob.y) < 
             this.reverbDecayRateKnob.radius){
        this.reverbDecayRateKnob.knobHeld = true;
      this.reverbDecayRate = this.reverbDecayRateKnob.mapDegToVal();
      this.reverb.process(this.osc, this.reverbTime, this.reverbDecayRate);
    }
    
    this.ampKnob.x = this.posx + this.w * 0.1;
    this.ampKnob.y = this.posy + this.h * 0.5;

    this.panKnob.x = this.posx + this.w * 0.1;
    this.panKnob.y = this.posy + this.h * 0.2;
    
    this.typeButton.x = this.posx + this.w * 0.2;
    this.typeButton.y = this.ampKnob.y - this.ampKnob.radius * 0.5;
    

    this.freqButton.x = this.posx + this.w * 0.6;
    this.freqButton.y = this.ampKnob.y - this.ampKnob.radius * 0.5;
    

      
    
    this.freqKnob.x = this.posx + this.w * 0.1;
    this.freqKnob.y = this.posy + this.h * 0.75;
    
  
    this.oscViewBox.x = this.posx;
    this.oscViewBox.y = this.posy - this.w;
    
    this.outlet.x =  this.oscViewBox.x + this.oscViewBox.width;
    if (!this.toOther) this.outlet.y = this.oscViewBox.y + (this.oscViewBox.height + this.h) * 0.5;
    else this.outlet.y = this.posy + this.h * 0.5;
    this.inputArea.x = this.oscViewBox.x;
    if (!this.toOther) this.inputArea.y = this.outlet.y;
    else this.inputArea.y = this.posy + this.h * 0.5;
    
 
    this.effectsButton.x = this.posx + this.w * 0.8;
    this.effectsButton.y = this.ampKnob.y - this.ampKnob.radius * 0.5;
    
      
      this.effectsBox.x = this.oscViewBox.x + this.oscViewBox.width;
      this.effectsBox.y = this.oscViewBox.y;
    
  
    this.delayTimeKnob.updatePosition(this.effectsBox.x + this.effectsBox.width * 0.25, 
                                 this.effectsBox.y + this.ekr * 2);
    this.delayFeedbackKnob.updatePosition(this.effectsBox.x + this.effectsBox.width * 0.75, 
                                 this.effectsBox.y + this.ekr * 2);
    this.delayFilterFreqKnob.updatePosition(this.effectsBox.x + this.effectsBox.width * 0.25, 
                                 this.effectsBox.y + this.ekr * 4);
    
    this.reverbTimeKnob.updatePosition(this.effectsBox.x + this.effectsBox.width * 0.25,
                              this.effectsBox.y + this.ekr * 7);
    this.reverbDecayRateKnob.updatePosition(this.effectsBox.x + this.effectsBox.width * 0.75,
                              this.effectsBox.y + this.ekr * 7);
    
  }
  setType(type){this.osc.setType(type);}
  isInsideArea(x, y, w, h, mx, my){
    if (mx > x && mx < x + w && my > y && my < y + h) return true;
    else return false;
  }
  setOffSet(newOffSet){
    this.xOffSet = newOffSet;
  }
  lookForADSR(ADSRArr){
    let self = this;
    
    ADSRArr.forEach(function(a){
      if (dist(mouseX, mouseY, a.inputArea.x, a.inputArea.y) < a.inputArea.radius && !self.envEnabled){
        /*
         this.attack = attack;
    this.decay = decay;
    this.sustain = sustain;
    this.release = release;
    Synth
    this.maxAmp = maxAmp;
    this.minAmp = minAmp;delay
    
    this.envEnabled = true;
    this.env = new p5.Env();
    this.env.setADSR(this.attack, this.decay, this.sustain, this.release);
    this.env.setRange(this.maxAmp, this.minAmp);
    this.env.play(this.osc);
    */  
        self.osc.amp(0);
        self.connectedADSRRef = a;
        self.env = new p5.Env();
      a.connectedSynthArr.push(self);  
        self.env.play(self.osc);
        self.envEnabled = true;
        
      }
    })  
  }
  
  lookForSynth(synthArr){
    let o = this.osc;
    let arr = this.connectedSynthArr;
    let self = this;
    let to = this.toOther;
    synthArr.forEach(function (s){
      if (dist(mouseX, mouseY, s.ampKnob.x, s.ampKnob.y) < s.ampKnob.radius && !s.ampKnob.connected && s !== self){
        /*
        o.freq(5);
        o.add(1);
        o.amp(0.5);
        o.disconnect();automateDegViaLFO(){
        o.start();
        s.ampKnob.connected = true;
        
        s.osc.amp(o);
        arr.push(s);
        self.toOther = true;
        */
        // when turning a synth into an LFO, note that some of the knobs' parameters need to change
        
        o = new p5.Oscillator();
        o.freq(5);
        //o.add(1);
        //o.amp(50);
        o.disconnect();
        o.start();
        
        self.ampKnob.setNewMinMax(0, 50);
        self.freqKnob.setNewMinMax(0, 50);
        
        s.osc.freq(o);
       
        s.ampKnob.connected = true;
        arr.push(s);
        self.toOther = true;
        
      }
    });
  }
  getSinValue(xOffSet, yOffSet){
    // times 60 since 60 fps
    return yOffSet + this.osc.getAmp() * sin(PI * this.osc.f / 300.0 * (frameCount  + xOffSet * 60));
  }
  
  lookForKnob(knobArr){
    let o = this.osc;
    let arr = this.connectedKnobArr;
    let self = this;
    let to = this.toOther;
    knobArr.forEach(function (k){
      if (dist(mouseX, mouseY, k.x, k.y) < k.radius && !k.connectedToLFO && 
          k.synthRef != self && k.visible){
       if (!self.toOther && k.modulationMode != 0) self.osc = new p5.Oscillator();
        switch(k.modulationMode){
          case 0:
            k.connectedToLFO = true;
            k.connectedLFORef = self;
            self.osc.freq(5);
            //o.add(1);
            self.osc.amp(5);
            //self.ampKnob.setNewMinMax(-5, 5);
            //self.freqKnob.setNewMinMax(0, 50000);
            self.osc.disconnect();
            self.osc.start();
            self.toOther = true;
            arr.push(k);
            break;
          
          case 1: // ampknob
            self.osc.freq(5);
            self.osc.add(1);
            self.osc.amp(0.5);
            self.ampKnob.setNewMinMax(0, 1);
            self.freqKnob.setNewMinMax(0, 50);
            self.osc.disconnect();
            self.osc.start();
            
            k.connectedToLFO = true;
            k.connectedLFORef = self;
            k.synthRef.osc.amp(self.osc);
  
            self.toOther = true;
            arr.push(k)
            break;
          case 2: // freq knob
            self.osc.freq(5);
            self.osc.amp(15);
            self.ampKnob.setNewMinMax(0, 30);
            self.freqKnob.setNewMinMax(0, 50000);
            self.osc.disconnect();
            self.osc.output.disconnect();
            self.osc.start();
            k.connectedToLFO = true;
            k.connectedLFORef = self;
            k.synthRef.osc.freq(self.osc);
            
            //k.synthRef.osc.amp(1.0);
            self.toOther = true;
            arr.push(k)
            break;
        }
      }
    });
    
    if (this.toOther){
      
      this.outlet.y = this.posy + this.h * 0.5;
      this.inputArea.y = this.posy + this.h * 0.5;
    }
  }
  // mouseClicked
  mouseC(){
    if (this.toOther){
      if (this.isInsideArea(this.freqButton.x, this.freqButton.y,
                           this.freqButton.width, this.freqButton.height,
                           mouseX, mouseY)){
        this.xOffSetEditMode = !this.xOffSetEditMode;
        if (this.xOffSetEditMode){
          this.xOffSetStr = '';
        }
      }
    }
    if (this.isInsideArea(this.typeButton.x, this.typeButton.y, 
                     this.typeButton.width, this.typeButton.height, 
                     mouseX, mouseY)){
      this.setType(typeArr[(++this.typeButton.typeIndex) % 4]);
    }
     if (this.isInsideArea(this.effectsButton.x, this.effectsButton.y, 
                          this.effectsButton.width, this.effectsButton.height,
                          mouseX, mouseY) && !this.toOther){
       this.effectsEnabled = !this.effectsEnabled;
       if (this.effectsEnabled) {
         this.delayTimeKnob.visible = true;
         this.delayFeedbackKnob.visible = true;
         this.delayFilterFreqKnob.visible = true;
         this.reverbTimeKnob.visible = true;
         this.reverbDecayRateKnob.visible = true;
         
         this.delay = new p5.Delay();
         this.reverb = new p5.Reverb();
         this.osc.disconnect();
         this.osc.start();
         this.delay.process(this.osc, this.delayTime, this.delayFeedback, this.delayFilterFreq);
         this.reverb.process(this.delay, this.reverbTime, this.reverbDecayRate);
         //this.reverb.chain(this.delay);
        this.fft.setInput(this.delay * 10.0); 
       }
       else {
         //this.osc.connect();
         this.delayTimeKnob.visible = false;
         this.delayFeedbackKnob.visible = false;
         this.delayFilterFreqKnob.visible = false;
         this.reverbTimeKnob.visible = false;
         this.reverbDecayRateKnob.visible = false;
         this.fft.setInput(this.osc); 
         this.delay.disconnect();
         this.reverb.disconnect();
        
       }
     }
    
    /*
    if (this.isInsideArea(this.freqButton.x, this.freqButton.y, 
                     this.freqButton.width, this.freqButton.height,
                         mouseX, mouseY)){
      this.freqButton.mode++;
      this.freqButton.mode %= 2;
    }
    */
  }
  mouseR(){
    this.ampKnob.knobHeld = false;
    this.panKnob.knobHeld = false;
    this.outlet.dragged = false;
    this.freqKnob.knobHeld = false;
    this.delayTimeKnob.knobHeld = false;
    this.delayFeedbackKnob.knobHeld = false;
    this.delayFilterFreqKnob.knobHeld = false;
    this.reverbTimeKnob.knobHeld = false;
    this.reverbDecayRateKnob.knobHeld = false;
    SimpleSynth.outletDragged = false;
  }
  
  kPressed(){
    if (this.xOffSetEditMode){
      if (key >= 0 && key <= 9){
        this.xOffSetStr += key;
        this.xOffSetCopy = Number(this.xOffSetStr);
        if (this.xOffSetStr.length == 3){
          this.xOffSet = Number(this.xOffSetStr);
          this.xOffSetEditMode = false;
          this.xOffSetStr = '';
          this.connectedKnobArr.forEach(k => k.xOffSet = this.xOffSet);
        }
      }
    }
  }
}
SimpleSynth.outletDragged = false;
SimpleSynth.connectedKnobsArr = [];
