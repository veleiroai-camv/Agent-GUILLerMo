import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getNodeIcon } from "@/lib/utils"

export const CustomNode = memo(({ data, isConnectable, selected }: NodeProps) => {
  const { label, type } = data
  const icon = getNodeIcon(type)

  return (
    <Card className={`min-w-40 border-2 ${selected ? "border-primary" : "border-border"}`}>
      <CardHeader className="flex flex-row items-center justify-between p-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="text-xs text-muted-foreground">
          {type === "model" && "LLM Model"}
          {type === "tools" && "Agent Tools"}
          {type === "rag" && "Retrieval Augmented Generation"}
          {type === "function" && "Custom Function"}
          {type === "start" && "Start Node"}
          {type === "end" && "End Node"}
        </div>
      </CardContent>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="h-3 w-3 bg-primary" />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="h-3 w-3 bg-primary" />
    </Card>
  )
})

CustomNode.displayName = "CustomNode"
