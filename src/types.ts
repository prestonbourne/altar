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


export type AdjustmentUniform = "u_saturation" | "u_brightness" | "u_hue";

export type UniformName = 
  | AdjustmentUniform
  | "u_image"
  | "u_textureSize"
  | "u_kernel"
  | "u_kernelWeight"
  | "u_resolution"



// Separate types since they have distinct purposes and effects
export type KernelEffect = {
  label: string;
  kernel: number[]; // Convolution matrix for spatial transformations
  weight?: number; // Optional kernel weight
}

export type ColorAdjustment = {
  label: string;
  uniformName: AdjustmentUniform; // Name of the WebGL uniform
  currentValue: number;
  range: { min: number; max: number }; // Valid range for the adjustment
}

export type ColorAdjustmentMap = Record<AdjustmentUniform, ColorAdjustment>;

// Keep them separate in usage
export type ImageEdits = {
  kernels: Record<string, KernelEffect>; // Spatial effects like blur, sharpen
  adjustments: ColorAdjustmentMap; // Color modifications like saturation
};
