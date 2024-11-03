// fragment shaders dont have a default precision
precision mediump float;
uniform vec4 u_color;

void main() {
    // gl_FragColor is a built-in variable that WebGL uses to store the final color of the fragment.
    gl_FragColor = u_color;
}
