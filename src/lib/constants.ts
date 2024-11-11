import type { Dimensions, ImageEdits } from "@/types";

export const APP_NAME = "Altar";
export const APP_VERSION = "Alpha v0.1.0";

export const WORKSPACE_DIMENSIONS: Dimensions = {
  width: 6000,
  height: 3375,
};

export const WORKSPACE_SCALE = 2;

export const IDENTITY_KERNEL = new Float32Array([0, 0, 0, 0, 1, 0, 0, 0, 0]);

export const DEFAULT_EDITS: ImageEdits = {
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
};
