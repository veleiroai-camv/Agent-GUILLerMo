"use client"

import { useCallback } from "react"
import { useReactFlow } from "reactflow"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash, Edit, Copy, ArrowUpRight } from "lucide-react"

interface NodeContextMenuProps {
  nodeId: string
  position: { x: number; y: number }
  onClose: () => void
}

export function NodeContextMenu({ nodeId, position, onClose }: NodeContextMenuProps) {
  const { getNode, setNodes, deleteElements } = useReactFlow()

  const node = getNode(nodeId)

  const handleDelete = useCallback(() => {
    deleteElements({ nodes: [{ id: nodeId }] })
    onClose()
  }, [deleteElements, nodeId, onClose])

  const handleEdit = useCallback(() => {
    // Implement node editing logic
    console.log("Edit node:", nodeId)
    onClose()
  }, [nodeId, onClose])

  const handleDuplicate = useCallback(() => {
    if (!node) return

    const position = {
      x: node.position.x + 50,
      y: node.position.y + 50,
    }

    setNodes((nodes) => [
      ...nodes,
      {
        ...node,
        id: `${node.id}-copy`,
        position,
      },
    ])

    onClose()
  }, [node, setNodes, onClose])

  const handleConfigure = useCallback(() => {
    // Implement node configuration logic
    console.log("Configure node:", nodeId)
    onClose()
  }, [nodeId, onClose])

  if (!node) return null

  return (
    <Card
      className="absolute z-10 min-w-40 p-1"
      style={{
        top: position.y,
        left: position.x,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="space-y-1">
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleConfigure}>
          <ArrowUpRight className="mr-2 h-4 w-4" />
          Configure
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={handleDelete}>
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
    </Card>
  )
}
