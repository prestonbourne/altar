import { useEffect, useState } from 'react';
import { Dimensions } from '@/types';

export const useResizeObserver = (
  ref: React.RefObject<HTMLCanvasElement>
): Dimensions => {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        let width, height, dpr = window.devicePixelRatio;
        
        if (entry.devicePixelContentBoxSize) {
          width = entry.devicePixelContentBoxSize[0].inlineSize;
          height = entry.devicePixelContentBoxSize[0].blockSize;
          dpr = 1;
        } else if (entry.contentBoxSize) {
          if (entry.contentBoxSize[0]) {
            width = entry.contentBoxSize[0].inlineSize;
            height = entry.contentBoxSize[0].blockSize;
          } else {
            width = (entry.contentBoxSize as any).inlineSize;
            height = (entry.contentBoxSize as any).blockSize;
          }
        } else {
          width = entry.contentRect.width;
          height = entry.contentRect.height;
        }

        setDimensions({
          width: Math.round(width * dpr),
          height: Math.round(height * dpr),
        });
      }
    });

    try {
      resizeObserver.observe(ref.current, { box: 'device-pixel-content-box' });
    } catch (ex) {
      resizeObserver.observe(ref.current, { box: 'content-box' });
    }

    return () => resizeObserver.disconnect();
  }, [ref]);

  return dimensions;
};
