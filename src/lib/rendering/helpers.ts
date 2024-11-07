import type { Dimensions, Filter } from "@/types";

type CreateShaderParams = {
  gl: WebGLRenderingContext;
  type: GLenum;
  source: string;
};

export const createShader = ({ gl, type, source }: CreateShaderParams) => {
  const loggableType = type === gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT";
  console.log("attempting to create shader", {
    type: loggableType,
    source,
  });
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

  const shaderString = gl.getShaderInfoLog(shader) || source;
  console.error(`Failed to compile ${loggableType} shader`, {
    type: loggableType,
    shaderString,
  });
  throw new Error(`Failed to compile ${loggableType} shader: ${shaderString}`);
};

type CreateProgramParams = {
  gl: WebGLRenderingContext;
  vertexShaderSrc: string;
  fragmentShaderSrc: string;
};

export const createProgram = ({
  gl,
  vertexShaderSrc,
  fragmentShaderSrc,
}: CreateProgramParams) => {
  const vertexShader = createShader({
    gl,
    type: gl.VERTEX_SHADER,
    source: vertexShaderSrc,
  });
  const fragmentShader = createShader({
    gl,
    type: gl.FRAGMENT_SHADER,
    source: fragmentShaderSrc,
  });
  const program = gl.createProgram();

  if (!program) {
    throw new Error("Program creation failed. " + gl.getError());
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

export const computeKernelWeight = (kernel: Filter["kernel"]) => {
  if (!kernel) throw new Error("Kernel is required");
  const weight = kernel.reduce((acc, curr) => acc + curr);
  return weight <= 0 ? 1 : weight;
};
