import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, GalleryVerticalEnd } from "lucide-react";
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
import { Button } from "@/components/ui/button";

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
  onReset: () => void;
  onDownload: () => void;
}

// Main EditPanel component
export const EditPanel = ({
  adjustments,
  onAdjustmentChange,
  onReset,
  onDownload,
}: EditPanelProps) => {
  return (
    <Sidebar variant="floating" className="w-64">
      <SidebarHeader>
        <span className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-12 text-sm group-data-[collapsible=icon]:!p-0 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-semibold">Altar</span>
            <span className="text-sm">Early Alpha 0.0.1</span>
          </div>
        </span>
      </SidebarHeader>
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
      <SidebarFooter>
        <Button variant="outline" onClick={onReset}>
          Reset
        </Button>
        <Button onClick={onDownload}>Download</Button>
      </SidebarFooter>
    </Sidebar>
  );
};
