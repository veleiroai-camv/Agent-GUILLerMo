"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { CodeEditor } from "@/components/code-editor"
import { Button } from "@/components/ui/button"
import { Plus, ArrowRight, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface InspectorProps {
  selectedElement: {
    type: "node" | "edge" | null
    data: any
  } | null
  collapsed?: boolean
  onUpdateEdge?: (edgeId: string, data: any) => void
}

export function Inspector({ selectedElement, collapsed = false, onUpdateEdge }: InspectorProps) {
  const [activeTab, setActiveTab] = useState("inspector")

  if (collapsed) {
    return (
      <div className="flex h-full flex-col items-center justify-start p-2">
        {/* Show minimal icons when collapsed */}
      </div>
    )
  }

  if (!selectedElement) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-muted-foreground">
        <div>
          <p>Select a node or edge to inspect</p>
          <p className="text-sm">Or drag a node from the palette to add it to the canvas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <div className="border-b px-4 py-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inspector">Inspector</TabsTrigger>
            <TabsTrigger value="state">State</TabsTrigger>
            <TabsTrigger value="graph">Graph</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="inspector" className="p-4">
          {selectedElement.type === "node" && <NodeInspector node={selectedElement.data} />}

          {selectedElement.type === "edge" && <EdgeInspector edge={selectedElement.data} onUpdateEdge={onUpdateEdge} />}
        </TabsContent>

        <TabsContent value="state" className="p-4">
          <StateEditor />
        </TabsContent>

        <TabsContent value="graph" className="p-4">
          <GraphEditor />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NodeInspector({ node }: { node: any }) {
  const nodeType = node.type || "function"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="node-name">Node Name</Label>
          <Input id="node-name" defaultValue={node.data?.label || "Untitled Node"} />
        </div>
        <Badge variant="outline" className="ml-2">
          {nodeType}
        </Badge>
      </div>

      <div>
        <Label htmlFor="node-description">Description</Label>
        <Textarea
          id="node-description"
          placeholder="Describe what this node does..."
          defaultValue={node.data?.description || ""}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="node-enabled" defaultChecked />
        <Label htmlFor="node-enabled">Enabled</Label>
      </div>

      {nodeType === "function" && <FunctionNodeEditor node={node} />}
      {nodeType === "llm" && <LLMNodeEditor node={node} />}
      {nodeType === "tool" && <ToolNodeEditor node={node} />}
      {nodeType === "branch" && <BranchNodeEditor node={node} />}
    </div>
  )
}

function FunctionNodeEditor({ node }: { node: any }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="function-code">Function Code</Label>
        <div className="mt-1 rounded-md border">
          <CodeEditor
            language="python"
            value={node.data?.code || 'def process(state):\n    # Your code here\n    return {"result": "Hello World"}'}
            height="200px"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="output-keys">Output Keys (comma-separated)</Label>
        <Input
          id="output-keys"
          placeholder="result, error, status"
          defaultValue={node.data?.outputs?.join(", ") || "result"}
        />
      </div>
    </div>
  )
}

function LLMNodeEditor({ node }: { node: any }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="llm-prompt">Prompt</Label>
        <Textarea
          id="llm-prompt"
          placeholder="Enter your prompt here..."
          className="min-h-[150px]"
          defaultValue={node.data?.prompt || ""}
        />
      </div>

      <div>
        <Label htmlFor="llm-model">Model</Label>
        <Select defaultValue="gpt-4o">
          <SelectTrigger id="llm-model">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o">OpenAI GPT-4o</SelectItem>
            <SelectItem value="gpt-3.5-turbo">OpenAI GPT-3.5 Turbo</SelectItem>
            <SelectItem value="claude-3-opus">Anthropic Claude 3 Opus</SelectItem>
            <SelectItem value="claude-3-sonnet">Anthropic Claude 3 Sonnet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="temperature">Temperature: 0.7</Label>
        </div>
        <Slider id="temperature" defaultValue={[0.7]} max={1} step={0.1} className="py-4" />
      </div>

      <div>
        <Label htmlFor="output-key">Output Key</Label>
        <Input id="output-key" placeholder="response" defaultValue={node.data?.outputs?.[0] || "response"} />
      </div>
    </div>
  )
}

function ToolNodeEditor({ node }: { node: any }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="tool-name">Tool</Label>
        <Select defaultValue="web_search">
          <SelectTrigger id="tool-name">
            <SelectValue placeholder="Select tool" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="web_search">Web Search</SelectItem>
            <SelectItem value="calculator">Calculator</SelectItem>
            <SelectItem value="weather">Weather API</SelectItem>
            <SelectItem value="database">Database Query</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Arguments</Label>
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm">Argument Mapping</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="query" />
                <Input placeholder="state.question" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="num_results" />
                <Input placeholder="5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Label>Tool Description</Label>
        <div className="rounded-md border bg-muted p-3 text-sm">
          <p>Searches the web for information based on a query string.</p>
          <p className="mt-1 text-xs text-muted-foreground">Returns: {"{ results: [...], source_urls: [...] }"}</p>
        </div>
      </div>
    </div>
  )
}

function BranchNodeEditor({ node }: { node: any }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="branch-condition">Condition</Label>
        <div className="mt-1 rounded-md border">
          <CodeEditor
            language="python"
            value={
              node.data?.code ||
              'def should_branch(state):\n    # Return True or False\n    return state.get("score", 0) > 0.5'
            }
            height="200px"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="branch-outputs">Outputs</Label>
        <div className="space-y-2">
          <Input placeholder="true_branch" defaultValue="true_branch" />
          <Input placeholder="false_branch" defaultValue="false_branch" />
        </div>
      </div>
    </div>
  )
}

function EdgeInspector({ edge, onUpdateEdge }: { edge: any; onUpdateEdge?: (edgeId: string, data: any) => void }) {
  const { toast } = useToast()
  const [isConditional, setIsConditional] = useState(edge.data?.isConditional || false)
  const [edgeLabel, setEdgeLabel] = useState(edge.data?.label || "")
  const [sourceOutput, setSourceOutput] = useState(edge.data?.sourceOutput || "output")
  const [targetInput, setTargetInput] = useState(edge.data?.targetInput || "input")
  const [condition, setCondition] = useState(edge.data?.condition || 'state.get("score", 0) > 0.5')
  const [edgeStyle, setEdgeStyle] = useState(edge.data?.style || "default")
  const [edgeColor, setEdgeColor] = useState(edge.data?.color || "#555555")
  const [hasChanges, setHasChanges] = useState(false)

  // Update state when edge changes
  useEffect(() => {
    setIsConditional(edge.data?.isConditional || false)
    setEdgeLabel(edge.data?.label || "")
    setSourceOutput(edge.data?.sourceOutput || "output")
    setTargetInput(edge.data?.targetInput || "input")
    setCondition(edge.data?.condition || 'state.get("score", 0) > 0.5')
    setEdgeStyle(edge.data?.style || "default")
    setEdgeColor(edge.data?.color || "#555555")
    setHasChanges(false)
  }, [edge.id, edge.data])

  // Track changes
  useEffect(() => {
    const currentData = {
      isConditional,
      label: edgeLabel,
      sourceOutput,
      targetInput,
      condition: isConditional ? condition : undefined,
      style: edgeStyle,
      color: edgeColor,
    }

    const originalData = {
      isConditional: edge.data?.isConditional || false,
      label: edge.data?.label || "",
      sourceOutput: edge.data?.sourceOutput || "output",
      targetInput: edge.data?.targetInput || "input",
      condition: edge.data?.isConditional ? edge.data?.condition : undefined,
      style: edge.data?.style || "default",
      color: edge.data?.color || "#555555",
    }

    // Check if any values have changed
    const changed = Object.keys(currentData).some((key) => {
      return currentData[key as keyof typeof currentData] !== originalData[key as keyof typeof originalData]
    })

    setHasChanges(changed)
  }, [isConditional, edgeLabel, sourceOutput, targetInput, condition, edgeStyle, edgeColor, edge.data])

  const handleApplyChanges = () => {
    if (onUpdateEdge) {
      onUpdateEdge(edge.id, {
        ...edge.data,
        label: edgeLabel,
        isConditional,
        sourceOutput,
        targetInput,
        condition: isConditional ? condition : undefined,
        style: edgeStyle,
        color: edgeColor,
      })

      toast({
        title: "Connection Updated",
        description: "The connection properties have been applied successfully.",
      })

      setHasChanges(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Label htmlFor="edge-label">Edge Label</Label>
          <Input
            id="edge-label"
            value={edgeLabel}
            onChange={(e) => setEdgeLabel(e.target.value)}
            placeholder="Label (optional)"
          />
        </div>
        <Badge variant="outline" className="ml-2 self-start mt-8">
          Edge
        </Badge>
      </div>

      <div className="flex items-center gap-2 bg-muted p-3 rounded-md">
        <div className="flex-1 text-sm">
          <div className="font-medium">Connection</div>
          <div className="text-muted-foreground flex items-center gap-1 mt-1">
            <span>From</span>
            <Badge variant="outline" className="font-mono text-xs">
              {edge.source}
            </Badge>
            <ArrowRight className="h-3 w-3 mx-1" />
            <span>To</span>
            <Badge variant="outline" className="font-mono text-xs">
              {edge.target}
            </Badge>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="edge-source-output">Source Output</Label>
        <Input
          id="edge-source-output"
          value={sourceOutput}
          onChange={(e) => setSourceOutput(e.target.value)}
          placeholder="Output key"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          The output key from the source node that will be passed to the target node
        </p>
      </div>

      <div>
        <Label htmlFor="edge-target-input">Target Input</Label>
        <Input
          id="edge-target-input"
          value={targetInput}
          onChange={(e) => setTargetInput(e.target.value)}
          placeholder="Input key"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          The input key on the target node that will receive the output from the source node
        </p>
      </div>

      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-medium">Visual Style</h3>

        <div>
          <Label htmlFor="edge-style">Edge Style</Label>
          <Select value={edgeStyle} onValueChange={setEdgeStyle}>
            <SelectTrigger id="edge-style">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="straight">Straight</SelectItem>
              <SelectItem value="step">Step</SelectItem>
              <SelectItem value="bezier">Bezier</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="edge-color">Edge Color</Label>
          <div className="flex gap-2 items-center">
            <Input
              id="edge-color"
              type="color"
              value={edgeColor}
              onChange={(e) => setEdgeColor(e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              type="text"
              value={edgeColor}
              onChange={(e) => setEdgeColor(e.target.value)}
              className="flex-1"
              placeholder="#555555"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 border-t pt-4">
        <Switch id="conditional-edge" checked={isConditional} onCheckedChange={setIsConditional} />
        <Label htmlFor="conditional-edge">Conditional Edge</Label>
      </div>

      {isConditional && (
        <div>
          <Label htmlFor="edge-condition">Condition</Label>
          <div className="mt-1 rounded-md border">
            <CodeEditor
              language="python"
              value={condition}
              onChange={(value) => setCondition(value || "")}
              height="150px"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            This edge will only be followed if the condition evaluates to True
          </p>
        </div>
      )}

      <div className="pt-4">
        <Button
          variant={hasChanges ? "default" : "outline"}
          className="w-full"
          onClick={handleApplyChanges}
          disabled={!hasChanges}
        >
          {hasChanges && <AlertCircle className="mr-2 h-4 w-4" />}
          Apply Changes
        </Button>
      </div>
    </div>
  )
}

function StateEditor() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">State Definition</h3>
      <p className="text-sm text-muted-foreground">Define the state keys and their data types for your graph.</p>

      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 rounded-md border bg-card p-2 text-sm font-medium">
          <div className="col-span-4">Key</div>
          <div className="col-span-3">Type</div>
          <div className="col-span-3">Default</div>
          <div className="col-span-2">Accumulate</div>
        </div>

        {["question", "context", "response", "history"].map((key, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 rounded-md border p-2">
            <div className="col-span-4">
              <Input defaultValue={key} />
            </div>
            <div className="col-span-3">
              <Select defaultValue={i === 3 ? "list" : "string"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">string</SelectItem>
                  <SelectItem value="number">number</SelectItem>
                  <SelectItem value="boolean">boolean</SelectItem>
                  <SelectItem value="list">list</SelectItem>
                  <SelectItem value="dict">dict</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3">
              <Input defaultValue={i === 3 ? "[]" : ""} />
            </div>
            <div className="col-span-2 flex items-center justify-center">
              <Switch defaultChecked={i === 3} />
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full">
          <Plus className="mr-1 h-4 w-4" />
          Add State Key
        </Button>
      </div>
    </div>
  )
}

function GraphEditor() {
  const sampleJson = `{
  "nodes": [
    {
      "id": "start-node",
      "type": "function",
      "data": {
        "label": "__start__",
        "description": "Entry point of the graph",
        "outputs": ["output"]
      },
      "position": { "x": 250, "y": 0 }
    },
    {
      "id": "node-1",
      "type": "llm",
      "data": {
        "label": "RETRIEVE",
        "description": "Retrieves information from a knowledge base",
        "outputs": ["documents"]
      },
      "position": { "x": 250, "y": 150 }
    },
    {
      "id": "node-2",
      "type": "function",
      "data": {
        "label": "GRADE_DOCUMENTS",
        "description": "Grades retrieved documents for relevance",
        "outputs": ["graded_docs"]
      },
      "position": { "x": 250, "y": 300 }
    },
    {
      "id": "end-node",
      "type": "function",
      "data": {
        "label": "__end__",
        "description": "Exit point of the graph",
        "outputs": []
      },
      "position": { "x": 250, "y": 450 }
    }
  ],
  "edges": [
    {
      "id": "edge-start-1",
      "source": "start-node",
      "target": "node-1",
      "data": {
        "label": "RETRIEVE",
        "isConditional": false
      }
    },
    {
      "id": "edge-1-2",
      "source": "node-1",
      "target": "node-2",
      "data": {
        "label": "documents",
        "isConditional": false
      }
    },
    {
      "id": "edge-2-end",
      "source": "node-2",
      "target": "end-node",
      "data": {
        "label": "result",
        "isConditional": false
      }
    }
  ]
}`

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Graph JSON</h3>
      <p className="text-sm text-muted-foreground">View and edit the raw JSON representation of your graph.</p>

      <div className="rounded-md border">
        <CodeEditor language="json" value={sampleJson} height="500px" />
      </div>
    </div>
  )
}
