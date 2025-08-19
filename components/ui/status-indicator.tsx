import { cn } from "@/lib/utils"

interface StatusIndicatorProps {
  status: "online" | "offline" | "connecting" | "error"
  label?: string
  className?: string
}

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const statusConfig = {
    online: { color: "bg-green-500", text: "Connected" },
    offline: { color: "bg-red-500", text: "Disconnected" },
    connecting: { color: "bg-yellow-500 animate-pulse", text: "Connecting" },
    error: { color: "bg-red-500 animate-pulse", text: "Error" },
  }

  const config = statusConfig[status]

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className={cn("w-2 h-2 rounded-full", config.color)} />
      {label && <span className="text-sm text-muted-foreground">{label || config.text}</span>}
    </div>
  )
}
