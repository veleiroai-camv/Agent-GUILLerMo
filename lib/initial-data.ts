import type { Node, Edge } from "reactflow"

export const initialNodes: Node[] = [
  {
    id: "start",
    type: "custom",
    data: { label: "Start", type: "start" },
    position: { x: 250, y: 0 },
  },
  {
    id: "model",
    type: "custom",
    data: { label: "Model", type: "model" },
    position: { x: 250, y: 100 },
  },
  {
    id: "tools",
    type: "custom",
    data: { label: "Tools", type: "tools" },
    position: { x: 250, y: 200 },
  },
  {
    id: "end",
    type: "custom",
    data: { label: "End", type: "end" },
    position: { x: 250, y: 300 },
  },
]

export const initialEdges: Edge[] = [
  {
    id: "start-model",
    source: "start",
    target: "model",
    type: "custom",
  },
  {
    id: "model-tools",
    source: "model",
    target: "tools",
    type: "custom",
  },
  {
    id: "tools-end",
    source: "tools",
    target: "end",
    type: "custom",
  },
]
