"use client"

import { Button } from "@/components/ui/button"
import { Keyboard, Code, FileCode } from "lucide-react"

interface HeaderProps {
  onShowKeyCommands: () => void
  onShowTemplates: () => void
  onGenerateCode: () => void
}

export function Header({ onShowKeyCommands, onShowTemplates, onGenerateCode }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">LangGraph Builder</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onShowKeyCommands}>
          <Keyboard className="mr-2 h-4 w-4" />
          Key Commands
        </Button>
        <Button variant="outline" size="sm" onClick={onShowTemplates}>
          <FileCode className="mr-2 h-4 w-4" />
          Templates
        </Button>
        <Button variant="default" size="sm" onClick={onGenerateCode}>
          <Code className="mr-2 h-4 w-4" />
          Generate Code
        </Button>
      </div>
    </header>
  )
}
