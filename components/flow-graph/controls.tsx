"use client"

import { Plus, Minus, Maximize } from "lucide-react"
import { cn } from "@/lib/utils"

interface ControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  className?: string
}

export function Controls({ onZoomIn, onZoomOut, onFitView, className }: ControlsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 bg-white p-1 rounded-md shadow-md border border-gray-200 dark:bg-gray-800 dark:border-gray-700",
        className,
      )}
    >
      <button className="p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-700" onClick={onZoomIn} title="Zoom in">
        <Plus className="h-4 w-4" />
      </button>
      <button className="p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-700" onClick={onZoomOut} title="Zoom out">
        <Minus className="h-4 w-4" />
      </button>
      <button className="p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-700" onClick={onFitView} title="Fit view">
        <Maximize className="h-4 w-4" />
      </button>
    </div>
  )
}
