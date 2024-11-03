"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import simpleFrag from "@/shaders/simple_frag.glsl";
import simpleVert from "@/shaders/simple_vert.glsl";
import * as WebGLUtils from "@/lib/webgl-utils";
import { Dimensions } from "@/types";
import * as NumUtils from "@/lib/num-utils";

const writeRectangleDataToBuffer = (
  gl: WebGLRenderingContext,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const x1 = x;
  const y1 = y;
  const x2 = x + width;
  const y2 = y + height;
  // prettier-ignore
  const position = new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2,
    ]);
  gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);
};

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasDimensionsRef = useRef<Dimensions>({
    width: window.innerWidth || 300,
    height: window.innerHeight || 150,
  });

  useEffect(() => {
    // ---------------initialization starts-------------------
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    // create the shaders
    const vertexShader = WebGLUtils.createShader(
      gl,
      gl.VERTEX_SHADER,
      simpleVert
    );

    const fragmentShader = WebGLUtils.createShader(
      gl,
      gl.FRAGMENT_SHADER,
      simpleFrag
    );

    const shaderProgram = WebGLUtils.createProgram(
      gl,
      vertexShader,
      fragmentShader
    );

    // look up where the vertex data needs to be sent to
    const positionAttribLocation = gl.getAttribLocation(
      shaderProgram,
      "a_position"
    );

    // look up uniform locations
    const colorUniformLocation = gl.getUniformLocation(
      shaderProgram,
      "u_color"
    );

    const resolutionUniformLocation = gl.getUniformLocation(
      shaderProgram,
      "u_resolution"
    );

    // Create a buffer to put three 2d clip space points in
    const positionBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    WebGLUtils.resizeCanvasToDisplaySize(gl, canvasDimensionsRef.current);

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(shaderProgram);
    gl.enableVertexAttribArray(positionAttribLocation);

    gl.vertexAttribPointer(
      positionAttribLocation,
      2, // size (num values to pull from buffer per iteration)
      gl.FLOAT, // type of data in buffer
      false, // normalize
      0, // stride (0 = compute from size and type above)
      0 // offset in buffer
    );

    gl.uniform2f(
      resolutionUniformLocation,
      canvasDimensionsRef.current.width,
      canvasDimensionsRef.current.height
    );

    // ---------------initialization ends-------------------

    let animationFrameId: number;
    // const draw = () => {
    // WebGLUtils.resizeCanvasToDisplaySize(gl, canvasDimensionsRef.current);

    // gl.clearColor(1, 1, 1, 1);
    // gl.clear(gl.COLOR_BUFFER_BIT);

    // draw the rectangles
    for (let i = 0; i < 50; i++) {
      // set the rectangle data
      writeRectangleDataToBuffer(
        gl,
        NumUtils.randInt(0, canvasDimensionsRef.current.width - 100),
        NumUtils.randInt(0, canvasDimensionsRef.current.height),
        NumUtils.randInt(10, 300),
        NumUtils.randInt(10, 300)
      );
      // set the color
      gl.uniform4f(
        colorUniformLocation,
        Math.random(),
        Math.random(),
        Math.random(),
        1
      );
      const primitiveType = gl.TRIANGLES;
      const count = 6;
      gl.drawArrays(primitiveType, 0, count);
    }

    // animationFrameId = window.requestAnimationFrame(draw);

    // draw();

    const onResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        let width;
        let height;
        let dpr = window.devicePixelRatio;
        if (entry.devicePixelContentBoxSize) {
          // NOTE: Only this path gives the correct answer
          // The other 2 paths are an imperfect fallback
          // for browsers that don't provide anyway to do this
          width = entry.devicePixelContentBoxSize[0].inlineSize;
          height = entry.devicePixelContentBoxSize[0].blockSize;

          console.log("devicePixelContentBoxSize", {
            width,
            height,
          });

          dpr = 1; // it's already in width and height
        } else if (entry.contentBoxSize) {
          if (entry.contentBoxSize[0]) {
            width = entry.contentBoxSize[0].inlineSize;
            height = entry.contentBoxSize[0].blockSize;
          } else {
            // legacy
            // @ts-ignore
            width = entry.contentBoxSize.inlineSize;
            // @ts-ignore
            height = entry.contentBoxSize.blockSize;
          }
        } else {
          // legacy
          width = entry.contentRect.width;
          height = entry.contentRect.height;
        }
        const displayWidth = Math.round(width * dpr);
        const displayHeight = Math.round(height * dpr);
        canvasDimensionsRef.current = {
          width: displayWidth,
          height: displayHeight,
        };
      }
    };
    const resizeObserver = new ResizeObserver(onResize);
    try {
      // only call us of the number of device pixels changed
      resizeObserver.observe(canvas, { box: "device-pixel-content-box" });
    } catch (ex) {
      // device-pixel-content-box is not supported so fallback to this
      resizeObserver.observe(canvas, { box: "content-box" });
    }

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-full h-screen">
      <canvas className="w-full h-full" ref={canvasRef} />
    </div>
  );
}
