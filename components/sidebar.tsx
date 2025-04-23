"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NodeItem } from "@/components/node-item"
import { ToolItem } from "@/components/tool-item"
import {
  Brain,
  Database,
  MessageSquare,
  Search,
  Workflow,
  PenToolIcon as Tool,
  ArrowRightLeft,
  Cpu,
  FileText,
  Wrench,
} from "lucide-react"

export function Sidebar() {
  const [activeTab, setActiveTab] = useState("nodes")

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <div className="w-64 border-r bg-background">
      <Tabs defaultValue="nodes" className="h-full flex flex-col">
        <div className="border-b px-4 py-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nodes">Nodes</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
          </TabsList>
        </div>
        <ScrollArea className="flex-1 p-4">
          <TabsContent value="nodes" className="mt-0 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Basic Nodes</h3>
              <div className="grid grid-cols-2 gap-2">
                <NodeItem
                  label="Start"
                  icon={<Workflow className="h-4 w-4" />}
                  onDragStart={(e) => onDragStart(e, "start")}
                />
                <NodeItem
                  label="End"
                  icon={<Workflow className="h-4 w-4" />}
                  onDragStart={(e) => onDragStart(e, "end")}
                />
                <NodeItem
                  label="Model"
                  icon={<Brain className="h-4 w-4" />}
                  onDragStart={(e) => onDragStart(e, "model")}
                />
                <NodeItem
                  label="Tools"
                  icon={<Tool className="h-4 w-4" />}
                  onDragStart={(e) => onDragStart(e, "tools")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">LangChain Nodes</h3>
              <div className="grid grid-cols-2 gap-2">
                <NodeItem
                  label="RAG"
                  icon={<Database className="h-4 w-4" />}
                  onDragStart={(e) => onDragStart(e, "rag")}
                />
                <NodeItem
                  label="Chat"
                  icon={<MessageSquare className="h-4 w-4" />}
                  onDragStart={(e) => onDragStart(e, "chat")}
                />
                <NodeItem
                  label="Retriever"
                  icon={<Search className="h-4 w-4" />}
                  onDragStart={(e) => onDragStart(e, "retriever")}
                />
                <NodeItem
                  label="Router"
                  icon={<ArrowRightLeft className="h-4 w-4" />}
                  onDragStart={(e) => onDragStart(e, "router")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Custom Nodes</h3>
              <div className="grid grid-cols-2 gap-2">
                <NodeItem
                  label="Function"
                  icon={<Cpu className="h-4 w-4" />}
                  onDragStart={(e) => onDragStart(e, "function")}
                />
                <NodeItem
                  label="Prompt"
                  icon={<FileText className="h-4 w-4" />}
                  onDragStart={(e) => onDragStart(e, "prompt")}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="tools" className="mt-0 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Available Tools</h3>
              <div className="space-y-2">
                <ToolItem
                  name="Web Search"
                  description="Search the web for information"
                  icon={<Search className="h-4 w-4" />}
                  onDragStart={(e) => onDragStart(e, "web_search_tool")}
                />
                <ToolItem
                  name="Calculator"
                  description="Perform mathematical calculations"
                  icon={<Cpu className="h-4 w-4" />}
                  onDragStart={(e) => onDragStart(e, "calculator_tool")}
                />
                <ToolItem
                  name="Document Loader"
                  description="Load documents from various sources"
                  icon={<FileText className="h-4 w-4" />}
                  onDragStart={(e) => onDragStart(e, "document_loader_tool")}
                />
                <ToolItem
                  name="API Call"
                  description="Make API calls to external services"
                  icon={<Wrench className="h-4 w-4" />}
                  onDragStart={(e) => onDragStart(e, "api_call_tool")}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="config" className="mt-0 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Graph Configuration</h3>
              <div className="space-y-2">
                {/* Configuration options will go here */}
                <p className="text-sm text-muted-foreground">Configure global settings for your LangGraph here.</p>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
