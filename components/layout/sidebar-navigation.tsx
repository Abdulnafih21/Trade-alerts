"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { BarChart3, TrendingUp, Zap, Users, Bell, TestTube, Briefcase, ChevronLeft, ChevronRight } from "lucide-react"

interface SidebarNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, badge: null },
  { id: "signals", label: "Signals", icon: Zap, badge: "LIVE" },
  { id: "strategies", label: "Strategies", icon: TrendingUp, badge: null },
  { id: "backtest", label: "Backtest", icon: TestTube, badge: null },
  { id: "community", label: "Community", icon: Users, badge: "NEW" },
  { id: "alerts", label: "Alerts", icon: Bell, badge: null },
  { id: "portfolio", label: "Portfolio", icon: Briefcase, badge: null },
]

export function SidebarNavigation({ activeTab, onTabChange, className }: SidebarNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "sticky top-16 h-[calc(100vh-4rem)] border-r border-border bg-card transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4">
          {!isCollapsed && <h2 className="font-semibold">Navigation</h2>}
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8 p-0">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-primary text-primary-foreground",
                  isCollapsed && "px-2",
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant={item.badge === "LIVE" ? "default" : "secondary"}
                        className={cn(
                          "ml-auto text-xs",
                          item.badge === "LIVE" && "bg-green-500 hover:bg-green-600",
                          item.badge === "NEW" && "bg-blue-500 hover:bg-blue-600",
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            )
          })}
        </nav>

        <div className="border-t border-border p-4">
          {!isCollapsed && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Quick Stats</div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Active Signals</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Win Rate</span>
                  <span className="font-medium text-green-500">73%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
