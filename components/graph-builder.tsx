"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  type EdgeTypes,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow"
import "reactflow/dist/style.css"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { NodeContextMenu } from "@/components/node-context-menu"
import { EdgeContextMenu } from "@/components/edge-context-menu"
import { CustomNode } from "@/components/custom-node"
import { CustomEdge } from "@/components/custom-edge"
import { KeyCommandsDialog } from "@/components/key-commands-dialog"
import { CodeGenerationDialog } from "@/components/code-generation-dialog"
import { TemplatesDialog } from "@/components/templates-dialog"
import { initialNodes, initialEdges } from "@/lib/initial-data"
import { generateNodeId } from "@/lib/utils"

const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
}

function GraphBuilderContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const [showKeyCommands, setShowKeyCommands] = useState(false)
  const [showCodeGeneration, setShowCodeGeneration] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [contextMenu, setContextMenu] = useState<{
    type: "node" | "edge" | null
    id: string | null
    position: { x: number; y: number } | null
  }>({
    type: null,
    id: null,
    position: null,
  })

  const { project } = useReactFlow()

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, type: "custom" }, eds))
    },
    [setEdges],
  )

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      if (!reactFlowWrapper.current || !reactFlowInstance) return

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const type = event.dataTransfer.getData("application/reactflow")

      // Check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      const newNode = {
        id: generateNodeId(),
        type: "custom",
        position,
        data: { label: type, type },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes],
  )

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault()
      const position = project({
        x: event.clientX,
        y: event.clientY,
      })
      setContextMenu({
        type: "node",
        id: node.id,
        position,
      })
    },
    [project],
  )

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault()
      const position = project({
        x: event.clientX,
        y: event.clientY,
      })
      setContextMenu({
        type: "edge",
        id: edge.id,
        position,
      })
    },
    [project],
  )

  const onPaneClick = useCallback(() => {
    setContextMenu({ type: null, id: null, position: null })
  }, [])

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    // Implement node editing logic
    console.log("Double clicked on node:", node)
  }, [])

  return (
    <div className="flex h-screen flex-col">
      <Header
        onShowKeyCommands={() => setShowKeyCommands(true)}
        onShowTemplates={() => setShowTemplates(true)}
        onGenerateCode={() => setShowCodeGeneration(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeContextMenu={onNodeContextMenu}
            onEdgeContextMenu={onEdgeContextMenu}
            onPaneClick={onPaneClick}
            onNodeDoubleClick={onNodeDoubleClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background />
            <Panel position="top-right">{/* Additional controls can go here */}</Panel>
          </ReactFlow>
          {contextMenu.type === "node" && contextMenu.position && (
            <NodeContextMenu
              nodeId={contextMenu.id!}
              position={contextMenu.position}
              onClose={() => setContextMenu({ type: null, id: null, position: null })}
            />
          )}
          {contextMenu.type === "edge" && contextMenu.position && (
            <EdgeContextMenu
              edgeId={contextMenu.id!}
              position={contextMenu.position}
              onClose={() => setContextMenu({ type: null, id: null, position: null })}
            />
          )}
        </div>
      </div>
      <KeyCommandsDialog open={showKeyCommands} onClose={() => setShowKeyCommands(false)} />
      <CodeGenerationDialog
        open={showCodeGeneration}
        onClose={() => setShowCodeGeneration(false)}
        nodes={nodes}
        edges={edges}
      />
      <TemplatesDialog
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={(template) => {
          // Implement template loading logic
          setShowTemplates(false)
        }}
      />
    </div>
  )
}

export function GraphBuilder() {
  return (
    <ReactFlowProvider>
      <GraphBuilderContent />
    </ReactFlowProvider>
  )
}
