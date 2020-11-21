#ifdef GL_ES
precision highp float;
#endif
#define PI 3.141592
uniform sampler2D tex;
uniform sampler2D backbuffer;
uniform vec2 resolution;
uniform float time;
//uniform vec3 lineColor;
vec3 get(float x, float y){
  return texture2D(backbuffer, (gl_FragCoord.xy + vec2(x, y)) / resolution.xy).rgb;
}

float rand(float n){return fract(sin(n) * 43758.5453123);}
float rand(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}
float noise(vec2 n) {
  const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
  return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy),       f.x), f.y);
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
  float bstr = 20.0;
  float bint = 10.0;
  
  vec3 sum = vec3(.0);
  for (float i = 1.0; i < 10000.0; i += 1.0){
    if (i > bstr) break;
    sum += texture2D(tex, pc(vec2(i, .0))).rgb / pow(bint, i * 0.5);
    sum += texture2D(tex, pc(vec2(-i, .0))).rgb / pow(bint, i* 0.5);
    sum += texture2D(tex, pc(vec2(.0, i))).rgb / pow(bint, i* 0.5);
    sum += texture2D(tex, pc(vec2(.0, -i))).rgb / pow(bint, i* 0.5);
    sum += texture2D(tex, pc(vec2(i, -i))).rgb / pow(bint, i* 0.5);
    sum += texture2D(tex, pc(vec2(-i, i))).rgb / pow(bint, i* 0.5);
    sum += texture2D(tex, pc(vec2(i, i))).rgb / pow(bint, i* 0.5);
    sum += texture2D(tex, pc(vec2(-i, -i))).rgb / pow(bint, i* 0.5);
  }
  return sum;
}

void main(){
  vec3 outCol = vec3(.0);
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 t = texture2D(tex, uv).rgb;
  outCol += bloom();
 //if ((outCol.r + outCol.g + outCol.b) / 3.0 < 0.1) outCol = vec3(.0);
  //if (outCol.r < 0.001 && outCol.g < 0.001 && outCol.b < 0.001) discard;
 
  outCol += noise(uv * 10000.0 + time) * 0.1;
  outCol *= noise(uv * 10000.0 + time);
  gl_FragColor = vec4(outCol, 1.0);
}