import { Dimensions } from "@/types";

export const createShader = (
  gl: WebGLRenderingContext,
  type: GLenum,
  source: string
) => {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Shader creation failed");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (success) {
    return shader;
  }

  gl.deleteShader(shader);
  throw new Error(`Shader compilation failed: ${gl.getShaderInfoLog(shader)}`);
};

export const createProgram = (
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) => {
  const program = gl.createProgram();
  if (!program) {
    throw new Error("Program creation failed");
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const didSucceed = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (didSucceed) {
    return program;
  }
  gl.deleteProgram(program);
  throw new Error(`Program linking failed: ${gl.getProgramInfoLog(program)}`);
};

export const resizeCanvasToDisplaySize = (
  gl: WebGLRenderingContext,
  canvasDimensions: Dimensions
) => {
  const { width: displayWidth, height: displayHeight } = canvasDimensions;

  const isHTMLCanvas = gl.canvas instanceof HTMLCanvasElement;
  if (!isHTMLCanvas) {
    throw new Error(
      "gl.canvas is not an HTMLCanvasElement, are you calling canvas.getContext('webgl')?"
    );
  }

  const hasWidthChanged = gl.canvas.width !== displayWidth;
  const hasHeightChanged = gl.canvas.height !== displayHeight;

  const shouldResize = hasWidthChanged || hasHeightChanged;
  if (shouldResize) {
    gl.canvas.width = displayWidth;
    gl.canvas.height = displayHeight;
    gl.viewport(0, 0, displayWidth, displayHeight);
  }
};
