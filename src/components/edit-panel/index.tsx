import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, X } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type {
  AdjustmentUniform,
  ColorAdjustment,
  ColorAdjustmentMap,
} from "@/types";

// AdjustmentSlider component
const AdjustmentSlider = ({
  value,
  onChange,
  min = 0,
  max = 1,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) => (
  <Slider
    min={min}
    max={max}
    step={0.01}
    value={[value]}
    onValueChange={(values) => onChange(values[0])}
    className="w-48"
  />
);

// Individual adjustment item component
const AdjustmentItem = ({
  adjustment,
  value,
  onChange,
}: {
  adjustment: ColorAdjustment;
  value: number;
  onChange: (value: number) => void;
}) => (
  <Collapsible>
    <CollapsibleTrigger asChild>
      <SidebarMenuButton className="w-full flex items-center justify-between">
        <span>{adjustment.label}</span>
        <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
      </SidebarMenuButton>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <div className="p-2">
        <AdjustmentSlider
          value={value}
          onChange={onChange}
          min={adjustment.range.min}
          max={adjustment.range.max}
        />
      </div>
    </CollapsibleContent>
  </Collapsible>
);

interface AdjustmentSectionProps {
  title: string;
  type: "kernel" | "color";
  adjustments: ColorAdjustmentMap;
  onAdjustmentChange: (uniformName: AdjustmentUniform, value: number) => void;
}

// AdjustmentSection component
const AdjustmentSection = ({
  title,
  type,
  adjustments,
  onAdjustmentChange,
}: AdjustmentSectionProps) => {
  const sectionAdjustments = Object.entries(adjustments).filter(
    ([uniformName]) =>
      uniformName.startsWith(type === "kernel" ? "u_kernel" : "u_")
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {sectionAdjustments.map(([uniformName, adjustment]) => (
            <SidebarMenuItem key={uniformName}>
              <AdjustmentItem
                adjustment={adjustment}
                value={adjustment.currentValue}
                onChange={(value) => {
                  console.log({ adjustment });
                  onAdjustmentChange(adjustment.uniformName, value);
                }}
              />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

interface EditPanelProps {
  adjustments: ColorAdjustmentMap;
  onAdjustmentChange: (uniformName: AdjustmentUniform, value: number) => void;
}

// Main EditPanel component
export const EditPanel = ({
  adjustments,
  onAdjustmentChange,
}: EditPanelProps) => {
  return (
    <Sidebar variant="floating" className="w-64">
      <SidebarContent>
        <AdjustmentSection
          title="Adjustments"
          type="color"
          adjustments={adjustments}
          onAdjustmentChange={onAdjustmentChange}
        />
        <AdjustmentSection
          title="FX"
          type="kernel"
          adjustments={adjustments}
          onAdjustmentChange={onAdjustmentChange}
        />
      </SidebarContent>
    </Sidebar>
  );
};
