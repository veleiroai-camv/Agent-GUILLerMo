import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Code, MessageSquare, Wrench, GitFork, FolderTree } from "lucide-react"
import { cn } from "@/lib/utils"

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

export const CustomNode = memo(({ data, type, selected }: NodeProps) => {
  const nodeType = type as keyof typeof nodeIcons
  const { bg, border, text, shape } = getNodeStyle(nodeType, data.label)

  return (
    <div
      className={cn(
        "min-w-[180px] max-w-[250px] border-2 p-3 shadow-sm transition-all",
        bg,
        border,
        text,
        shape,
        selected && "ring-2 ring-primary ring-offset-2 dark:ring-offset-background",
      )}
    >
      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !rounded-full !border-2 !border-background !bg-primary"
        id="top"
      />

      {/* Left handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !rounded-full !border-2 !border-background !bg-primary"
        id="left"
      />

      <div className="flex items-center gap-2">
        <div className={cn("flex h-6 w-6 items-center justify-center rounded-md bg-background/50")}>
          {nodeIcons[nodeType]}
        </div>
        <div className="truncate font-medium">{data.label}</div>
      </div>

      {data.description && <div className="mt-1 text-xs text-muted-foreground">{data.description}</div>}

      {/* Right handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !rounded-full !border-2 !border-background !bg-primary"
        id="right"
      />

      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !rounded-full !border-2 !border-background !bg-primary"
        id="bottom"
      />
    </div>
  )
})

CustomNode.displayName = "CustomNode"
