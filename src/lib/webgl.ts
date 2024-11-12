import type { Dimensions, Vector2D } from "@/types";
import { WORKSPACE_DIMENSIONS } from "@/lib/constants";

type CreateShaderParams = {
  gl: WebGLRenderingContext;
  type: GLenum;
  source: string;
};

export const createShader = ({ gl, type, source }: CreateShaderParams) => {
  const loggableType = type === gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT";
  
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

  throw new Error(`Program linking failed: ${gl.getProgramInfoLog(program)}`);
};

/**
 * Resize a canvas to match the size its displayed.
 * @param {number} [multiplier] amount to multiply by.
 *    Pass in window.devicePixelRatio for native pixels.
 */
export const resizeCanvasToDisplaySize = (
  gl: WebGLRenderingContext, 
  multiplier?: number
) => {
  multiplier = multiplier || 1;
  const canvas = gl.canvas as HTMLCanvasElement;
  const width = (canvas.clientWidth * multiplier) | 0;
  const height = (canvas.clientHeight * multiplier) | 0;
  canvas.width = width;
  canvas.height = height;
  gl.viewport(0, 0, width, height);
};

export function setRectangle(
  gl: WebGLRenderingContext,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;
  // prettier-ignore
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2,
    ]),
    gl.STATIC_DRAW
  );
}

export const getCenterPos = (itemDimensions: Dimensions): Vector2D => {
  return {
    x: (WORKSPACE_DIMENSIONS.width - itemDimensions.width) / 2,
    y: (WORKSPACE_DIMENSIONS.height - itemDimensions.height) / 2,
  };
};

/**
 * Attach a resize observer to an element.
 * @param {HTMLElement} element The element to observe.
 * @param {function} onResize The callback function to call when the element is resized.
 * @returns {function} A cleanup function to disconnect the observer.
 */
export function attachResizeObserver(
  element: HTMLElement,
  onResize: (entry: ResizeObserverEntry) => void
): () => void {
  const observer = new ResizeObserver((entries) => {
    if (!entries.length) return;
    onResize(entries[0]);
  });

  observer.observe(element);
  return () => observer.disconnect();
}
