"use client"

import { Download, FileJson, Play, Plus, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ToolbarProps {
  onGeneratePython: () => void
  onRunGraph: () => void
}

export function Toolbar({ onGeneratePython, onRunGraph }: ToolbarProps) {
  const { setTheme, theme } = useTheme()

  return (
    <div className="flex h-12 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-bold">LangGraph Builder</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Plus className="mr-1 h-4 w-4" />
          New
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FileJson className="mr-1 h-4 w-4" />
              Import/Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Import JSON</DropdownMenuItem>
            <DropdownMenuItem>Export JSON</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6" />

        <Button variant="outline" size="sm" onClick={onRunGraph}>
          <Play className="mr-1 h-4 w-4" />
          Run
        </Button>

        <Button variant="default" size="sm" onClick={onGeneratePython}>
          <Download className="mr-1 h-4 w-4" />
          Generate Python
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
