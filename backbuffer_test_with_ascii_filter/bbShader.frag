#ifdef GL_ES
precision highp float;
#endif


void main( void ) {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  
  vec3 outCol = texture2D(texture, uv).rgb;
  //outCol += getbb(.0, .0);
  //outCol += diffuseFour(.1, 5.0 + 5.0 * sin(time));
  
  gl_FragColor = vec4(outCol, 1.0);
}