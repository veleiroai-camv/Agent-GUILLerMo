"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MoreHorizontal, Trash, Edit, ArrowRight } from "lucide-react"
import type { EdgeData } from "./index"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface EdgeProps {
  edge: EdgeData
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourceHandleId: string
  targetHandleId: string
  onClick: () => void
  onDelete: () => void
  onEdit: () => void
  onReconnect: (end: "source" | "target") => void
  scale: number
  selected: boolean
}

export function Edge({
  edge,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourceHandleId,
  targetHandleId,
  onClick,
  onDelete,
  onEdit,
  onReconnect,
  scale,
  selected,
}: EdgeProps) {
  const isConditional = edge.data?.isConditional || false
  const label = edge.data?.label || ""
  const [showContextMenu, setShowContextMenu] = useState(false)
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const edgeRef = useRef<SVGGElement>(null)

  // Ensure we have valid numbers to prevent NaN
  const validSourceX = isNaN(sourceX) ? 0 : sourceX
  const validSourceY = isNaN(sourceY) ? 0 : sourceY
  const validTargetX = isNaN(targetX) ? 0 : targetX
  const validTargetY = isNaN(targetY) ? 0 : targetY

  // Calculate the direction vector
  const dx = validTargetX - validSourceX
  const dy = validTargetY - validSourceY
  const distance = Math.sqrt(dx * dx + dy * dy)

  // For vertical alignment, use a straight line
  const path = `M ${validSourceX} ${validSourceY} L ${validTargetX} ${validTargetY}`
  const labelX = validSourceX + dx / 2
  const labelY = validSourceY + dy / 2

  // Calculate position for the arrow
  const arrowLength = 10 * scale
  const arrowWidth = 6 * scale

  // Calculate the angle of the line at the target point
  const angle = Math.atan2(dy, dx)

  // Calculate arrow points
  const arrowX1 = validTargetX - arrowLength * Math.cos(angle) + arrowWidth * Math.sin(angle)
  const arrowY1 = validTargetY - arrowLength * Math.sin(angle) - arrowWidth * Math.cos(angle)
  const arrowX2 = validTargetX - arrowLength * Math.cos(angle) - arrowWidth * Math.sin(angle)
  const arrowY2 = validTargetY - arrowLength * Math.sin(angle) + arrowWidth * Math.cos(angle)

  // Determine edge styling based on selection state
  const edgeColor = selected ? "#3b82f6" : isConditional ? "#888" : "#555"
  const edgeWidth = selected ? 3 * scale : 2 * scale
  const edgeDashArray = isConditional ? "5,5" : "none"

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowContextMenu(true)
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClick()
  }

  // Close context menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setShowContextMenu(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [])

  // Add a wider invisible path for better click detection
  return (
    <g
      ref={edgeRef}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={cn("cursor-pointer transition-colors duration-200", selected ? "edge-selected" : "")}
      data-edge-id={edge.id}
    >
      {/* Invisible wider path for better click detection */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={20 * scale}
        style={{ cursor: "pointer" }}
        data-testid={`edge-hit-area-${edge.id}`}
      />

      {/* Visible edge path */}
      <path
        d={path}
        fill="none"
        stroke={edgeColor}
        strokeWidth={edgeWidth}
        strokeDasharray={edgeDashArray}
        className={cn("transition-all duration-200", selected ? "filter drop-shadow-md" : "")}
      />

      {/* Arrow head */}
      <polygon
        points={`${validTargetX},${validTargetY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
        fill={edgeColor}
        className="transition-colors duration-200"
      />

      {/* Edge label */}
      {label && (
        <foreignObject
          x={labelX - 40 * scale}
          y={labelY - 15 * scale}
          width={80 * scale}
          height={30 * scale}
          style={{ pointerEvents: "none" }}
        >
          <div
            className={cn(
              "flex items-center justify-center px-2 py-1 rounded text-xs shadow-sm border transition-colors duration-200",
              selected
                ? "bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700"
                : "bg-white/75 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200",
            )}
            style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
          >
            {label}
          </div>
        </foreignObject>
      )}

      {/* Edge context menu - always render but conditionally show */}
      <foreignObject
        x={labelX - 15}
        y={labelY - 15}
        width={30}
        height={30}
        style={{
          pointerEvents: "all",
          display: selected ? "block" : "none",
          filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
        }}
      >
        <div ref={contextMenuRef} className="h-full w-full flex items-center justify-center">
          <DropdownMenu open={showContextMenu} onOpenChange={setShowContextMenu}>
            <DropdownMenuTrigger asChild>
              <button
                className="h-6 w-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Connection
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onReconnect("source")
                }}
              >
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                Change Source
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onReconnect("target")
                }}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Change Target
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="text-red-600 dark:text-red-400"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Connection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </foreignObject>

      {/* Add insertion point in the middle of the edge */}
      <circle
        cx={labelX}
        cy={labelY}
        r={8 * scale}
        fill="white"
        stroke={selected ? "#3b82f6" : "#888"}
        strokeWidth={1 * scale}
        className="opacity-0 hover:opacity-100 transition-opacity cursor-crosshair"
        data-edge-id={edge.id}
        data-insertion-point="true"
      />
      <circle
        cx={labelX}
        cy={labelY}
        r={3 * scale}
        fill={selected ? "#3b82f6" : "#888"}
        className="opacity-0 hover:opacity-100 transition-opacity cursor-crosshair"
        data-edge-id={edge.id}
        data-insertion-point="true"
      />
    </g>
  )
}
