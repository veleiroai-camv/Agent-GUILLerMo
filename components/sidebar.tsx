"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  children: React.ReactNode
  className?: string
  side?: "left" | "right"
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ children, className, side = "left", collapsed = false, onToggle }: SidebarProps) {
  return (
    <div className={cn("relative flex h-full flex-col bg-card", className)}>
      <div className="absolute right-2 top-2 z-10">
        {side === "left" && (
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-6 w-6">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <div className="absolute left-2 top-2 z-10">
        {side === "right" && (
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-6 w-6">
            {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
