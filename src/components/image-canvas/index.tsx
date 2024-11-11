import { ImageProcessor } from "@/lib/image-processor";
import { useEffect } from "react";

interface ImageCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  imageProcessor: ImageProcessor | null;
}
export function ImageCanvas({ canvasRef, imageProcessor }: ImageCanvasProps) {
  useEffect(() => {
    const handleResize = () => {
      imageProcessor?.handleResize();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [imageProcessor]);

  return (
    <div className="w-full h-screen">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
