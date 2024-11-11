precision mediump float;

// Input image texture to be processed
uniform sampler2D u_image;

// Brightness control: values >1.0 increase brightness, values <1.0 decrease it
uniform float u_brightness;

// Saturation control: adjusts the color vibrancy
uniform float u_saturation;

// Texture coordinate for the fragment being processed
varying vec2 v_texCoord;

// Values from 0.0 to 1.0 represent 0° to 360° rotation on the color wheel
uniform float u_hue;


vec3 rgbToHsv(vec3 color) {
    float maxC = max(color.r, max(color.g, color.b));
    float minC = min(color.r, min(color.g, color.b));
    float delta = maxC - minC;

    float h = 0.0;
    if (delta != 0.0) {
        if (maxC == color.r) {
            h = mod((color.g - color.b) / delta, 6.0);
        } else if (maxC == color.g) {
            h = (color.b - color.r) / delta + 2.0;
        } else {
            h = (color.r - color.g) / delta + 4.0;
        }
        h /= 6.0;
    }

    float s = maxC == 0.0 ? 0.0 : delta / maxC;
    float v = maxC;
    return vec3(h, s, v);
}

vec3 hsvToRgb(vec3 hsv) {
    float h = hsv.x * 6.0;
    float s = hsv.y;
    float v = hsv.z;

    float c = v * s;
    float x = c * (1.0 - abs(mod(h, 2.0) - 1.0));
    float m = v - c;

    vec3 color;
    if (0.0 <= h && h < 1.0) {
        color = vec3(c, x, 0.0);
    } else if (1.0 <= h && h < 2.0) {
        color = vec3(x, c, 0.0);
    } else if (2.0 <= h && h < 3.0) {
        color = vec3(0.0, c, x);
    } else if (3.0 <= h && h < 4.0) {
        color = vec3(0.0, x, c);
    } else if (4.0 <= h && h < 5.0) {
        color = vec3(x, 0.0, c);
    } else {
        color = vec3(c, 0.0, x);
    }
    return color + m;
}


vec4 applyColorEffects(vec4 color) {
    // **Step 1: Brightness Adjustment**
    // Scale the original RGB color by the brightness factor.
    vec3 brightnessAdjusted = color.rgb * clamp(u_brightness, 0.0, 2.0);

    // **Step 2: Saturation Adjustment**
    // Calculate luminance using standard grayscale weights to represent brightness in grayscale
    vec3 weights = vec3(0.299, 0.587, 0.114);
    float luminance = dot(brightnessAdjusted, weights);

    // Blend between the grayscale luminance and the brightness-adjusted color based on the saturation level
    vec3 saturated = mix(vec3(luminance), brightnessAdjusted, clamp(u_saturation, 0.0, 5.0));

    // Step 3: Hue Adjustment
    // Convert the color to HSV, modify the hue, and convert it back to RGB
    vec3 hsvColor = rgbToHsv(saturated);
    hsvColor.x = mod(hsvColor.x + u_hue, 1.0); // Rotate hue, keeping it in [0, 1] range
    vec3 finalColor = hsvToRgb(hsvColor);

    // Return the color with adjusted brightness and saturation, preserving the original alpha
    return vec4(finalColor, color.a);
}

void main() {
    // Sample the color at the current texture coordinate
    vec4 baseColor = texture2D(u_image, v_texCoord);

    gl_FragColor = applyColorEffects(baseColor);
}
