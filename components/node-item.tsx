"use client"

import type React from "react"

import { Card } from "@/components/ui/card"

interface NodeItemProps {
  label: string
  icon: React.ReactNode
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void
}

export function NodeItem({ label, icon, onDragStart }: NodeItemProps) {
  return (
    <Card
      className="flex cursor-grab items-center gap-2 p-2 text-sm hover:bg-accent"
      draggable
      onDragStart={onDragStart}
    >
      {icon}
      <span>{label}</span>
    </Card>
  )
}
