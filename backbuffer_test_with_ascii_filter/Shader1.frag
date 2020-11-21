#ifdef GL_ES
precision highp float;
#endif
uniform vec2 resolution;
uniform float time;
uniform vec2 mouse;
uniform sampler2D texture;
uniform sampler2D backbuffer;
float circle(vec2 uv, vec2 pos, float r){
	return 1.0 - step(r, length(uv - pos));	
}

void main( void ) {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  
  vec3 outCol = texture2D(texture, uv).rgb;
  //outCol += getbb(.0, .0);
  //outCol += diffuseFour(.1, 5.0 + 5.0 * sin(time));
  
  if (outCol.r > .0) outCol *= vec3(0.1 + 0.1 * cos(outCol.r * 10.0), 
                                    0.7 + 0.3 * cos(outCol.g * 5.0), 
                                    0.8 + 0.2 * sin(outCol.b * 5.0));
  
  
  
  gl_FragColor = vec4(outCol, 1.0);
}