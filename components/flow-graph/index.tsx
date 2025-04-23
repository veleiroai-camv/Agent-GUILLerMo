"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Node } from "./node"
import { Edge } from "./edge"
import { Controls } from "./controls"
import { MiniMap } from "./mini-map"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle } from "lucide-react"

export type NodeData = {
  id: string
  type: string
  position: { x: number; y: number }
  data: {
    label: string
    description?: string
    outputs?: string[]
    [key: string]: any
  }
}

export type EdgeData = {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  data?: {
    label?: string
    isConditional?: boolean
    sourceOutput?: string
    targetInput?: string
    condition?: string
    [key: string]: any
  }
}

interface FlowGraphProps {
  nodes: NodeData[]
  edges: EdgeData[]
  onNodesChange: (nodes: NodeData[]) => void
  onEdgesChange: (edges: EdgeData[]) => void
  onNodeClick?: (node: NodeData) => void
  onEdgeClick?: (edge: EdgeData) => void
  onPaneClick?: () => void
  onConnect?: (params: { source: string; target: string; sourceHandle: string; targetHandle: string }) => void
  className?: string
}

export function FlowGraph({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
  onConnect,
  className,
}: FlowGraphProps) {
  const { toast } = useToast()
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragNode, setDragNode] = useState<string | null>(null)
  const [connecting, setConnecting] = useState<{
    nodeId: string
    handleId: string
    position: { x: number; y: number }
  } | null>(null)
  const [reconnecting, setReconnecting] = useState<{
    edgeId: string
    end: "source" | "target"
    originalSourceId?: string
    originalTargetId?: string
    originalSourceHandle?: string
    originalTargetHandle?: string
  } | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [gridSize, setGridSize] = useState(20) // Grid size for snapping
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [handlePositions, setHandlePositions] = useState<Record<string, Record<string, { x: number; y: number }>>>({})
  const [edgeBeingCreated, setEdgeBeingCreated] = useState<{
    sourceX: number
    sourceY: number
    targetX: number
    targetY: number
  } | null>(null)

  // Handle panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left mouse button
    if (e.target === containerRef.current || e.target === svgRef.current) {
      setDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })

    if (dragging) {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y
      setPosition({
        x: position.x + dx / scale,
        y: position.y + dy / scale,
      })
      setDragStart({ x: e.clientX, y: e.clientY })
    } else if (dragNode) {
      // Update node position
      const updatedNodes = nodes.map((node) => {
        if (node.id === dragNode) {
          const containerRect = containerRef.current?.getBoundingClientRect()
          if (containerRect) {
            // Calculate raw position
            let x = (e.clientX - containerRect.left) / scale - position.x
            let y = (e.clientY - containerRect.top) / scale - position.y

            // Snap to grid
            x = Math.round(x / gridSize) * gridSize
            y = Math.round(y / gridSize) * gridSize

            return { ...node, position: { x, y } }
          }
        }
        return node
      })
      onNodesChange(updatedNodes)

      // Update handle positions after node movement
      updateHandlePositions()
    }

    // Update the temporary edge being created during connection
    if (connecting) {
      const containerRect = containerRef.current?.getBoundingClientRect()
      if (containerRect) {
        setEdgeBeingCreated({
          sourceX: connecting.position.x,
          sourceY: connecting.position.y,
          targetX: e.clientX - containerRect.left,
          targetY: e.clientY - containerRect.top,
        })
      }
    }

    // Update the temporary edge during reconnection
    if (reconnecting) {
      const containerRect = containerRef.current?.getBoundingClientRect()
      if (containerRect) {
        const edge = edges.find((e) => e.id === reconnecting.edgeId)
        if (edge) {
          const sourceNode = reconnecting.end === "source" ? null : nodes.find((n) => n.id === edge.source)
          const targetNode = reconnecting.end === "target" ? null : nodes.find((n) => n.id === edge.target)

          if ((reconnecting.end === "source" && targetNode) || (reconnecting.end === "target" && sourceNode)) {
            const sourceHandle = reconnecting.end === "source" ? null : edge.sourceHandle || "right"
            const targetHandle = reconnecting.end === "target" ? null : edge.targetHandle || "left"

            let sourceX, sourceY, targetX, targetY

            if (reconnecting.end === "source") {
              const targetPos = getHandlePosition(edge.target, targetHandle!)
              if (targetPos) {
                sourceX = e.clientX - containerRect.left
                sourceY = e.clientY - containerRect.top
                targetX = targetPos.x
                targetY = targetPos.y
              }
            } else {
              const sourcePos = getHandlePosition(edge.source, sourceHandle!)
              if (sourcePos) {
                sourceX = sourcePos.x
                sourceY = sourcePos.y
                targetX = e.clientX - containerRect.left
                targetY = e.clientY - containerRect.top
              }
            }

            if (sourceX !== undefined && sourceY !== undefined && targetX !== undefined && targetY !== undefined) {
              setEdgeBeingCreated({
                sourceX,
                sourceY,
                targetX,
                targetY,
              })
            }
          }
        }
      }
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    setDragging(false)
    setDragNode(null)
    setEdgeBeingCreated(null)

    if (connecting) {
      // Check if mouse is over a handle
      const element = document.elementFromPoint(mousePosition.x, mousePosition.y)
      if (element) {
        const handleId = element.getAttribute("data-handle-id")
        const nodeId = element.getAttribute("data-node-id")

        if (handleId && nodeId && nodeId !== connecting.nodeId) {
          // Validate connection
          const sourceNode = nodes.find((n) => n.id === connecting.nodeId)
          const targetNode = nodes.find((n) => n.id === nodeId)

          if (sourceNode && targetNode) {
            // Check if connection already exists
            const existingEdge = edges.find(
              (e) =>
                e.source === connecting.nodeId &&
                e.target === nodeId &&
                e.sourceHandle === connecting.handleId &&
                e.targetHandle === handleId,
            )

            if (!existingEdge) {
              if (onConnect) {
                onConnect({
                  source: connecting.nodeId,
                  target: nodeId,
                  sourceHandle: connecting.handleId,
                  targetHandle: handleId,
                })
              }
            } else {
              toast({
                title: "Connection Already Exists",
                description: "This connection already exists between these nodes.",
                variant: "destructive",
              })
            }
          }
        } else {
          toast({
            title: "Invalid Connection",
            description: "Please connect to a valid handle on a different node.",
            variant: "destructive",
          })
        }
      }

      setConnecting(null)
    }

    if (reconnecting) {
      // Check if mouse is over a handle
      const element = document.elementFromPoint(mousePosition.x, mousePosition.y)
      if (element) {
        const handleId = element.getAttribute("data-handle-id")
        const nodeId = element.getAttribute("data-node-id")

        if (handleId && nodeId) {
          const edge = edges.find((e) => e.id === reconnecting.edgeId)
          if (edge) {
            // Validate the new connection
            let isValid = true
            let errorMessage = ""

            // Check if connecting to the same node
            if (reconnecting.end === "source" && nodeId === edge.target) {
              isValid = false
              errorMessage = "Cannot connect a node to itself."
            } else if (reconnecting.end === "target" && nodeId === edge.source) {
              isValid = false
              errorMessage = "Cannot connect a node to itself."
            }

            // Check if connection already exists
            if (isValid) {
              const newSource = reconnecting.end === "source" ? nodeId : edge.source
              const newTarget = reconnecting.end === "target" ? nodeId : edge.target
              const newSourceHandle = reconnecting.end === "source" ? handleId : edge.sourceHandle
              const newTargetHandle = reconnecting.end === "target" ? handleId : edge.targetHandle

              const existingEdge = edges.find(
                (e) =>
                  e.id !== edge.id &&
                  e.source === newSource &&
                  e.target === newTarget &&
                  e.sourceHandle === newSourceHandle &&
                  e.targetHandle === newTargetHandle,
              )

              if (existingEdge) {
                isValid = false
                errorMessage = "This connection already exists."
              }
            }

            if (isValid) {
              const updatedEdge = { ...edge }

              if (reconnecting.end === "source") {
                updatedEdge.source = nodeId
                updatedEdge.sourceHandle = handleId
              } else {
                updatedEdge.target = nodeId
                updatedEdge.targetHandle = handleId
              }

              onEdgesChange(edges.map((e) => (e.id === edge.id ? updatedEdge : e)))

              toast({
                title: "Connection Updated",
                description: "The connection has been successfully updated.",
              })
            } else {
              // Revert to original connection
              toast({
                title: "Invalid Connection",
                description: errorMessage,
                variant: "destructive",
              })
            }
          }
        } else {
          toast({
            title: "Connection Failed",
            description: "Please connect to a valid handle on a node.",
            variant: "destructive",
          })
        }
      }

      setReconnecting(null)
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY < 0 ? 0.1 : -0.1
    const newScale = Math.max(0.1, Math.min(2, scale + delta))
    setScale(newScale)
  }

  const handleNodeDragStart = (nodeId: string) => {
    setDragNode(nodeId)
    setSelectedNode(nodeId)
    setSelectedEdge(null)
  }

  const handleNodeClick = (node: NodeData) => {
    setSelectedNode(node.id)
    setSelectedEdge(null)
    if (onNodeClick) onNodeClick(node)
  }

  const handleEdgeClick = (edge: EdgeData) => {
    setSelectedEdge(edge.id)
    setSelectedNode(null)
    if (onEdgeClick) onEdgeClick(edge)
  }

  const handleEdgeDelete = (edgeId: string) => {
    onEdgesChange(edges.filter((edge) => edge.id !== edgeId))
    setSelectedEdge(null)

    toast({
      title: "Connection Deleted",
      description: "The connection has been removed from the graph.",
    })
  }

  const handleEdgeEdit = (edgeId: string) => {
    const edge = edges.find((e) => e.id === edgeId)
    if (edge && onEdgeClick) {
      onEdgeClick(edge)
    }
  }

  const handleEdgeReconnect = (edgeId: string, end: "source" | "target") => {
    const edge = edges.find((e) => e.id === edgeId)
    if (!edge) return

    setReconnecting({
      edgeId,
      end,
      originalSourceId: edge.source,
      originalTargetId: edge.target,
      originalSourceHandle: edge.sourceHandle,
      originalTargetHandle: edge.targetHandle,
    })

    toast({
      title: `Select New ${end === "source" ? "Source" : "Target"}`,
      description: "Click on a connection point to reconnect the edge.",
    })
  }

  const handlePaneClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || e.target === svgRef.current) {
      setSelectedEdge(null)
      setSelectedNode(null)
      if (onPaneClick) onPaneClick()
    }
  }

  const handleConnectStart = (nodeId: string, handleId: string, position: { x: number; y: number }) => {
    setConnecting({ nodeId, handleId, position })

    // Initialize the edge being created
    setEdgeBeingCreated({
      sourceX: position.x,
      sourceY: position.y,
      targetX: position.x,
      targetY: position.y,
    })
  }

  const handleConnectEnd = (handleId: string) => {
    // Connection handling is done in handleMouseUp
  }

  // Cancel connection or reconnection with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (connecting) {
          setConnecting(null)
          setEdgeBeingCreated(null)
          toast({
            title: "Connection Cancelled",
            description: "The connection creation has been cancelled.",
          })
        }

        if (reconnecting) {
          setReconnecting(null)
          setEdgeBeingCreated(null)
          toast({
            title: "Reconnection Cancelled",
            description: "The edge reconnection has been cancelled.",
          })
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [connecting, reconnecting, toast])

  // Update handle positions for all nodes
  const updateHandlePositions = useCallback(() => {
    const positions: Record<string, Record<string, { x: number; y: number }>> = {}

    // Find all handle elements and store their positions
    document.querySelectorAll("[data-handle-id]").forEach((element) => {
      const handleId = element.getAttribute("data-handle-id")
      const nodeId = element.getAttribute("data-node-id")

      if (handleId && nodeId) {
        const rect = element.getBoundingClientRect()
        const containerRect = containerRef.current?.getBoundingClientRect()

        if (containerRect) {
          if (!positions[nodeId]) {
            positions[nodeId] = {}
          }

          positions[nodeId][handleId] = {
            x: rect.left + rect.width / 2 - containerRect.left,
            y: rect.top + rect.height / 2 - containerRect.top,
          }
        }
      }
    })

    setHandlePositions(positions)
  }, [])

  // Update handle positions after initial render and when nodes change
  useEffect(() => {
    updateHandlePositions()

    // Set up a mutation observer to detect DOM changes
    const observer = new MutationObserver(updateHandlePositions)

    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      })
    }

    return () => observer.disconnect()
  }, [nodes, scale, position, updateHandlePositions])

  // Handle insertion of a node on an edge
  const handleInsertNodeOnEdge = (e: React.MouseEvent, edgeId: string) => {
    e.stopPropagation()

    // Find the edge
    const edge = edges.find((e) => e.id === edgeId)
    if (!edge) return

    // Get source and target nodes
    const sourceNode = nodes.find((n) => n.id === edge.source)
    const targetNode = nodes.find((n) => n.id === edge.target)
    if (!sourceNode || !targetNode) return

    // Calculate position for the new node (midpoint of the edge)
    const x = (sourceNode.position.x + targetNode.position.x) / 2
    const y = (sourceNode.position.y + targetNode.position.y) / 2

    // Create a new node
    const newNodeId = `node-${Date.now()}`
    const newNode: NodeData = {
      id: newNodeId,
      type: "function", // Default type
      position: { x, y },
      data: {
        label: "Function",
        description: "A function node",
        outputs: ["output"],
      },
    }

    // Create new edges
    const newEdge1: EdgeData = {
      id: createEdgeId(edge.source, newNodeId),
      source: edge.source,
      target: newNodeId,
      sourceHandle: edge.sourceHandle || "right",
      targetHandle: "left",
      data: { ...edge.data },
    }

    const newEdge2: EdgeData = {
      id: createEdgeId(newNodeId, edge.target),
      source: newNodeId,
      target: edge.target,
      sourceHandle: "right",
      targetHandle: edge.targetHandle || "left",
      data: { label: "output", isConditional: false },
    }

    // Update nodes and edges
    onNodesChange([...nodes, newNode])
    onEdgesChange([...edges.filter((e) => e.id !== edgeId), newEdge1, newEdge2])

    toast({
      title: "Node Inserted",
      description: "A new node has been inserted in the connection.",
    })

    // Auto-layout to maintain vertical alignment
    setTimeout(() => {
      const updatedNodes = [...nodes, newNode]
      const updatedEdges = [...edges.filter((e) => e.id !== edgeId), newEdge1, newEdge2]

      // Find all nodes in the path from start to end
      const startNode = updatedNodes.find((n) => n.data.label === "__start__")
      if (!startNode) return

      // Perform a topological sort to get the correct order
      const nodeOrder: NodeData[] = []
      const visited = new Set<string>()

      const visit = (nodeId: string) => {
        if (visited.has(nodeId)) return
        visited.add(nodeId)

        const node = updatedNodes.find((n) => n.id === nodeId)
        if (!node) return

        // Find all outgoing edges
        const outgoingEdges = updatedEdges.filter((e) => e.source === nodeId)
        for (const edge of outgoingEdges) {
          visit(edge.target)
        }

        nodeOrder.unshift(node)
      }

      visit(startNode.id)

      // Position nodes vertically
      const verticalGap = 120
      const alignedNodes = updatedNodes.map((node) => {
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

      onNodesChange(alignedNodes)
    }, 50)
  }

  // Generate a unique edge ID
  const createEdgeId = (source: string, target: string): string => {
    return `edge-${source}-${target}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Handle drag and drop from palette
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const nodeType = e.dataTransfer.getData("application/langgraph-node")
    if (!nodeType || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()

    // Calculate raw position
    let x = (e.clientX - containerRect.left) / scale - position.x
    let y = (e.clientY - containerRect.top) / scale - position.y

    // Snap to grid
    x = Math.round(x / gridSize) * gridSize
    y = Math.round(y / gridSize) * gridSize

    // Check if we're dropping on an edge insertion point
    const element = document.elementFromPoint(e.clientX, e.clientY)
    const isInsertionPoint = element?.getAttribute("data-insertion-point") === "true"

    if (isInsertionPoint) {
      const edgeId = element?.getAttribute("data-edge-id")
      if (edgeId) {
        // Handle insertion on edge
        const edge = edges.find((e) => e.id === edgeId)
        if (edge) {
          // Find the edge
          const sourceNode = nodes.find((n) => n.id === edge.source)
          const targetNode = nodes.find((n) => n.id === edge.target)
          if (!sourceNode || !targetNode) return

          // Create a new node
          const newNodeId = `node-${Date.now()}`
          const newNode: NodeData = {
            id: newNodeId,
            type: nodeType,
            position: {
              x: (sourceNode.position.x + targetNode.position.x) / 2,
              y: (sourceNode.position.y + targetNode.position.y) / 2,
            },
            data: {
              label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
              description: `A ${nodeType} node`,
              outputs: ["output"],
            },
          }

          // Create new edges
          const newEdge1: EdgeData = {
            id: createEdgeId(edge.source, newNodeId),
            source: edge.source,
            target: newNodeId,
            sourceHandle: edge.sourceHandle || "right",
            targetHandle: "left",
            data: { ...edge.data },
          }

          const newEdge2: EdgeData = {
            id: createEdgeId(newNodeId, edge.target),
            source: newNodeId,
            target: edge.target,
            sourceHandle: "right",
            targetHandle: edge.targetHandle || "left",
            data: { label: "output", isConditional: false },
          }

          // Update nodes and edges
          const updatedNodes = [...nodes, newNode]
          const updatedEdges = [...edges.filter((e) => e.id !== edgeId), newEdge1, newEdge2]

          onNodesChange(updatedNodes)
          onEdgesChange(updatedEdges)

          toast({
            title: "Node Inserted",
            description: `A new ${nodeType} node has been inserted in the connection.`,
          })

          // Auto-layout to maintain vertical alignment
          setTimeout(() => {
            // Find all nodes in the path from start to end
            const startNode = updatedNodes.find((n) => n.data.label === "__start__")
            if (!startNode) return

            // Perform a topological sort to get the correct order
            const nodeOrder: NodeData[] = []
            const visited = new Set<string>()

            const visit = (nodeId: string) => {
              if (visited.has(nodeId)) return
              visited.add(nodeId)

              const node = updatedNodes.find((n) => n.id === nodeId)
              if (!node) return

              // Find all outgoing edges
              const outgoingEdges = updatedEdges.filter((e) => e.source === nodeId)
              for (const edge of outgoingEdges) {
                visit(edge.target)
              }

              nodeOrder.unshift(node)
            }

            visit(startNode.id)

            // Position nodes vertically
            const verticalGap = 120
            const alignedNodes = updatedNodes.map((node) => {
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

            onNodesChange(alignedNodes)
          }, 50)

          return
        }
      }
    }

    // Create a new node
    const newNode: NodeData = {
      id: `node-${Date.now()}`,
      type: nodeType,
      position: { x, y },
      data: {
        label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
        description: `A ${nodeType} node`,
        outputs: ["output"],
      },
    }

    // Add the new node
    const updatedNodes = [...nodes, newNode]
    onNodesChange(updatedNodes)

    // Find start and end nodes
    const startNode = nodes.find((node) => node.data.label === "__start__")
    const endNode = nodes.find((node) => node.data.label === "__end__")

    if (startNode && endNode) {
      // Only connect to start and end if the node is dropped in a clear area
      // (not on an edge insertion point)
      const newEdges: EdgeData[] = [
        {
          id: createEdgeId(startNode.id, newNode.id),
          source: startNode.id,
          target: newNode.id,
          sourceHandle: "bottom",
          targetHandle: "top",
          data: { label: nodeType.toUpperCase(), isConditional: false },
        },
        {
          id: createEdgeId(newNode.id, endNode.id),
          source: newNode.id,
          target: endNode.id,
          sourceHandle: "bottom",
          targetHandle: "top",
          data: { label: "output", isConditional: false },
        },
      ]

      // Remove direct connection between start and end if it exists
      const filteredEdges = edges.filter((edge) => !(edge.source === startNode.id && edge.target === endNode.id))

      onEdgesChange([...filteredEdges, ...newEdges])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  // Get handle position for a specific node and handle
  const getHandlePosition = (nodeId: string, handleId: string) => {
    return handlePositions[nodeId]?.[handleId] || null
  }

  // Fit view to show all nodes
  const fitView = () => {
    if (nodes.length === 0 || !containerRef.current) return

    const padding = 50
    const containerRect = containerRef.current.getBoundingClientRect()
    const containerWidth = containerRect.width
    const containerHeight = containerRect.height

    // Find bounds of all nodes
    let minX = Number.POSITIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY

    nodes.forEach((node) => {
      minX = Math.min(minX, node.position.x)
      minY = Math.min(minY, node.position.y)
      maxX = Math.max(maxX, node.position.x + 200) // Assuming node width
      maxY = Math.max(maxY, node.position.y + 80) // Assuming node height
    })

    const graphWidth = maxX - minX + padding * 2
    const graphHeight = maxY - minY + padding * 2

    // Calculate scale to fit
    const scaleX = containerWidth / graphWidth
    const scaleY = containerHeight / graphHeight
    const newScale = Math.min(scaleX, scaleY, 1) // Cap at 1 to avoid too much zoom

    // Calculate position to center
    const newX = (containerWidth / newScale - graphWidth) / 2 + padding - minX
    const newY = (containerHeight / newScale - graphHeight) / 2 + padding - minY

    setScale(newScale)
    setPosition({ x: newX, y: newY })
  }

  // Initialize with fit view
  useEffect(() => {
    fitView()
  }, [])

  // Draw grid background
  const renderGrid = () => {
    if (!containerRef.current) return null

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    // Calculate grid size based on scale
    const scaledGridSize = gridSize * scale

    // Calculate grid offset based on position
    const offsetX = (position.x * scale) % scaledGridSize
    const offsetY = (position.y * scale) % scaledGridSize

    return (
      <svg className="absolute left-0 top-0 h-full w-full pointer-events-none">
        <defs>
          <pattern
            id="grid"
            width={scaledGridSize}
            height={scaledGridSize}
            patternUnits="userSpaceOnUse"
            x={offsetX}
            y={offsetY}
          >
            <path
              d={`M ${scaledGridSize} 0 L 0 0 0 ${scaledGridSize}`}
              fill="none"
              stroke="rgba(0, 0, 0, 0.1)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full overflow-hidden bg-gray-50 dark:bg-gray-900", className)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handlePaneClick}
      onWheel={handleWheel}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Grid background */}
      {renderGrid()}

      {/* Render edges */}
      <svg ref={svgRef} className="absolute left-0 top-0 h-full w-full">
        {/* Edge layer */}
        <g className="edges-layer">
          {edges.map((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.source)
            const targetNode = nodes.find((n) => n.id === edge.target)
            if (!sourceNode || !targetNode) return null

            // Get handle positions
            const sourceHandle = edge.sourceHandle || "right"
            const targetHandle = edge.targetHandle || "left"

            const sourcePos = getHandlePosition(edge.source, sourceHandle)
            const targetPos = getHandlePosition(edge.target, targetHandle)

            // If handle positions are not available yet, don't render the edge
            if (!sourcePos || !targetPos) return null

            return (
              <Edge
                key={edge.id}
                edge={edge}
                sourceX={sourcePos.x}
                sourceY={sourcePos.y}
                targetX={targetPos.x}
                targetY={targetPos.y}
                sourceHandleId={sourceHandle}
                targetHandleId={targetHandle}
                onClick={() => handleEdgeClick(edge)}
                onDelete={() => handleEdgeDelete(edge.id)}
                onEdit={() => handleEdgeEdit(edge.id)}
                onReconnect={(end) => handleEdgeReconnect(edge.id, end)}
                scale={scale}
                selected={selectedEdge === edge.id}
              />
            )
          })}
        </g>

        {/* Connection line when creating a new edge */}
        {edgeBeingCreated && (
          <g className="connection-line-layer" style={{ pointerEvents: "none" }}>
            <path
              d={`M ${edgeBeingCreated.sourceX} ${edgeBeingCreated.sourceY} L ${edgeBeingCreated.targetX} ${edgeBeingCreated.targetY}`}
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5,5"
              fill="none"
              className="connection-line"
            />
            <circle
              cx={edgeBeingCreated.targetX}
              cy={edgeBeingCreated.targetY}
              r={4}
              fill="#3b82f6"
              className="connection-endpoint"
            />
          </g>
        )}
      </svg>

      {/* Render nodes */}
      <div
        className="absolute left-0 top-0 h-full w-full"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        {nodes.map((node) => (
          <Node
            key={node.id}
            node={node}
            position={{
              x: node.position.x + position.x,
              y: node.position.y + position.y,
            }}
            onDragStart={() => handleNodeDragStart(node.id)}
            onClick={() => handleNodeClick(node)}
            onConnectStart={(handleId, position) => handleConnectStart(node.id, handleId, position)}
            onConnectEnd={(handleId) => handleConnectEnd(handleId)}
            selected={selectedNode === node.id}
          />
        ))}
      </div>

      {/* Connection/Reconnection Mode Indicator */}
      {(connecting || reconnecting) && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-4 py-2 rounded-md shadow-md flex items-center z-50">
          <AlertCircle className="h-4 w-4 mr-2" />
          {connecting
            ? "Creating new connection - click on a handle to connect (ESC to cancel)"
            : "Reconnecting edge - click on a handle to connect (ESC to cancel)"}
        </div>
      )}

      {/* Controls */}
      <Controls
        onZoomIn={() => setScale(Math.min(2, scale + 0.1))}
        onZoomOut={() => setScale(Math.max(0.1, scale - 0.1))}
        onFitView={fitView}
        className="absolute bottom-4 right-4"
      />

      {/* Mini map */}
      <MiniMap
        nodes={nodes}
        position={position}
        scale={scale}
        onPositionChange={setPosition}
        className="absolute bottom-4 left-4 h-32 w-48"
      />
    </div>
  )
}
