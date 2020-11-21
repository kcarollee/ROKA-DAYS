#ifdef GL_ES

precision mediump float;

#endif
uniform sampler2D tex;
uniform vec2 resolution;

uniform float time;

float circle(vec2 uv, vec2 pos, float r){
  return 1.0 - smoothstep(r - 0.1, r + 0.1,  length(uv - pos));
}

vec2 pc(vec2 d){
  return (gl_FragCoord.xy - d) / resolution.xy;
}

void main( void ) {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  uv.y = 1.0 - uv.y;
  vec3 outCol = vec3(.0);
  vec3 t = texture2D(tex, uv).rgb;
  outCol += t;
  outCol = 1.0 - outCol;
  
  if (texture2D(tex, pc(vec2(1.0, .0))).r < 0.5 + 0.4 * cos(time * 0.1)) outCol.r += 1.0;
  if (texture2D(tex, pc(vec2(-1.0, .0))).g < 0.5) outCol.g += 1.0;
  if (texture2D(tex, pc(vec2(-1.0, 1.0))).b < 0.5 + 0.5 * sin(time * 0.2)) outCol.b += 1.0;
  
  gl_FragColor = vec4(outCol, 1.0);

}