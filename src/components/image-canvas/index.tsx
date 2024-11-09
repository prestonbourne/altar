import { useEffect, useRef } from 'react';

interface ImageCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export function ImageCanvas({ canvasRef }: ImageCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current || !canvasRef.current) return;

      // Get the container's dimensions
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      // Set the canvas display size (CSS)
      canvasRef.current.style.width = '100%';
      canvasRef.current.style.height = '100%';

      // Set the canvas pixel size (actual resolution)
      // Use devicePixelRatio for proper resolution on high DPI displays
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = rect.width * dpr;
      canvasRef.current.height = rect.height * dpr;

      console.log({
        width: canvasRef.current.width,
        height: canvasRef.current.height,
        rectWidth: rect.width,
        rectHeight: rect.height,
        dpr,
      })

    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full"
      style={{
        width: '100%',
        height: '100vh',
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          display: 'block',
        }}
      />
    </div>
  );
}
