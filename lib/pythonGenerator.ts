import type { LGNode, LGEdge, LGState } from "@/types/graph"

export function generatePythonCode(nodes: LGNode[], edges: LGEdge[], state: LGState[]): string {
  // Generate imports
  const imports = generateImports(nodes)

  // Generate state class
  const stateClass = generateStateClass(state)

  // Generate node functions
  const nodeFunctions = generateNodeFunctions(nodes)

  // Generate graph construction
  const graphConstruction = generateGraphConstruction(nodes, edges)

  // Generate example usage
  const exampleUsage = generateExampleUsage(state)

  // Combine all sections
  return [imports, "", stateClass, "", nodeFunctions, "", graphConstruction, "", exampleUsage].join("\n")
}

function generateImports(nodes: LGNode[]): string {
  const hasLLM = nodes.some((node) => node.type === "llm")
  const hasTool = nodes.some((node) => node.type === "tool")

  return `
from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph
${hasLLM ? "from langchain_openai import ChatOpenAI" : ""}
${hasTool ? "from langchain.tools import Tool" : ""}
import os
`.trim()
}

function generateStateClass(state: LGState[]): string {
  // Default state if none provided
  if (!state.length) {
    state = [
      { key: "question", type: "string", accumulate: false },
      { key: "context", type: "string", accumulate: false },
      { key: "response", type: "string", accumulate: false },
      { key: "history", type: "list", accumulate: true },
    ]
  }

  const stateFields = state
    .map((field) => {
      const typeMapping: Record<string, string> = {
        string: "str",
        number: "float",
        boolean: "bool",
        list: "List[Dict[str, Any]]",
        dict: "Dict[str, Any]",
      }

      return `    ${field.key}: ${field.accumulate ? "" : "Optional["}${typeMapping[field.type] || "Any"}${field.accumulate ? "" : "]"}`
    })
    .join("\n")

  return `
# Define state type
class State(TypedDict):
${stateFields}
`.trim()
}

function generateNodeFunctions(nodes: LGNode[]): string {
  const functionNodes = nodes.filter((node) => node.type === "function" || node.type === "branch")

  if (!functionNodes.length) return ""

  const functions = functionNodes
    .map((node) => {
      const functionName = node.label.toLowerCase().replace(/\s+/g, "_")
      const code = node.code || `# Function implementation\nreturn {"${node.outputs[0]}": "Default output"}`

      return `
def ${functionName}(state):
${code
  .split("\n")
  .map((line) => `    ${line}`)
  .join("\n")}
`.trim()
    })
    .join("\n\n")

  return `
# Define node functions
${functions}
`.trim()
}

function generateGraphConstruction(nodes: LGNode[], edges: LGEdge[]): string {
  if (!nodes.length) return ""

  const nodeAdditions = nodes
    .map((node) => {
      const nodeId = node.label.toLowerCase().replace(/\s+/g, "_")

      switch (node.type) {
        case "llm":
          return `builder.add_node("${nodeId}", ChatOpenAI(model="${node.model || "gpt-4o"}"))`
        case "function":
        case "branch":
          return `builder.add_node("${nodeId}", ${nodeId})`
        case "tool":
          return `builder.add_node("${nodeId}", Tool.from_function(
    func=lambda query: "Tool result",
    name="${node.toolName || "tool"}",
    description="Tool description"
))`
        default:
          return `builder.add_node("${nodeId}", lambda state: {"${node.outputs[0]}": "Default output"})`
      }
    })
    .join("\n")

  const edgeAdditions = edges
    .map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source)
      const targetNode = nodes.find((n) => n.id === edge.target)

      if (!sourceNode || !targetNode) return ""

      const sourceId = sourceNode.label.toLowerCase().replace(/\s+/g, "_")
      const targetId = targetNode.label.toLowerCase().replace(/\s+/g, "_")

      if (edge.condition) {
        return `builder.add_conditional_edges(
    "${sourceId}",
    lambda state: state.get("${edge.condition.split(".")[1] || "condition"}", False),
    {
        True: "${targetId}",
        False: None  # Define alternative path if needed
    }
)`
      } else {
        return `builder.add_edge("${sourceId}", "${targetId}")`
      }
    })
    .join("\n")

  // Find the first node as entry point
  const entryNode = nodes[0]
  const entryNodeId = entryNode ? entryNode.label.toLowerCase().replace(/\s+/g, "_") : "start_node"

  return `
# Initialize state graph
builder = StateGraph(State)

# Add nodes to graph
${nodeAdditions}

# Add edges
${edgeAdditions}

# Set entry point
builder.set_entry_point("${entryNodeId}")

# Compile graph
graph = builder.compile()
`.trim()
}

function generateExampleUsage(state: LGState[]): string {
  // Create example state
  const exampleState: Record<string, any> = {}

  state.forEach((field) => {
    switch (field.type) {
      case "string":
        exampleState[field.key] = field.key === "question" ? "How does climate change affect agriculture?" : null
        break
      case "number":
        exampleState[field.key] = 0
        break
      case "boolean":
        exampleState[field.key] = false
        break
      case "list":
        exampleState[field.key] = []
        break
      case "dict":
        exampleState[field.key] = {}
        break
      default:
        exampleState[field.key] = null
    }
  })

  // Format the example state as Python code
  const formattedState = JSON.stringify(exampleState, null, 4)
    .replace(/"([^"]+)":/g, "$1:") // Remove quotes from keys
    .replace(/"/g, '"') // Replace double quotes with single quotes for strings
    .replace(/null/g, "None") // Replace null with None
    .replace(/false/g, "False") // Replace false with False
    .replace(/true/g, "True") // Replace true with True

  return `
# Example usage
result = graph.invoke(${formattedState})
print(result)
`.trim()
}
