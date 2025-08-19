"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check } from "lucide-react"

interface CodeBlockProps {
  code: string
  language: string
  title?: string
  filename?: string
}

export function CodeBlock({ code, language, title, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative rounded-lg border border-border bg-muted/30 overflow-hidden">
      {(title || filename) && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
          <div className="flex items-center space-x-2">
            {title && <span className="text-sm font-medium">{title}</span>}
            {filename && (
              <Badge variant="outline" className="text-xs">
                {filename}
              </Badge>
            )}
          </div>
          <Badge variant="secondary" className="text-xs">
            {language}
          </Badge>
        </div>
      )}
      <div className="relative">
        <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-8 w-8 p-0" onClick={copyToClipboard}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-foreground">{code}</code>
        </pre>
      </div>
    </div>
  )
}
