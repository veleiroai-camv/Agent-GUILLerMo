export type NodeType = "function" | "llm" | "tool" | "branch" | "subgraph"

export interface LGNode {
  id: string
  type: NodeType
  label: string
  code?: string // for function or condition
  prompt?: string // for llm
  model?: string
  toolName?: string
  outputs: string[] // keys returned
  config?: Record<string, unknown> // temperature, retries…
}

export interface LGEdge {
  id: string
  source: string
  target: string
  label?: string // displayed on edge
  isConditional?: boolean // whether this is a conditional edge
  condition?: string // JS expression or python function name
}

export interface LGState {
  key: string
  type: "string" | "number" | "boolean" | "list" | "dict"
  accumulate: boolean
  defaultValue?: any
}
