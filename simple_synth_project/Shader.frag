#ifdef GL_ES
precision mediump float;
#endif


#define PI 3.141592
#define MAX_STEPS 50
#define SURFACE_DIST 0.01
#define MAX_DIST 100.
#define OCTAVE_NUM 8

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float freqAvg;
uniform float ampAvg;
float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}
float hash(float n) { return fract(sin(n) * 1e4); }
float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

float noise(float x) {
	float i = floor(x);
	float f = fract(x);
	float u = f * f * (3.0 - 2.0 * f);
	return mix(hash(i), hash(i + 1.0), u);
}

float noise(vec2 x) {
	vec2 i = floor(x);
	vec2 f = fract(x);

	// Four corners in 2D of a tile
	float a = hash(i);
	float b = hash(i + vec2(1.0, 0.0));
	float c = hash(i + vec2(0.0, 1.0));
	float d = hash(i + vec2(1.0, 1.0));

	// Simple 2D lerp using smoothstep envelope between the values.
	// return vec3(mix(mix(a, b, smoothstep(0.0, 1.0, f.x)),
	//			mix(c, d, smoothstep(0.0, 1.0, f.x)),
	//			smoothstep(0.0, 1.0, f.y)));

	// Same code, with the clamps in smoothstep and common subexpressions
	// optimized away.
	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// shapes
float Sphere(vec3 p, vec3 pos, float r){
    r +=  freqAvg * noise(p.xz);
  r +=  freqAvg * noise(p.xy);
	 return length(p - pos) - r;
}
float Box(vec3 p, vec3 pos, vec3 s){
	return  length(max(abs(p - pos) - s, 0.0));
}

float XZPlane(vec3 p){
	return p.y;
}
// fuzz circle
float fcircle(vec2 uv, vec2 pos, float r){
  float a = 0.02;
  float dt = 0.01 * noise(uv * 20.0 + time * 00.1);
  r += dt;
  return 1.0 - smoothstep(r - a, r + a, length(uv - pos));
}
mat2 rotate(float deg){
  float s = sin(deg);
  float c = cos(deg);
  return mat2(c, -s, s, c);
}
vec3 twistP(vec3 p){
  float xc = freqAvg;
  float yc = freqAvg;
  float zc = freqAvg;

  float xn = map(noise(p.x + time * 10.0), .0, 1.0, -1.0, 1.0);
  float yn = map(noise(p.y + time * 0.1), .0, 1.0, -1.0, 1.0);
  float zn = map(noise(p.z + time * 0.1), .0, 1.0, -1.0, 1.0);
  vec3 q = vec3(.0);
  q.x = p.x + xc * xn;
  q.y = p.y + yc *yn;
  q.z = p.z + zc * zn;

return q;
}

// define scenes
float GetDistanceFromScene(vec3 p){
float final = 10000.0;
  vec3 dp = twistP(p);
  float p1 = XZPlane(p + 1.5);
  //p = twistP(p);

  // p.yz *= rotate(time * 5.0);
 // p.xz *= rotate(time * 0.1);
float  s = Sphere(p, vec3(0, 3.0, time * 10.0 + 5.0), 2.0); // x, y, z, r
  final = s;
//final = length(p - sphere.xyz) - sphere.w;
  if (p.y > 0.5) final = s;
  else {
    float gap = 2.0;
vec3 rp = mod(p, gap * 2.0) - gap;
  rp.xz *= rotate(time);
  float f = freqAvg * 5.0;
final = min(Box(rp, vec3(.0), vec3(0.5 + ampAvg * 0.25,f, 0.5)), p1);
  }

  //final = min(s, final);
return final;
}

// ray march
float RayMarch(vec3 rayOrig, vec3 rayDir){
float dist = 0.0;
for (int i = 0; i < MAX_STEPS; i++){
vec3 p = rayOrig + dist * rayDir; // new starting point
float distScene = GetDistanceFromScene(p);
dist += distScene;
if (distScene < SURFACE_DIST || dist > MAX_DIST) break;
}
return dist;
}

float circle(vec2 uv, vec2 pos, float r){
  return 1.0 - step(length(uv - pos), r);
}
// normals and lights
vec3 Normal(vec3 p){
float a = 0.01;
float dist = GetDistanceFromScene(p);
vec3 norm = vec3(
dist - GetDistanceFromScene(p - vec3(a, 0, 0)),
dist - GetDistanceFromScene(p - vec3(0, a, 0)),
dist - GetDistanceFromScene(p - vec3(0, 0, a))
);
return normalize(norm);
}

vec3 DiffuseLight(vec3 p, vec3 rayDir, float d){
  //float c = circle(p.xz)
    if (d > MAX_DIST * 0.2) return vec3(.0);

    float n1 = noise(p.xy * 5.0 * ampAvg + time * 0.01);
    float n2 = noise(p.zy * 5.0 + time * 0.01);
    float n3 = noise(p.xz * 5.0 + time * 0.01);
  float ns = n1 + n2 - n3;
  vec3 normal = Normal(p);
vec3 lightCol = vec3(30.0 *sin(ns * 10.0))/ clamp(pow(d, 2.0), 1.5, MAX_DIST);
	vec3 lightPos = p + vec3(.0, .0, -1.0);
	vec3 lightDir = normalize(lightPos - p);
	float difLight = clamp(dot(normal, lightDir), .0, 1.0) / clamp(pow(d, 0.001), 0.75, MAX_DIST * 0.5); // clamp the value between 0 and 1
  /*
	float shadowVal = RayMarch(p + normal * SURFACE_DIST, lightDir);
	if (shadowVal < length(lightPos - p)) difLight = 0.0;
    */
	if (difLight < .001) return vec3(2.0 * sin(ns * 10.0))/ clamp(pow(d, 2.0), 1.5, MAX_DIST);

	vec3 specLight = vec3(0.1);
	return (lightCol * difLight + specLight);
}


void main( void ) {
vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
vec2 st = gl_FragCoord.xy / resolution.xy * 10.0;
vec3 outCol = vec3(0.0);

vec3 color = vec3(1.0, .0, .0);

// camera
vec3 rayOrigin = vec3(0, 0, -10.0 + time * 10.0 );
vec3 rayDir = normalize(vec3(uv.x, uv.y, 1.0));

  float d = RayMarch(rayOrigin, rayDir);

vec3 p = rayOrigin + rayDir * d;
vec3 light = DiffuseLight(p, rayDir, d);

outCol = vec3(light);


gl_FragColor = vec4(outCol, 1.0);

}
