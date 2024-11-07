import { Filter } from "@/types";

// prettier-ignore
export const FILTERS: Record<string, Filter> = {
    gaussianBlur: {
      label: 'Gaussian Blur',
      type: 'kernel',
      kernel: [
        0.045, 0.122, 0.045,
        0.122, 0.332, 0.122,
        0.045, 0.122, 0.045
      ]
    },
    sharpen: {
      label: 'Sharpen',
      type: 'kernel',
      kernel: [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
      ]
    },
    edgeDetection: {
      label: 'Edge Detection',
      type: "kernel",
      kernel: [
        -1, -1, -1,
        -1,  8, -1,
        -1, -1, -1,
      ]
    },
  emboss: {
    label: "Emboss",
    type: "kernel",
    kernel: [
        -2, -1,  0,
        -1,  1,  1,
        0,  1,  2
      ]
    },
  saturation: {
    label: "Saturation",
    type: "color",
    uniforms: {
        u_saturation: 1.0
      }
  },
};
