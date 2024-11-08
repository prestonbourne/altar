import {
  setRectangle,
  createProgram,
  resizeCanvasToDisplaySize,
} from "./webgl";
import { IDENTITY_KERNEL } from "@/lib/constants";
import type { ImageEdits, UniformName, Vector2D, Vector3D } from "@/types";

type UniformLocations = Record<UniformName, WebGLUniformLocation | null>;

type LoadImageOpts = {
  position: Vector2D;
};

type RenderOpts = {
  edits: ImageEdits;
  clearColor: Vector3D;
};

export class ImageProcessor {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private attribLocations: {
    position: number;
    texCoord: number;
  };
  private uniformLocations: UniformLocations;
  private buffers: {
    position: WebGLBuffer | null;
    texCoord: WebGLBuffer | null;
  };
  private texture: WebGLTexture | null;
  readonly imageScale = 1.2;
  #isImageLoaded = false;

  constructor(
    private canvas: HTMLCanvasElement,
    private vertexShaderSource: string,
    private fragmentShaderSource: string
  ) {
    const gl = canvas.getContext("webgl");
    if (!gl) throw new Error("WebGL not supported");
    this.gl = gl;

    // Initialize WebGL program and resources
    this.program = this.createProgram();
    this.attribLocations = this.getAttribLocations();
    this.buffers = this.createBuffers();
    this.uniformLocations = this.getUniformLocations();
    this.texture = null;
  }

  private createProgram(): WebGLProgram {
    const program = createProgram({
      gl: this.gl,
      vertexShaderSrc: this.vertexShaderSource,
      fragmentShaderSrc: this.fragmentShaderSource,
    });

    return program;
  }

  get isImageLoaded() {
    return this.#isImageLoaded;
  }

  private getAttribLocations() {
    return {
      position: this.gl.getAttribLocation(this.program, "a_position"),
      texCoord: this.gl.getAttribLocation(this.program, "a_texCoord"),
    };
  }

  private getUniformLocations(): UniformLocations {
    return {
      u_image: this.gl.getUniformLocation(this.program, "u_image"),
      u_textureSize: this.gl.getUniformLocation(this.program, "u_textureSize"),
      u_kernel: this.gl.getUniformLocation(this.program, "u_kernel"),
      u_kernelWeight: this.gl.getUniformLocation(
        this.program,
        "u_kernelWeight"
      ),
      u_saturation: this.gl.getUniformLocation(this.program, "u_saturation"),
      u_resolution: this.gl.getUniformLocation(this.program, "u_resolution"),
      u_brightness: this.gl.getUniformLocation(this.program, "u_brightness"),
    };
  }

  private createBuffers() {
    return {
      position: this.gl.createBuffer(),
      texCoord: this.gl.createBuffer(),
    };
  }

  public async loadImage(imageUrl: string, opts: LoadImageOpts): Promise<void> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageUrl;
      image.crossOrigin = "anonymous";

      image.onload = () => {
        this.setupTexture(image);
        this.setupGeometry(image, opts);
        console.log("successfully loaded image", image);
        this.#isImageLoaded = true;
        resolve();
      };

      image.onerror = () => reject(new Error("Failed to load image"));
    });
  }

  private setupTexture(image: HTMLImageElement) {
    this.texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

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
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.texCoord);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, points, this.gl.STATIC_DRAW);

    // Set texture parameters
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.NEAREST
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.NEAREST
    );

    // Upload image to texture
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      image
    );
  }

  private setupGeometry(image: HTMLImageElement, opts: LoadImageOpts) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
    setRectangle(
      this.gl,
      opts.position.x,
      opts.position.y,
      image.width * this.imageScale,
      image.height * this.imageScale
    );

    this.gl.vertexAttribPointer(
      this.attribLocations.position,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.gl.enableVertexAttribArray(this.attribLocations.position);
  }

  public render(opts: RenderOpts) {
    if (!this.#isImageLoaded) return;
    console.log("render");

    resizeCanvasToDisplaySize(this.gl.canvas as HTMLCanvasElement);

    // Clear canvas
    this.gl.clearColor(
      opts.clearColor.x,
      opts.clearColor.y,
      opts.clearColor.z,
      1
    );
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Set up program and attributes
    this.gl.useProgram(this.program);

    this.setupTextureCoordinates();
    this.setUniforms();

    this.applyEdits(opts.edits);

    // Draw
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  private setupTextureCoordinates() {
    this.gl.enableVertexAttribArray(this.attribLocations.texCoord);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.texCoord);
    this.gl.vertexAttribPointer(
      this.attribLocations.texCoord,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );
  }

  private setUniforms() {
    this.gl.uniform1i(this.uniformLocations.u_image, 0);
    this.gl.uniform2f(
      this.uniformLocations.u_textureSize,
      this.gl.canvas.width,
      this.gl.canvas.height
    );
    this.gl.uniform2f(
      this.uniformLocations.u_resolution,
      this.gl.canvas.width,
      this.gl.canvas.height
    );
  }

  private applyEdits(edits: ImageEdits) {
    // Set default kernel for now
    this.gl.uniform1fv(this.uniformLocations.u_kernel, IDENTITY_KERNEL);
    this.gl.uniform1f(this.uniformLocations.u_kernelWeight, 1);

    // Apply color adjustments
    Object.entries(edits.adjustments).forEach(([_, adjustment]) => {
      const uniformLocation = this.uniformLocations[adjustment.uniformName];
      if (uniformLocation) {
        this.gl.uniform1f(uniformLocation, adjustment.defaultValue);
      }
    });
  }

  public cleanup() {
    this.gl.deleteProgram(this.program);
    this.gl.deleteBuffer(this.buffers.position);
    this.gl.deleteBuffer(this.buffers.texCoord);
    if (this.texture) this.gl.deleteTexture(this.texture);
  }
}
