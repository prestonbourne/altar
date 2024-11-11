"use client";
import React, { useEffect, useRef, useState } from "react";
import { EditPanel } from "@/components/edit-panel";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ImageProcessor } from "@/lib/image-processor";
import type { AdjustmentUniform, ImageEdits } from "@/types";
import vertexShader from "@/shaders/img/vert.glsl";
import fragmentShader from "@/shaders/img/frag.glsl";
import { ImageCanvas } from "@/components/image-canvas";
import { ErrorDisplay } from "@/components/errror";

const DIVER_IMG =
  "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&q=1000%27";
const LEAVES_IMG = "https://webglfundamentals.org/webgl/resources/leaves.jpg";
const MOUNTAIN_IMG = "https://images.unsplash.com/photo-1727102062617-2b793eec0a50?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgProcessorRef = useRef<ImageProcessor | null>(null);
  const [error, setError] = useState<string | null>(null);


  const [edits, setEdits] = useState<ImageEdits>({
    kernels: {},
    adjustments: {
      u_saturation: {
        label: "Saturation",
        uniformName: "u_saturation",
        currentValue: 1,
        range: { min: 0, max: 5 },
      },
      u_brightness: {
        label: "Brightness",
        uniformName: "u_brightness",
        currentValue: 1,
        range: { min: 0, max: 2 },
      },
      u_hue: {
        label: "Hue",
        uniformName: "u_hue",
        currentValue: 0,
        range: { min: 0, max: 1 },
      },
    },
  });

  const genId = () => crypto.randomUUID();

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      let imgProcessor: ImageProcessor | null = null;
      if (!imgProcessorRef.current) {
        imgProcessor = new ImageProcessor(
          canvasRef.current,
          vertexShader,
          fragmentShader
        );
        imgProcessorRef.current = imgProcessor;

        imgProcessor.loadImage(MOUNTAIN_IMG);
      } else {
        imgProcessor = imgProcessorRef.current;
      }

      const draw = () => {
        imgProcessor.render({
          edits,
          clearColor: { x: 0.95, y: 0.95, z: 0.95 },
        });
        window.requestAnimationFrame(draw);
      };
      draw();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }, [edits]);

  const handleAdjustmentChange = (
    uniformName: AdjustmentUniform,
    value: number
  ) => {
    setEdits((prev) => ({
      ...prev,
      adjustments: {
        ...prev.adjustments,
        [uniformName]: {
          ...prev.adjustments[uniformName],
          currentValue: value,
        },
      },
    }));
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `altar-image-${genId()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  if (error) {
    return <ErrorDisplay error={error} />;
  }


  return (
    <SidebarProvider>
      <EditPanel
        adjustments={edits.adjustments}
        onAdjustmentChange={handleAdjustmentChange}
      />
      <ImageCanvas
        canvasRef={canvasRef}
        imageProcessor={imgProcessorRef.current}
      />
    </SidebarProvider>
  );
}

export default App;
