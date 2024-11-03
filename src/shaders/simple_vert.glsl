attribute vec2 a_position;
uniform vec2 u_resolution;

void main() {
    // convert the position from pixels to 0.0 to 1.0, aka normalize
    vec2 zeroToOne = a_position / u_resolution;
    // convert to 0.0 to 2.0
    vec2 zeroToTwo = zeroToOne * 2.0;
    // convert to -1.0 to 1.0
    vec2 clipSpace = zeroToTwo - 1.0;
    /* gl_Position is a built-in variable
     that WebGL uses to store the final position of the vertex after transformations.
     */
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
