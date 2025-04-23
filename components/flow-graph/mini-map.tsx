"use client"

import type React from "react"

import { useRef } from "react"
import { cn } from "@/lib/utils"
import type { NodeData } from "./index"

interface MiniMapProps {
  nodes: NodeData[]
  position: { x: number; y: number }
  scale: number
  onPositionChange: (position: { x: number; y: number }) => void
  className?: string
}

export function MiniMap({ nodes, position, scale, onPositionChange, className }: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  // Calculate bounds of all nodes with padding
  const padding = 100
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  nodes.forEach((node) => {
    minX = Math.min(minX, node.position.x)
    minY = Math.min(minY, node.position.y)
    maxX = Math.max(maxX, node.position.x + 200) // Assuming node width
    maxY = Math.max(maxY, node.position.y + 80) // Assuming node height
  })

  // Add padding
  minX -= padding
  minY -= padding
  maxX += padding
  maxY += padding

  const graphWidth = maxX - minX
  const graphHeight = maxY - minY

  // Handle minimap interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    isDragging.current = true

    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    // Calculate new position
    const newX = -x * graphWidth + containerRef.current.clientWidth / 2 / scale
    const newY = -y * graphHeight + containerRef.current.clientHeight / 2 / scale

    onPositionChange({ x: newX, y: newY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    // Calculate new position
    const newX = -x * graphWidth + containerRef.current.clientWidth / 2 / scale
    const newY = -y * graphHeight + containerRef.current.clientHeight / 2 / scale

    onPositionChange({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  // Calculate viewport rectangle in minimap coordinates
  const viewportWidth = containerRef.current ? containerRef.current.clientWidth / scale : 0
  const viewportHeight = containerRef.current ? containerRef.current.clientHeight / scale : 0

  // Ensure we have valid values for the viewport position
  const viewportX = graphWidth > 0 ? Math.max(0, Math.min(1, (-position.x - minX) / graphWidth)) : 0
  const viewportY = graphHeight > 0 ? Math.max(0, Math.min(1, (-position.y - minY) / graphHeight)) : 0
  const viewportW = graphWidth > 0 ? Math.min(1, viewportWidth / graphWidth) : 0
  const viewportH = graphHeight > 0 ? Math.min(1, viewportHeight / graphHeight) : 0

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-white rounded-md shadow-md border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700",
        className,
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Grid background for minimap */}
      <svg className="absolute left-0 top-0 h-full w-full pointer-events-none">
        <defs>
          <pattern id="mini-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0, 0, 0, 0.05)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mini-grid)" />
      </svg>

      {/* Nodes */}
      {nodes.map((node) => {
        const nodeX = (node.position.x - minX) / graphWidth
        const nodeY = (node.position.y - minY) / graphHeight
        const nodeWidth = 200 / graphWidth
        const nodeHeight = 80 / graphHeight

        let bgColor = "#e2e8f0"
        if (node.type === "llm") bgColor = "#e9d5ff"
        else if (node.type === "function") bgColor = "#bfdbfe"
        else if (node.type === "tool") bgColor = "#fef3c7"
        else if (node.type === "branch") bgColor = "#bbf7d0"
        else if (node.type === "subgraph") bgColor = "#f3f4f6"

        if (node.data.label === "__start__" || node.data.label === "__end__") {
          bgColor = "#c7d2fe"
        }

        return (
          <div
            key={node.id}
            className="absolute border border-gray-300 dark:border-gray-600"
            style={{
              left: `${nodeX * 100}%`,
              top: `${nodeY * 100}%`,
              width: `${nodeWidth * 100}%`,
              height: `${nodeHeight * 100}%`,
              backgroundColor: bgColor,
            }}
          />
        )
      })}

      {/* Viewport rectangle */}
      <div
        className="absolute border-2 border-blue-500 pointer-events-none"
        style={{
          left: `${viewportX * 100}%`,
          top: `${viewportY * 100}%`,
          width: `${viewportW * 100}%`,
          height: `${viewportH * 100}%`,
        }}
      />
    </div>
  )
}
