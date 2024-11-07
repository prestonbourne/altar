"use client";
import React, { useState } from "react";

export function FiltersPanel() {
  const [brightness, setBrightness] = useState(0);

  return (
    <div className="fixed right-0 top-0 h-screen w-64 bg-white shadow-lg p-4">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-700">Image Filters</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brightness
          </label>
          <input
            type="range"
            min="-100"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-sm text-gray-500 mt-1">
            {brightness}
          </div>
        </div>
      </div>
    </div>
  );
}
