import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  Brain,
  Database,
  MessageSquare,
  Search,
  Workflow,
  PenToolIcon as Tool,
  ArrowRightLeft,
  Cpu,
  FileText,
} from "lucide-react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateNodeId() {
  return `node_${Math.random().toString(36).substr(2, 9)}`
}

export function getNodeIcon(type: string) {
  switch (type) {
    case "model":
      return <Brain className="h-4 w-4" />
    case "tools":
      return <Tool className="h-4 w-4" />
    case "rag":
      return <Database className="h-4 w-4" />
    case "chat":
      return <MessageSquare className="h-4 w-4" />
    case "retriever":
      return <Search className="h-4 w-4" />
    case "router":
      return <ArrowRightLeft className="h-4 w-4" />
    case "function":
      return <Cpu className="h-4 w-4" />
    case "prompt":
      return <FileText className="h-4 w-4" />
    case "start":
    case "end":
      return <Workflow className="h-4 w-4" />
    default:
      return <Cpu className="h-4 w-4" />
  }
}
