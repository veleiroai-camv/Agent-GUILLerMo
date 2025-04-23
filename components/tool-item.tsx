"use client"

import type React from "react"

import { Card } from "@/components/ui/card"

interface ToolItemProps {
  name: string
  description: string
  icon: React.ReactNode
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void
}

export function ToolItem({ name, description, icon, onDragStart }: ToolItemProps) {
  return (
    <Card className="cursor-grab p-3 hover:bg-accent" draggable onDragStart={onDragStart}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium">{name}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </Card>
  )
}
