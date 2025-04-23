"use client"

import { useState, useEffect, useCallback } from "react"
import { LayoutGrid } from "lucide-react"

import { Sidebar } from "@/components/sidebar"
import { Inspector } from "@/components/inspector"
import { Toolbar } from "@/components/toolbar"
import { Console } from "@/components/console/index"
import { NodePalette } from "@/components/node-palette"
import { FlowGraph, type NodeData, type EdgeData } from "@/components/flow-graph"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

// Update the getLayoutedElements function to handle edge cases:
const getLayoutedElements = (nodes: NodeData[], edges: EdgeData[]) => {
  if (!nodes.length) return { nodes, edges }

  // Find all nodes in the path from start to end
  const startNode = nodes.find((n) => n.data.label === "__start__")
  if (!startNode) return { nodes, edges }

  // Perform a topological sort to get the correct order
  const nodeOrder: NodeData[] = []
  const visited = new Set<string>()

  const visit = (nodeId: string) => {
    if (visited.has(nodeId)) return
    visited.add(nodeId)

    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return

    // Find all outgoing edges
    const outgoingEdges = edges.filter((e) => e.source === nodeId)
    for (const edge of outgoingEdges) {
      visit(edge.target)
    }

    nodeOrder.unshift(node)
  }

  visit(startNode.id)

  // Position nodes vertically
  const verticalGap = 120
  const layoutedNodes = nodes.map((node) => {
    const index = nodeOrder.findIndex((n) => n.id === node.id)
    if (index >= 0) {
      return {
        ...node,
        position: {
          x: 250, // Keep all nodes centered
          y: 100 + index * verticalGap,
        },
      }
    }
    return node
  })

  return { nodes: layoutedNodes, edges }
}

export default function LangGraphBuilder() {
  const { toast } = useToast()
  const [showConsole, setShowConsole] = useState(false)
  const [selectedElement, setSelectedElement] = useState<{ type: "node" | "edge"; data: any } | null>(null)
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false)
  const [nodes, setNodes] = useState<NodeData[]>([])
  const [edges, setEdges] = useState<EdgeData[]>([])

  // Initialize with default start and end nodes that are closer together
  useEffect(() => {
    if (nodes.length === 0) {
      const initialNodes: NodeData[] = [
        {
          id: "start-node",
          type: "function",
          position: { x: 250, y: 100 }, // Positioned closer to the center
          data: {
            label: "__start__",
            description: "Entry point of the graph",
            outputs: ["output"],
          },
        },
        {
          id: "end-node",
          type: "function",
          position: { x: 250, y: 220 }, // Positioned closer to the start node
          data: {
            label: "__end__",
            description: "Exit point of the graph",
            outputs: [],
          },
        },
      ]

      const initialEdges: EdgeData[] = [
        {
          id: "edge-start-end",
          source: "start-node",
          target: "end-node",
          sourceHandle: "bottom",
          targetHandle: "top",
          data: { label: "flow", isConditional: false },
        },
      ]

      // Apply layout to initial nodes and edges
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges)

      setNodes(layoutedNodes)
      setEdges(layoutedEdges)
    }
  }, [])

  const onConnect = useCallback(
    (params: { source: string; target: string; sourceHandle: string; targetHandle: string }) => {
      // Create a new edge with a default label
      const newEdge: EdgeData = {
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        data: { label: "flow", isConditional: false },
      }

      setEdges((eds) => [...eds, newEdge])

      toast({
        title: "Connection Created",
        description: "A new connection has been created between the nodes.",
      })

      // Auto-layout after adding a new connection
      setTimeout(() => {
        onLayout()
      }, 50)
    },
    [toast],
  )

  const handleUpdateEdge = useCallback(
    (edgeId: string, data: any) => {
      setEdges((eds) => eds.map((edge) => (edge.id === edgeId ? { ...edge, data: { ...edge.data, ...data } } : edge)))

      toast({
        title: "Connection Updated",
        description: "The connection properties have been updated.",
      })

      // Keep the edge selected after update
      setSelectedElement((prev) => {
        if (prev?.type === "edge" && prev.data.id === edgeId) {
          const updatedEdge = edges.find((e) => e.id === edgeId)
          if (updatedEdge) {
            return {
              type: "edge",
              data: { ...updatedEdge, data: { ...updatedEdge.data, ...data } },
            }
          }
        }
        return prev
      })
    },
    [toast, edges, setSelectedElement],
  )

  const handleGeneratePython = () => {
    toast({
      title: "Python Code Generated",
      description: "Code has been copied to clipboard",
    })
    console.log("Generating Python code...")
  }

  const handleRunGraph = () => {
    setShowConsole(true)
    toast({
      title: "Graph Execution Started",
      description: "Check the console for execution details",
    })
    console.log("Running graph...")
  }

  const handleAddNode = (type: string, position?: { x: number; y: number }) => {
    // Create a new node
    const newNode: NodeData = {
      id: `node-${Date.now()}`,
      type,
      position: position || { x: 250, y: 150 },
      data: {
        label: type.charAt(0).toUpperCase() + type.slice(1),
        description: `A ${type} node`,
        outputs: ["output"],
      },
    }

    // Add the new node
    setNodes((nds) => [...nds, newNode])

    // Find start and end nodes
    const startNode = nodes.find((node) => node.data.label === "__start__")
    const endNode = nodes.find((node) => node.data.label === "__end__")

    if (startNode && endNode) {
      // Remove direct connection between start and end if it exists
      setEdges((eds) => eds.filter((edge) => !(edge.source === startNode.id && edge.target === endNode.id)))

      // Add connections from start to new node and from new node to end
      const newEdges: EdgeData[] = [
        {
          id: `edge-${startNode.id}-${newNode.id}`,
          source: startNode.id,
          target: newNode.id,
          sourceHandle: "bottom",
          targetHandle: "top",
          data: { label: type.toUpperCase(), isConditional: false },
        },
        {
          id: `edge-${newNode.id}-${endNode.id}`,
          source: newNode.id,
          target: endNode.id,
          sourceHandle: "bottom",
          targetHandle: "top",
          data: { label: "output", isConditional: false },
        },
      ]

      setEdges((eds) => [...eds, ...newEdges])

      // Auto-layout after adding the new node
      setTimeout(() => {
        onLayout()
      }, 50)
    }
  }

  const toggleLeftSidebar = () => {
    setLeftSidebarCollapsed(!leftSidebarCollapsed)
  }

  const toggleRightSidebar = () => {
    setRightSidebarCollapsed(!rightSidebarCollapsed)
  }

  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges)
    setNodes([...layoutedNodes])
  }, [nodes, edges])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="langgraph-theme">
      <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
        <Toolbar onGeneratePython={handleGeneratePython} onRunGraph={handleRunGraph} />

        <div className="flex flex-1 overflow-hidden">
          <SidebarProvider>
            {/* Left Sidebar - Node Palette */}
            <Sidebar
              side="left"
              className={`transition-all duration-300 ${leftSidebarCollapsed ? "w-12" : "w-60"}`}
              collapsed={leftSidebarCollapsed}
              onToggle={toggleLeftSidebar}
            >
              <NodePalette onAddNode={handleAddNode} collapsed={leftSidebarCollapsed} />
            </Sidebar>

            {/* Main Canvas */}
            <div className="relative flex-1">
              <FlowGraph
                nodes={nodes}
                edges={edges}
                onNodesChange={setNodes}
                onEdgesChange={setEdges}
                onNodeClick={(node) => setSelectedElement({ type: "node", data: node })}
                onEdgeClick={(edge) => setSelectedElement({ type: "edge", data: edge })}
                onPaneClick={() => setSelectedElement(null)}
                onConnect={onConnect}
                className="h-full w-full"
              />

              <div className="absolute right-4 top-4">
                <Button variant="outline" onClick={onLayout} className="flex items-center gap-2">
                  <LayoutGrid size={16} />
                  Auto Layout
                </Button>
              </div>

              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={() => setShowConsole(!showConsole)}
                  className="rounded-t-md bg-primary px-4 py-1 text-sm text-primary-foreground shadow-md"
                >
                  {showConsole ? "Hide Console" : "Show Console"}
                </button>
              </div>
            </div>

            {/* Right Sidebar - Inspector */}
            <Sidebar
              side="right"
              className={`transition-all duration-300 ${rightSidebarCollapsed ? "w-12" : "w-[300px]"}`}
              collapsed={rightSidebarCollapsed}
              onToggle={toggleRightSidebar}
            >
              <Inspector
                selectedElement={selectedElement}
                collapsed={rightSidebarCollapsed}
                onUpdateEdge={handleUpdateEdge}
              />
            </Sidebar>
          </SidebarProvider>
        </div>

        {/* Bottom Console Drawer */}
        {showConsole && <Console className="h-64 border-t" onClose={() => setShowConsole(false)} />}

        <Toaster />
      </div>
    </ThemeProvider>
  )
}
