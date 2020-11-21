#ifdef GL_ES

precision highp float;

#endif
uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;
uniform float mouseVel;
uniform sampler2D backbuffer;
uniform float diffuseCoef;
uniform float diffuseClar;
float circle(vec2 uv, vec2 pos, float r){
	return 1.0 - step(r, length(uv - pos));	
}

vec3 get(float x, float y){
  
  y = 1.0 - y; // uncomment to move smoke upwards
  return texture2D(backbuffer, (gl_FragCoord.xy + vec2(x,y)) / resolution).rgb;
}

vec3 diffuseFour(float f, float d){
  vec3 c = vec3(.0);
  c += f * (get(d, .0) + get(d, d) + get(d, -d) + 
            get(-d, .0) + get(-d, d) + get(-d, -d) + 
            get(.0, d) + get(.0, -d) - 8.0 * get(.0, .0));
  return c;
}

void main( void ) {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 outCol = vec3(.0);
  outCol += circle(uv, mouse, mouseVel);
  outCol += get(.0, .0);
  //outCol.r += circle(uv, vec2(0.2), 0.03);
  outCol += diffuseFour(diffuseCoef, diffuseClar);
  gl_FragColor = vec4(outCol, 1.0);
}