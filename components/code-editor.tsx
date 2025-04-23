"use client"

import { useRef, useEffect } from "react"
import Editor from "@monaco-editor/react"

interface CodeEditorProps {
  language: string
  value: string
  height?: string
  onChange?: (value: string | undefined) => void
}

export function CodeEditor({ language, value, height = "300px", onChange }: CodeEditorProps) {
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+S to save
      if ((e.metaKey || e.ctrlKey) && e.key === "s" && editorRef.current) {
        e.preventDefault()
        console.log("Saving code:", editorRef.current.getValue())
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 13,
        tabSize: 2,
        wordWrap: "on",
      }}
      onMount={handleEditorDidMount}
      onChange={onChange}
    />
  )
}
