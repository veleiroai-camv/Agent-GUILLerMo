import { create } from "zustand"
import {
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  addEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow"
import { v4 as uuidv4 } from "uuid"
import type { NodeType } from "@/types/graph"

type RFState = {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  addNode: (type: NodeType, position?: { x: number; y: number }) => Node
  updateNode: (id: string, data: any) => void
  updateEdge: (id: string, data: any) => void
  deleteNode: (id: string) => void
  deleteEdge: (id: string) => void
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
}

// Default node data based on type
const getDefaultNodeData = (type: NodeType) => {
  switch (type) {
    case "function":
      return {
        label: "Function",
        code: 'def process(state):\n    # Your code here\n    return {"result": "Hello World"}',
        outputs: ["result"],
      }
    case "llm":
      return {
        label: "LLM",
        prompt: "You are a helpful assistant.",
        model: "gpt-4o",
        outputs: ["response"],
      }
    case "tool":
      return {
        label: "Tool",
        toolName: "web_search",
        outputs: ["result"],
      }
    case "branch":
      return {
        label: "Branch",
        code: 'def should_branch(state):\n    return state.get("score", 0) > 0.5',
        outputs: ["true_branch", "false_branch"],
      }
    case "subgraph":
      return {
        label: "Subgraph",
        outputs: ["result"],
      }
    default:
      return {
        label: "Node",
        outputs: ["result"],
      }
  }
}

export const useGraphStore = create<RFState>((set, get) => ({
  nodes: [],
  edges: [],

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    })
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    })
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(
        {
          ...connection,
          id: `edge-${uuidv4()}`,
          type: "default",
          animated: false,
          style: { stroke: "#64748b", strokeWidth: 2 },
        },
        get().edges,
      ),
    })
  },

  addNode: (type: NodeType, position = { x: 250, y: 150 }) => {
    const newNode: Node = {
      id: `node-${uuidv4()}`,
      type,
      position,
      data: getDefaultNodeData(type),
    }

    set({
      nodes: [...get().nodes, newNode],
    })

    return newNode
  },

  updateNode: (id: string, data: any) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...data } }
        }
        return node
      }),
    })
  },

  updateEdge: (id: string, data: any) => {
    set({
      edges: get().edges.map((edge) => {
        if (edge.id === id) {
          return { ...edge, data: { ...edge.data, ...data } }
        }
        return edge
      }),
    })
  },

  deleteNode: (id: string) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== id),
      edges: get().edges.filter((edge) => edge.source !== id && edge.target !== id),
    })
  },

  deleteEdge: (id: string) => {
    set({
      edges: get().edges.filter((edge) => edge.id !== id),
    })
  },

  setNodes: (nodes: Node[]) => {
    set({ nodes })
  },

  setEdges: (edges: Edge[]) => {
    set({ edges })
  },
}))
