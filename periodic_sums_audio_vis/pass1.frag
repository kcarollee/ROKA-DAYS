#ifdef GL_ES
precision highp float;
#endif
#define PI 3.141592
uniform sampler2D tex;
uniform sampler2D backbuffer;
uniform vec2 resolution;
uniform float time;
uniform vec3 currentColor;
uniform float vibration;

mat2 rotate(float deg){
  float c = cos(deg);
  float s = sin(deg);
  return mat2(c, -s, s, c);
}
vec3 get(float x, float y){
  return texture2D(backbuffer, (gl_FragCoord.xy + vec2(x, y)) / resolution.xy).rgb;
}

vec3 diffuseFour(float f, float d){
  vec3 c = vec3(.0);
  c += f * (get(d, .0) + get(d, d) + get(d, -d) + 
            get(-d, .0) + get(-d, d) + get(-d, -d) + 
            get(.0, d) + get(.0, -d) - 8.0 * get(.0, .0));
  return c;
}

vec2 pc(vec2 d){
  vec2 uv = (gl_FragCoord.xy - d) / resolution.xy;
  return uv;
}

vec3 bloom(){
  float bstr = 10.0;
  float bint = 20.0;
  
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

void main(){
  vec3 outCol = vec3(.0);
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  float vib =  vibration;
  uv.x = uv.x + vib * cos(uv.x * uv.y + time * 10.0);
  uv.y = uv.y + vib * sin(uv.x * uv.y + time * 10.0);
  //uv = rotate(time * 0.0001) * uv;
  vec3 t = texture2D(tex, uv).rgb;
  vec3 b = texture2D(backbuffer, uv).rgb;
  
  outCol += t;
  outCol += b * 0.95;
  outCol *= currentColor;
  //if (outCol.r < 0.1) outCol = vec3(.0);
  //outCol += bloom();
 //if ((outCol.r + outCol.g + outCol.b) / 3.0 < 0.1) outCol = vec3(.0);
  gl_FragColor = vec4(outCol, 1.0);
}