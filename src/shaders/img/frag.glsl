precision mediump float;

uniform sampler2D u_image;
uniform float u_kernel[9];
uniform float u_kernelWeight;
uniform vec2 u_textureSize;
uniform float u_grayscale;
uniform float u_saturation;

varying vec2 v_texCoord;

vec4 applyKernel() {
    vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
    vec4 colorSum = vec4(0.0);

    colorSum += texture2D(u_image, v_texCoord + onePixel * vec2(-1, -1)) * u_kernel[0];
    colorSum += texture2D(u_image, v_texCoord + onePixel * vec2(0, -1)) * u_kernel[1];
    colorSum += texture2D(u_image, v_texCoord + onePixel * vec2(1, -1)) * u_kernel[2];
    colorSum += texture2D(u_image, v_texCoord + onePixel * vec2(-1, 0)) * u_kernel[3];
    colorSum += texture2D(u_image, v_texCoord + onePixel * vec2(0, 0)) * u_kernel[4];
    colorSum += texture2D(u_image, v_texCoord + onePixel * vec2(1, 0)) * u_kernel[5];
    colorSum += texture2D(u_image, v_texCoord + onePixel * vec2(-1, 1)) * u_kernel[6];
    colorSum += texture2D(u_image, v_texCoord + onePixel * vec2(0, 1)) * u_kernel[7];
    colorSum += texture2D(u_image, v_texCoord + onePixel * vec2(1, 1)) * u_kernel[8];

    return colorSum / u_kernelWeight;
}

vec4 applyColorEffects(vec4 color) {
    vec3 originalColor = color.rgb;

    // Convert to grayscale if needed
    vec3 weights = vec3(0.299, 0.587, 0.114); // Standard grayscale weights
    float luminance = dot(originalColor, weights);
    vec3 grayscaleColor = vec3(luminance);

    // Mix between original and grayscale based on intensity
    vec3 mixedColor = mix(originalColor, grayscaleColor, clamp(u_grayscale, 0.0, 1.0));

    // Apply saturation
    float satLuminance = dot(mixedColor, weights);
    vec3 saturated = mix(vec3(satLuminance), mixedColor, clamp(u_saturation, 0.0, 5.0));

    return vec4(saturated, color.a);
}

void main() {
    vec4 kernelColor = applyKernel();
    gl_FragColor = applyColorEffects(kernelColor);
}
