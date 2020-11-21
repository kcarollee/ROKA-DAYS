#ifdef GL_ES

precision mediump float;

#endif
uniform sampler2D tex;
uniform vec2 resolution;
uniform bool bloomOn;
uniform float time;
uniform float rgbDiff;
uniform float bloomStrength;
uniform float bloomIntensity;
uniform float distort;
float circle(vec2 uv, vec2 pos, float r){
  return 1.0 - smoothstep(r - 0.1, r + 0.1,  length(uv - pos));
}

vec2 pc(vec2 d){
  vec2 uv = (gl_FragCoord.xy - d) / resolution.xy;
  uv.y = 1.0 - uv.y;
  uv.x+= distort * cos(tan(time * 0.1 + uv.y));
  return uv;
}

vec3 bloom(){
  float bstr = bloomStrength;
  float bint = bloomIntensity;
  
  vec3 sum = vec3(.0);
  for (float i = 1.0; i < 10000.0; i += 1.0){
    if (i > bstr) break;
    sum += texture2D(tex, pc(vec2(i, .0))).rgb / (bint * i);
    sum += texture2D(tex, pc(vec2(-i, .0))).rgb / (bint * i);
    sum += texture2D(tex, pc(vec2(.0, i))).rgb / (bint * i);
    sum += texture2D(tex, pc(vec2(.0, -i))).rgb / (bint * i);
    sum += texture2D(tex, pc(vec2(i, -i))).rgb / (bint * i);
    sum += texture2D(tex, pc(vec2(-i, i))).rgb / (bint * i);
    sum += texture2D(tex, pc(vec2(i, i))).rgb / (bint * i);
    sum += texture2D(tex, pc(vec2(-i, -i))).rgb / (bint * i);
  }
  return sum;
}

void main( void ) {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  uv.y = 1.0 - uv.y;
  vec3 t = texture2D(tex, uv).rgb;
  
  vec3 outCol = vec3(.0);
 
  outCol += t;
  //outCol = 1.0 - outCol;
  
  
  float d = rgbDiff;
  if (texture2D(tex, pc(vec2(d, .0))).r > 0.0 ) outCol.r += 1.0;
  if (texture2D(tex, pc(vec2(-d, .0))).g > 0.0) outCol.g += 1.0;
  if (texture2D(tex, pc(vec2(.0, d))).b > 0.0 ) outCol.b += 1.0;
 
  if (bloomOn) outCol += bloom();
 
  gl_FragColor = vec4(outCol, 1.0);

}