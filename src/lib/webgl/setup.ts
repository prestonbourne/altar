import { createProgram, createShader, setRectangle } from "./utils";
import { FILTERS } from "./filters";
import vertexShaderSource from "./shaders/img/vert.glsl";
import fragmentShaderSource from "./shaders/img/frag.glsl";

interface ActiveFilter {
  id: string;
  name: string;
  intensity: number;
}

export function initWebGL(
  canvas: HTMLCanvasElement,
  imageUrl: string,
  activeFilters: ActiveFilter[]
): () => void {
  const gl = canvas.getContext("webgl")!;
  if (!gl) throw new Error("WebGL not supported");

  // Create shaders and program
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );
  const program = createProgram(gl, vertexShader, fragmentShader);

  // Look up attribute locations, this is where the vertex data needs to be sent to
  const attribLocations = {
    position: gl.getAttribLocation(program, "a_position"),
    texCoord: gl.getAttribLocation(program, "a_texCoord"),
  };

  // Create buffers ~ this is where the 2d clip space coordinates and texture coordinates are stored
  const buffers = {
    position: gl.createBuffer(),
    texCoord: gl.createBuffer(),
  };

  // Look up uniform locations
  const uniformLocations = {
    image: gl.getUniformLocation(program, "u_image"),
    textureSize: gl.getUniformLocation(program, "u_textureSize"),
    kernel: gl.getUniformLocation(program, "u_kernel"),
    kernelWeight: gl.getUniformLocation(program, "u_kernelWeight"),
    grayscale: gl.getUniformLocation(program, "u_grayscale"),
    saturation: gl.getUniformLocation(program, "u_saturation"),
    resolution: gl.getUniformLocation(program, "u_resolution"),
  };

  // Set up texture coordinates
  // prettier-ignore
  const points = new Float32Array([
    0.0,  0.0,
    1.0,  0.0,
    0.0,  1.0,
    0.0,  1.0,
    1.0,  0.0,
    1.0,  1.0,
  ]);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoord);
  gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

  // Load the image
  const image = new Image();
  image.src = imageUrl;
  image.crossOrigin = "anonymous";

  image.onload = () => {
    // Set canvas dimensions
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Create and set up the texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Set up the rectangle
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    setRectangle(gl, 0, 0, image.width / 500, image.height / 500);

    gl.vertexAttribPointer(attribLocations.position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribLocations.position);

    render();
  };

  function render() {
    // Clear the canvas
    gl.clearColor(0.5, 0.5, 0.5, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Use our program
    gl.useProgram(program);

    // Set up texture coordinate attribute
    gl.enableVertexAttribArray(attribLocations.texCoord);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoord);
    gl.vertexAttribPointer(attribLocations.texCoord, 2, gl.FLOAT, false, 0, 0);

    // Set texture uniform and resolution
    gl.uniform1i(uniformLocations.image, 0);
    gl.uniform2f(
      uniformLocations.textureSize,
      gl.canvas.width,
      gl.canvas.height
    );

    gl.uniform2f(uniformLocations.resolution, gl.canvas.width, gl.canvas.height);

    // Calculate combined kernel and color effects
    let currentKernel = new Float32Array([0, 0, 0, 0, 1, 0, 0, 0, 0]);
    let kernelWeight = 1;
    let grayscaleIntensity = 0;
    let saturationValue = 1;

    activeFilters.forEach((filter) => {
      const filterDef = FILTERS[filter.name]!;

      if (filterDef.type === "kernel" && filterDef.kernel) {
        // Combine kernel filters
        currentKernel = currentKernel.map(
          (value, index) => value + filterDef.kernel![index] * filter.intensity
        );
        // Update kernel weight
        kernelWeight = currentKernel.reduce((sum, val) => sum + val, 0);
        if (kernelWeight === 0) kernelWeight = 1;
      } else if (filterDef.type === "color") {
        // Apply color adjustments
        if (filter.name === "blackAndWhite") {
          grayscaleIntensity = filter.intensity;
        } else if (filter.name === "saturation") {
          saturationValue = Math.max(0, 1 + (filter.intensity - 1) * 2);
        }
      }
    });

    // Set uniforms
    gl.uniform1fv(uniformLocations.kernel, currentKernel);
    gl.uniform1f(uniformLocations.kernelWeight, kernelWeight);
    gl.uniform1f(uniformLocations.grayscale, grayscaleIntensity);
    gl.uniform1f(uniformLocations.saturation, saturationValue);

    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  // Return cleanup function
  return () => {
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.deleteBuffer(buffers.position);
    gl.deleteBuffer(buffers.texCoord);
  };
}
