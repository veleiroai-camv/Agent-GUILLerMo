"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface ConsoleProps {
  className?: string
  onClose: () => void
}

export function Console({ className, onClose }: ConsoleProps) {
  return (
    <div className={cn("relative border-t bg-card", className)}>
      <div className="absolute right-2 top-2 z-10">
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close console">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="logs" className="h-full">
        <div className="border-b px-4">
          <TabsList>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="state">State</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="logs" className="h-[calc(100%-40px)] p-0">
          <ScrollArea className="h-full">
            <div className="space-y-1 p-4 font-mono text-sm">
              <div className="text-muted-foreground">
                <span className="text-primary">info</span> Graph execution started
              </div>
              <div>
                <span className="text-blue-500">step</span> Executing node: Question Analysis (LLM)
              </div>
              <div className="pl-4 text-muted-foreground">
                Prompt: Analyze the user question and extract key information.
              </div>
              <div className="pl-4">Response: The user is asking about climate change impacts on agriculture.</div>
              <div>
                <span className="text-blue-500">step</span> Executing node: Process Analysis (Function)
              </div>
              <div className="pl-4 text-muted-foreground">
                Input: {'analysis": "The user is asking about climate change impacts on agriculture.'}
              </div>
              <div className="pl-4">
                Output: {'result": "The user is asking about climate change impacts on agriculture.'}
              </div>
              <div>
                <span className="text-green-500">success</span> Graph execution completed
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="state" className="h-[calc(100%-40px)] p-0">
          <ScrollArea className="h-full">
            <div className="p-4 font-mono text-sm">
              <pre className="whitespace-pre-wrap">
                {`{
  "question": "How does climate change affect agriculture?",
  "analysis": "The user is asking about climate change impacts on agriculture.",
  "result": "The user is asking about climate change impacts on agriculture.",
  "history": [
    {"role": "user", "content": "How does climate change affect agriculture?"},
    {"role": "assistant", "content": "Climate change affects agriculture in several ways..."}
  ]
}`}
              </pre>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="errors" className="h-[calc(100%-40px)] p-0">
          <ScrollArea className="h-full">
            <div className="p-4 font-mono text-sm">
              <div className="text-muted-foreground">No errors reported</div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
