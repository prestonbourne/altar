import { WORKSPACE_DIMENSIONS } from "@/lib/constants";

interface ImageCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export function ImageCanvas({ canvasRef }: ImageCanvasProps) {
  return (
    <div
      className="w-full h-full overflow-hidden"
      style={{
        width: "100vw",
        height: "100vh",
      }}
    >
      <canvas
        ref={canvasRef}
        width={WORKSPACE_DIMENSIONS.width}
        height={WORKSPACE_DIMENSIONS.height}
        className="w-full h-full"
        style={{
          display: "block",
          height: WORKSPACE_DIMENSIONS.height,
          width: WORKSPACE_DIMENSIONS.width,
        }}
      />
    </div>
  );
}
