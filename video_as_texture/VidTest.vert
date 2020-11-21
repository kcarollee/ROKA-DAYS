#ifdef GL_ES
precision mediump float;
#endif
  
attribute vec3 aPosition;
uniform float time;

mat2 rotate(float deg){
  float s = sin(deg);
  float c = cos(deg);
  return mat2(c, -s, s, c);
}
void main() {

  vec4 outPos = vec4(aPosition, 1.0); // Copy the position data into a vec4, adding 1.0 as the w parameter
  
  outPos.xy = outPos.xy * 2.0 - 1.0; // Scale to make the output fit the canvas. 
  
  //tPos.xy = rotate(time * 0.01) * outPos.xy;
  //outPos.xz = rotate(time * 0.01) * outPos.xz;
  gl_Position = outPos;

}