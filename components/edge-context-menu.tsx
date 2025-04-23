"use client"

import { useCallback } from "react"
import { useReactFlow } from "reactflow"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash, Edit, ArrowUpRight } from "lucide-react"

interface EdgeContextMenuProps {
  edgeId: string
  position: { x: number; y: number }
  onClose: () => void
}

export function EdgeContextMenu({ edgeId, position, onClose }: EdgeContextMenuProps) {
  const { getEdge, setEdges, deleteElements } = useReactFlow()

  const edge = getEdge(edgeId)

  const handleDelete = useCallback(() => {
    deleteElements({ edges: [{ id: edgeId }] })
    onClose()
  }, [deleteElements, edgeId, onClose])

  const handleEdit = useCallback(() => {
    // Implement edge editing logic
    console.log("Edit edge:", edgeId)
    onClose()
  }, [edgeId, onClose])

  const handleConfigure = useCallback(() => {
    // Implement edge configuration logic
    console.log("Configure edge:", edgeId)
    onClose()
  }, [edgeId, onClose])

  if (!edge) return null

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
          Edit Label
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleConfigure}>
          <ArrowUpRight className="mr-2 h-4 w-4" />
          Configure Condition
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={handleDelete}>
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
    </Card>
  )
}
