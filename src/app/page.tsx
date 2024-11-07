"use client";
import React, { useEffect, useRef, useState } from "react";
import { Sliders, Image as ImageIcon, Download, Plus, X } from "lucide-react";
import { initWebGL } from "@/lib/webgl/setup";
import { Dimensions, FILTERS } from "@/types";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FxSidebar } from "@/components/fx-sidebar";
import { useResizeObserver } from "@/lib/hooks/use-resize-observer";

interface ActiveFilter {
  id: string;
  name: string;
  intensity: number;
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [error, setError] = useState<string | null>(null);
  const genId = () => crypto.randomUUID();


  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      const cleanup = initWebGL(
        canvasRef.current,
        "https://webglfundamentals.org/webgl/resources/leaves.jpg",
        activeFilters
      );
      return cleanup;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }, [activeFilters]);

  const handleAddFilter = (filterName: string) => {
    // Check if filter already exists
    if (activeFilters.some((f) => f.name === filterName)) {
      return;
    }

    setActiveFilters((prev) => [
      ...prev,
      {
        id: `${filterName}-${genId()}`,
        name: filterName,
        intensity: 1.0,
      },
    ]);
  };

  const handleRemoveFilter = (filterId: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== filterId));
  };

  const handleUpdateIntensity = (filterId: string, intensity: number) => {
    setActiveFilters((prev) =>
      prev.map((f) => (f.id === filterId ? { ...f, intensity } : f))
    );
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `altar-image-${genId()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  // Get list of available filters (excluding already active ones and identity)
  const availableFilters = Object.entries(FILTERS).filter(
    ([key]) => !activeFilters.some((f) => f.name === key) && key !== "identity"
  );

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  //   <SidebarMenuItem className="flex flex-col gap-2 h-12 py-2">
  //   <SidebarMenuButton className="pb-4">
  //     Saturation
  //   </SidebarMenuButton>
  //   <div className="pl-2">
  //     <Slider />
  //   </div>
  // </SidebarMenuItem>

  return (
    <React.Fragment>
      <ImageCanvas canvasRef={canvasRef} dimensions={{ width: 10000, height: 10000 }} />
        {/* <Sidebar
            activeFilters={activeFilters}
            availableFilters={availableFilters}
            onAddFilter={handleAddFilter}
            onRemoveFilter={handleRemoveFilter}
            onUpdateIntensity={handleUpdateIntensity}
            onDownload={handleDownload}
          /> */}
    </React.Fragment>
  );
}

export default App;

// Components
interface ErrorDisplayProps {
  error: string;
}

function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center">
      <div className="rounded-lg p-4 max-w-md">
        <h2 className="text-red-400 font-semibold mb-2">Error</h2>
        <p className="text-gray-300">{error}</p>
      </div>
    </div>
  );
}

interface ImageCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  dimensions: Dimensions;
}

function ImageCanvas({ canvasRef, dimensions }: ImageCanvasProps) {
  console.log(dimensions);
  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      style={{
        width: "100vw",
        height: "100vh",
        display: "block",
      }}
      className="absolute"
    />
  );
}

interface SidebarProps {
  activeFilters: ActiveFilter[];
  availableFilters: [string, any][];
  onAddFilter: (name: string) => void;
  onRemoveFilter: (id: string) => void;
  onUpdateIntensity: (id: string, intensity: number) => void;
  onDownload: () => void;
}

function Sidebar({
  activeFilters,
  availableFilters,
  onAddFilter,
  onRemoveFilter,
  onUpdateIntensity,
  onDownload,
}: SidebarProps) {
  return (
    <div className="space-y-6 p-6 rounded-lg">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-semibold">Active Filters</h2>
        </div>

        <div className="space-y-4">
          {activeFilters.map((filter) => (
            <FilterControl
              key={filter.id}
              filter={filter}
              onRemove={onRemoveFilter}
              onUpdateIntensity={onUpdateIntensity}
            />
          ))}

          {availableFilters.length > 0 && (
            <FilterList filters={availableFilters} onAddFilter={onAddFilter} />
          )}
        </div>
      </div>
      <DownloadButton onClick={onDownload} />
    </div>
  );
}

interface FilterControlProps {
  filter: ActiveFilter;
  onRemove: (id: string) => void;
  onUpdateIntensity: (id: string, intensity: number) => void;
}

function FilterControl({
  filter,
  onRemove,
  onUpdateIntensity,
}: FilterControlProps) {
  return (
    <div className="rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium">{FILTERS[filter.name].label}</span>
        <button
          onClick={() => onRemove(filter.id)}
          className="p-1 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <input
        type="range"
        min="0"
        max="2"
        step="0.1"
        value={filter.intensity}
        onChange={(e) => onUpdateIntensity(filter.id, Number(e.target.value))}
        className="w-full"
      />
      <div className="text-right text-sm mt-1">
        {filter.intensity.toFixed(1)}
      </div>
    </div>
  );
}

interface FilterListProps {
  filters: [string, any][];
  onAddFilter: (name: string) => void;
}

function FilterList({ filters, onAddFilter }: FilterListProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {filters.map(([key, filter]) => (
        <button
          key={key}
          onClick={() => onAddFilter(key)}
          className="flex items-center gap-1 px-3 py-2 
           rounded-lg text-sm transition"
        >
          <Plus className="w-4 h-4" />
          {filter.label}
        </button>
      ))}
    </div>
  );
}

interface DownloadButtonProps {
  onClick: () => void;
}

function DownloadButton({ onClick }: DownloadButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 
        transition px-4 py-2 rounded-lg font-medium text-white"
    >
      <Download className="w-4 h-4" />
      Download Image
    </button>
  );
}
