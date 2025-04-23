"use client"

import type React from "react"

import { useState } from "react"
import { Code, MessageSquare, Wrench, GitFork, FolderTree, ChevronRight, ChevronDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarHeader, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NodePaletteProps {
  onAddNode: (type: string, position?: { x: number; y: number }) => void
  collapsed?: boolean
}

interface NodeItemProps {
  type: string
  label: string
  icon: React.ReactNode
  onAddNode: (type: string) => void
  collapsed?: boolean
}

function NodeItem({ type, label, icon, onAddNode, collapsed }: NodeItemProps) {
  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData("application/langgraph-node", type)
    event.dataTransfer.effectAllowed = "move"
  }

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="mb-2 h-10 w-10"
              draggable
              onDragStart={handleDragStart}
              onClick={() => onAddNode(type)}
            >
              {icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Card
      className="mb-2 cursor-grab bg-card hover:bg-accent"
      draggable
      onDragStart={handleDragStart}
      onClick={() => onAddNode(type)}
    >
      <CardContent className="flex items-center gap-3 p-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </CardContent>
    </Card>
  )
}

export function NodePalette({ onAddNode, collapsed = false }: NodePaletteProps) {
  const [openSections, setOpenSections] = useState({
    basic: true,
    templates: false,
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  if (collapsed) {
    return (
      <div className="flex flex-col items-center p-2">
        <NodeItem type="function" label="Function Node" icon={<Code size={18} />} onAddNode={onAddNode} collapsed />
        <NodeItem type="llm" label="LLM Node" icon={<MessageSquare size={18} />} onAddNode={onAddNode} collapsed />
        <NodeItem type="tool" label="Tool Node" icon={<Wrench size={18} />} onAddNode={onAddNode} collapsed />
        <NodeItem
          type="branch"
          label="Conditional Branch"
          icon={<GitFork size={18} />}
          onAddNode={onAddNode}
          collapsed
        />
        <NodeItem type="subgraph" label="Sub-graph" icon={<FolderTree size={18} />} onAddNode={onAddNode} collapsed />
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-4">
      <SidebarHeader>
        <h2 className="text-lg font-semibold">Add Node</h2>
      </SidebarHeader>

      <Collapsible open={openSections.basic} onOpenChange={() => toggleSection("basic")} className="mb-4">
        <CollapsibleTrigger asChild>
          <SidebarGroup>
            <SidebarGroupLabel className="flex cursor-pointer items-center justify-between">
              <span>Basic Nodes</span>
              {openSections.basic ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </SidebarGroupLabel>
          </SidebarGroup>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <NodeItem type="function" label="Function Node" icon={<Code size={18} />} onAddNode={onAddNode} />
          <NodeItem type="llm" label="LLM Node" icon={<MessageSquare size={18} />} onAddNode={onAddNode} />
          <NodeItem type="tool" label="Tool Node" icon={<Wrench size={18} />} onAddNode={onAddNode} />
          <NodeItem type="branch" label="Conditional Branch" icon={<GitFork size={18} />} onAddNode={onAddNode} />
          <NodeItem type="subgraph" label="Sub-graph" icon={<FolderTree size={18} />} onAddNode={onAddNode} />
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={openSections.templates} onOpenChange={() => toggleSection("templates")}>
        <CollapsibleTrigger asChild>
          <SidebarGroup>
            <SidebarGroupLabel className="flex cursor-pointer items-center justify-between">
              <span>Agent Templates</span>
              {openSections.templates ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </SidebarGroupLabel>
          </SidebarGroup>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <Button
            variant="outline"
            className="w-full justify-start text-left"
            onClick={() => console.log("Adding ReAct Loop template")}
          >
            ReAct Loop
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-left"
            onClick={() => console.log("Adding Planner/Executor template")}
          >
            Planner / Executor
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-left"
            onClick={() => console.log("Adding Router template")}
          >
            Router
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
