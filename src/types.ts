export const BLEND_MODE = {
  NORMAL: "normal",
  MULTIPLY: "multiply",
  SCREEN: "screen",
  OVERLAY: "overlay",
  DARKEN: "darken",
  LIGHTEN: "lighten",
  COLOR_DODGE: "color-dodge",
  COLOR_BURN: "color-burn",
  HARD_LIGHT: "hard-light",
  SOFT_LIGHT: "soft-light",
  DIFFERENCE: "difference",
  EXCLUSION: "exclusion",
} as const;

export type BlendMode = (typeof BLEND_MODE)[keyof typeof BLEND_MODE];

export const OPERATION = {
  CREATE_LAYER: "CREATE_LAYER",
  REMOVE_LAYER: "REMOVE_LAYER",
  UPDATE_LAYER: "UPDATE_LAYER",
  SET_SELECTED_LAYER: "SET_SELECTED_LAYER",
  SET_ZOOM: "SET_ZOOM",
  SET_PAN_OFFSET: "SET_PAN_OFFSET",
  SET_CANVAS_DIMENSIONS: "SET_CANVAS_DIMENSIONS",
  CREATE_GROUP: "CREATE_GROUP",
  UNDO: "UNDO",
  REDO: "REDO",
} as const;

export type CreateLayerOperation = {
  type: "CREATE_LAYER";
  payload: AddLayerPayload;
};
export type RemoveLayerOperation = {
  type: "REMOVE_LAYER";
  payload: RemoveLayerPayload;
};
export type UpdateLayerOperation = {
  type: "UPDATE_LAYER";
  payload: UpdateLayerPayload;
};
export type SetSelectedLayerOperation = {
  type: "SET_SELECTED_LAYER";
  payload: SetSelectedLayerPayload;
};
export type SetZoomOperation = { type: "SET_ZOOM"; payload: SetZoomPayload };
export type SetPanOffsetOperation = {
  type: "SET_PAN_OFFSET";
  payload: SetPanOffsetPayload;
};
export type SetCanvasDimensionsOperation = {
  type: "SET_CANVAS_DIMENSIONS";
  payload: SetCanvasDimensionsPayload;
};
export type CreateGroupOperation = {
  type: "CREATE_GROUP";
  payload: CreateGroupPayload;
};
export type UndoOperation = { type: "UNDO" };
export type RedoOperation = { type: "REDO" };

export type Operation =
  | CreateLayerOperation
  | RemoveLayerOperation
  | UpdateLayerOperation
  | SetSelectedLayerOperation
  | SetZoomOperation
  | SetPanOffsetOperation
  | SetCanvasDimensionsOperation
  | CreateGroupOperation
  | UndoOperation
  | RedoOperation;

export type OperationType = Operation["type"];

export type ShapePrimitive = "rectangle" | "ellipse" | "polygon";
export type GraphicsLibrary = "webgl" | "webgpu";
export type Dimensions = {
  width: number;
  height: number;
};

export interface Layer {
  id: string;
  name: string;
  parentId: string | null;
  children: Layer[];
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  dimensions: Dimensions;
  transform: Transform2D;
  coordinates: Vector2D;
  bounds: Bounds;
}

export interface ShaderLayer extends Layer {
  vertexShader: string;
  fragmentShader: string;
}

export type Vector2D = {
  x: number;
  y: number;
};

export type Vector3D = {
  x: number;
  y: number;
  z: number;
};

export type Transform2D = {
  position: Vector2D;
  rotationDeg: number;
  scale: Vector2D;
  origin: Vector2D;
};

export type Bounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type Viewport = {
  bounds: Bounds;
  zoom: number;
  panOffset: Vector2D;
};

export type AddLayerPayload = { layer: Layer };
export type RemoveLayerPayload = { layerId: string };
export type UpdateLayerPayload = { layerId: string; updates: Partial<Layer> };
export type SetSelectedLayerPayload = { layerId: string | null };
export type SetZoomPayload = { zoom: number };
export type SetPanOffsetPayload = { offset: { x: number; y: number } };
export type SetCanvasDimensionsPayload = {
  dimensions: { width: number; height: number };
};
export type CreateGroupPayload = { name: string; layers: Layer[] };

export type CanvasOperation =
  | CreateLayerOperation
  | RemoveLayerOperation
  | UpdateLayerOperation
  | SetSelectedLayerOperation
  | SetZoomOperation
  | SetPanOffsetOperation
  | SetCanvasDimensionsOperation
  | CreateGroupOperation;

export type OperationWithPayload = Exclude<
  Operation,
  { type: typeof OPERATION.UNDO | typeof OPERATION.REDO }
>;
export type OperationPayload<T extends OperationType> = Extract<
  OperationWithPayload,
  { type: T }
>["payload"];

export type OperationRecord = {
  id: string;
  timestamp: number;
  bounds?: Bounds;
  operation: Operation;
};

export interface Filter {
  label:
    | "Identity"
    | "Gaussian Blur"
    | "Sharpen"
    | "Edge Detection"
    | "Emboss"
    | "Saturation";

  kernel?: number[];
  type: "kernel" | "color";
  uniforms?: Record<string, number>;
}

export const FILTERS: Record<string, Filter> = {
  identity: {
    label: "Identity",
    type: "kernel",
    kernel: [
      0, 0, 0,
      0, 1, 0,
      0, 0, 0
    ],
  },
  gaussianBlur: {
    label: "Gaussian Blur",
    type: "kernel",
    kernel: [
      0.045, 0.122, 0.045,
      0.122, 0.332, 0.122,
      0.045, 0.122, 0.045
    ],
  },
  sharpen: {
    label: "Sharpen",
    type: "kernel",
    kernel: [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0,
    ],
  },
  edgeDetection: {
    label: "Edge Detection",
    type: "kernel",
    kernel: [
      -1, -1, -1,
      -1,  8, -1,
      -1, -1, -1,
    ],
  },
  emboss: {
    label: "Emboss",
    type: "kernel",
    kernel: [
      -2, -1, 0,
      -1,  1, 1,
       0,  1, 2,
    ],
  },
  saturation: {
    label: "Saturation",
    type: "color",
    uniforms: {
      u_saturation: 1.0,
    },
  },
};
