"use client"

import { useState, useEffect } from "react"
import type { Node, Edge } from "reactflow"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Download } from "lucide-react"
import { generatePythonCode, generateTypeScriptCode } from "@/lib/code-generator"

interface CodeGenerationDialogProps {
  open: boolean
  onClose: () => void
  nodes: Node[]
  edges: Edge[]
}

export function CodeGenerationDialog({ open, onClose, nodes, edges }: CodeGenerationDialogProps) {
  const [pythonCode, setPythonCode] = useState("")
  const [typescriptCode, setTypescriptCode] = useState("")
  const [activeTab, setActiveTab] = useState("python")

  useEffect(() => {
    if (open) {
      setPythonCode(generatePythonCode(nodes, edges))
      setTypescriptCode(generateTypeScriptCode(nodes, edges))
    }
  }, [open, nodes, edges])

  const handleCopyCode = () => {
    const codeToCopy = activeTab === "python" ? pythonCode : typescriptCode
    navigator.clipboard.writeText(codeToCopy)
  }

  const handleDownloadCode = () => {
    const codeToCopy = activeTab === "python" ? pythonCode : typescriptCode
    const fileName = activeTab === "python" ? "langgraph_agent.py" : "langgraph_agent.ts"
    const blob = new Blob([codeToCopy], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Generated Code</DialogTitle>
          <DialogDescription>
            Here's the code generated from your graph. You can copy it or download it.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="python" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="typescript">TypeScript</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyCode}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadCode}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
          <TabsContent value="python" className="mt-4">
            <ScrollArea className="h-[60vh] rounded-md border">
              <pre className="p-4 text-sm">
                <code>{pythonCode}</code>
              </pre>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="typescript" className="mt-4">
            <ScrollArea className="h-[60vh] rounded-md border">
              <pre className="p-4 text-sm">
                <code>{typescriptCode}</code>
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
