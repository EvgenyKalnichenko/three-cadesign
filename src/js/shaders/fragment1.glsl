uniform float time;
uniform float progress;
uniform vec4 resolution;
uniform sampler2D landscape;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 eyeVector;
varying vec3 vBary;
float PI = 3.1415926535897932384626433832795;
vec2 hash22(vec2 p){
    p = fract(p * vec2(5.3983, 5.4427));
    p += dot(p.xy, p.xy + vec2(21.5351, 14.3137));
    return fract(vec2(p.x * p.y * 95.4337, p.x * p.y * 97.597));
}

void main() {
    //ширина линий
    float width = 1.;
    vec3 d = fwidth(vBary);
    vec3 s = smoothstep(d*(width + 0.5), d*(width - 0.5), vBary);
    float line = max(s.x, max(s.y,s.z));
    if(line<0.1) discard;
    gl_FragColor = vec4(mix(vec3(1.),vec3(0.), 1. - line),1.);
}
