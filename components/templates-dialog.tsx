"use client"

import type React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, MessageSquare, PenToolIcon as Tool } from "lucide-react"

interface Template {
  id: string
  name: string
  description: string
  icon: React.ReactNode
}

interface TemplatesDialogProps {
  open: boolean
  onClose: () => void
  onSelectTemplate: (template: Template) => void
}

export function TemplatesDialog({ open, onClose, onSelectTemplate }: TemplatesDialogProps) {
  const templates: Template[] = [
    {
      id: "rag-pipeline",
      name: "RAG Pipeline",
      description: "A basic RAG (Retrieval Augmented Generation) pipeline with document retrieval and generation.",
      icon: <Database className="h-5 w-5" />,
    },
    {
      id: "agent-with-tools",
      name: "Agent with Tools",
      description: "An agent that can use different tools based on the input.",
      icon: <Tool className="h-5 w-5" />,
    },
    {
      id: "chat-model",
      name: "Chat Model",
      description: "A simple chat model with memory and response generation.",
      icon: <MessageSquare className="h-5 w-5" />,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Templates</DialogTitle>
          <DialogDescription>Choose a template to get started quickly.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 p-1">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:bg-accent"
                onClick={() => onSelectTemplate(template)}
              >
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <div className="rounded-full bg-muted p-2">{template.icon}</div>
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{template.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
