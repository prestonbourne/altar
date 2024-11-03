"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import simpleFrag from "@/shaders/simple_frag.glsl";
import simpleVert from "@/shaders/simple_vert.glsl";
import * as WebGLUtils from "@/lib/webgl-utils";
import { Dimensions } from "@/types";
import * as NumUtils from "@/lib/num-utils";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    // Create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, simpleVert);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, simpleFrag);
    gl.compileShader(fragmentShader);

    // Create program
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Look up where the vertex data needs to go.
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    const colorUniformLocation = gl.getUniformLocation(program, "u_color");

    // Create a buffer to put positions in
    const positionBuffer = gl.createBuffer();
    
    // Bind it to ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Tell the attribute how to get data out of positionBuffer
    gl.vertexAttribPointer(
      positionAttributeLocation,
      2,          // size (num values to pull from buffer per iteration)
      gl.FLOAT,   // type of data in buffer
      false,      // normalize
      0,          // stride (0 = compute from size and type above)
      0,          // offset in buffer
    );

    // Set the resolution
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    // Draw 50 random rectangles
    for (let i = 0; i < 50; ++i) {
      // Set a random rectangle
      setRectangle(
        gl,
        randomInt(300),
        randomInt(300),
        randomInt(300),
        randomInt(300)
      );

      // Set a random color
      gl.uniform4f(
        colorUniformLocation,
        Math.random(),
        Math.random(),
        Math.random(),
        1
      );

      // Draw the rectangle
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <canvas 
        ref={canvasRef} 
        className="w-full" 
      />
    </div>
  );
}

// Helper functions
function randomInt(range: number) {
  return Math.floor(Math.random() * range);
}

function setRectangle(
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

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
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