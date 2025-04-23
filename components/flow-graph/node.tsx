"use client"

import type React from "react"

import { Code, MessageSquare, Wrench, GitFork, FolderTree } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NodeData } from "./index"

// Node type icons
const nodeIcons = {
  function: <Code className="h-4 w-4" />,
  llm: <MessageSquare className="h-4 w-4" />,
  tool: <Wrench className="h-4 w-4" />,
  branch: <GitFork className="h-4 w-4" />,
  subgraph: <FolderTree className="h-4 w-4" />,
}

// Node type colors
const nodeColors = {
  function: {
    bg: "bg-blue-100 dark:bg-blue-950",
    border: "border-blue-300 dark:border-blue-800",
    text: "text-blue-900 dark:text-blue-100",
  },
  llm: {
    bg: "bg-purple-100 dark:bg-purple-950",
    border: "border-purple-300 dark:border-purple-800",
    text: "text-purple-900 dark:text-purple-100",
  },
  tool: {
    bg: "bg-amber-100 dark:bg-amber-950",
    border: "border-amber-300 dark:border-amber-800",
    text: "text-amber-900 dark:text-amber-100",
  },
  branch: {
    bg: "bg-green-100 dark:bg-green-950",
    border: "border-green-300 dark:border-green-800",
    text: "text-green-900 dark:text-green-100",
  },
  subgraph: {
    bg: "bg-gray-100 dark:bg-gray-900",
    border: "border-gray-300 dark:border-gray-700",
    text: "text-gray-900 dark:text-gray-100",
  },
}

// Special styling for start and end nodes
const getNodeStyle = (type: string, label: string) => {
  if (label === "__start__") {
    return {
      bg: "bg-indigo-100 dark:bg-indigo-950",
      border: "border-indigo-300 dark:border-indigo-800",
      text: "text-indigo-900 dark:text-indigo-100",
      shape: "rounded-md",
    }
  }

  if (label === "__end__") {
    return {
      bg: "bg-indigo-100 dark:bg-indigo-950",
      border: "border-indigo-300 dark:border-indigo-800",
      text: "text-indigo-900 dark:text-indigo-100",
      shape: "rounded-md",
    }
  }

  return {
    bg: nodeColors[type as keyof typeof nodeColors]?.bg || "bg-card",
    border: nodeColors[type as keyof typeof nodeColors]?.border || "border-border",
    text: nodeColors[type as keyof typeof nodeColors]?.text || "text-foreground",
    shape: "rounded-2xl",
  }
}

interface NodeProps {
  node: NodeData
  position: { x: number; y: number }
  onDragStart: () => void
  onClick: () => void
  onConnectStart: (handleId: string, position: { x: number; y: number }) => void
  onConnectEnd: (handleId: string) => void
  selected?: boolean
}

export function Node({
  node,
  position,
  onDragStart,
  onClick,
  onConnectStart,
  onConnectEnd,
  selected = false,
}: NodeProps) {
  const { bg, border, text, shape } = getNodeStyle(node.type, node.data.label)
  const nodeWidth = 200
  const nodeHeight = 80

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDragStart()
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick()
  }

  const handleConnectorMouseDown = (e: React.MouseEvent, handleId: string) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    onConnectStart(handleId, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
  }

  const handleConnectorMouseUp = (e: React.MouseEvent, handleId: string) => {
    e.stopPropagation()
    onConnectEnd(handleId)
  }

  return (
    <div
      className={cn(
        "absolute flex flex-col min-w-[200px] max-w-[250px] border-2 p-3 shadow-sm cursor-move",
        bg,
        border,
        text,
        shape,
        selected && "ring-2 ring-primary",
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${nodeWidth}px`,
        height: `${nodeHeight}px`,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      data-node-id={node.id}
    >
      {/* Connection handles with improved visual feedback */}
      <div
        className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-crosshair z-10 hover:scale-125 hover:ring-2 hover:ring-primary-foreground transition-transform"
        onMouseDown={(e) => handleConnectorMouseDown(e, "top")}
        onMouseUp={(e) => handleConnectorMouseUp(e, "top")}
        data-handle-id="top"
        data-node-id={node.id}
        title="Connect from top"
      />
      <div
        className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-crosshair z-10 hover:scale-125 hover:ring-2 hover:ring-primary-foreground transition-transform"
        onMouseDown={(e) => handleConnectorMouseDown(e, "right")}
        onMouseUp={(e) => handleConnectorMouseUp(e, "right")}
        data-handle-id="right"
        data-node-id={node.id}
        title="Connect from right"
      />
      <div
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-crosshair z-10 hover:scale-125 hover:ring-2 hover:ring-primary-foreground transition-transform"
        onMouseDown={(e) => handleConnectorMouseDown(e, "bottom")}
        onMouseUp={(e) => handleConnectorMouseUp(e, "bottom")}
        data-handle-id="bottom"
        data-node-id={node.id}
        title="Connect from bottom"
      />
      <div
        className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-crosshair z-10 hover:scale-125 hover:ring-2 hover:ring-primary-foreground transition-transform"
        onMouseDown={(e) => handleConnectorMouseDown(e, "left")}
        onMouseUp={(e) => handleConnectorMouseUp(e, "left")}
        data-handle-id="left"
        data-node-id={node.id}
        title="Connect from left"
      />

      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-background/50">
          {nodeIcons[node.type as keyof typeof nodeIcons]}
        </div>
        <div className="truncate font-medium">{node.data.label}</div>
      </div>

      {node.data.description && <div className="mt-1 text-xs text-muted-foreground">{node.data.description}</div>}
    </div>
  )
}
