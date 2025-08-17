"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Bell,
  Plus,
  Settings,
  Trash2,
  Mail,
  Smartphone,
  Webhook,
  MessageCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { alertEngine, type AlertRule, type AlertHistory, type AlertCondition } from "@/lib/alert-engine"

export default function AlertDashboard() {
  const [rules, setRules] = useState<AlertRule[]>([])
  const [history, setHistory] = useState<AlertHistory[]>([])
  const [stats, setStats] = useState<any>({})
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    name: "",
    conditions: [],
    logic: "AND",
    channels: [],
    throttle: 15,
    cooldown: 60,
    active: true,
  })

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadData = () => {
    setRules(alertEngine.getRules())
    setHistory(alertEngine.getHistory())
    setStats(alertEngine.getAlertStats())
  }

  const toggleRule = (id: string, active: boolean) => {
    alertEngine.updateRule(id, { active })
    loadData()
  }

  const deleteRule = (id: string) => {
    alertEngine.deleteRule(id)
    loadData()
  }

  const createRule = () => {
    if (newRule.name && newRule.conditions && newRule.conditions.length > 0) {
      alertEngine.createRule(newRule as Omit<AlertRule, "id" | "created" | "triggerCount">)
      setNewRule({
        name: "",
        conditions: [],
        logic: "AND",
        channels: [],
        throttle: 15,
        cooldown: 60,
        active: true,
      })
      setIsCreateDialogOpen(false)
      loadData()
    }
  }

  const addCondition = () => {
    const condition: AlertCondition = {
      id: `cond_${Date.now()}`,
      type: "price",
      symbol: "BTCUSDT",
      operator: "above",
      value: 0,
    }
    setNewRule((prev) => ({
      ...prev,
      conditions: [...(prev.conditions || []), condition],
    }))
  }

  const updateCondition = (index: number, updates: Partial<AlertCondition>) => {
    setNewRule((prev) => ({
      ...prev,
      conditions: prev.conditions?.map((cond, i) => (i === index ? { ...cond, ...updates } : cond)) || [],
    }))
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "push":
        return <Smartphone className="h-4 w-4" />
      case "webhook":
        return <Webhook className="h-4 w-4" />
      case "telegram":
        return <MessageCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) return `${hours}h ${minutes}m ago`
    return `${minutes}m ago`
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Rules</p>
                <p className="text-2xl font-bold">{stats.totalRules || 0}</p>
              </div>
              <Bell className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold text-green-500">{stats.activeRules || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Triggers</p>
                <p className="text-2xl font-bold">{stats.totalTriggers || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Delivery</p>
                <p className="text-2xl font-bold">{stats.avgDeliveryTime || 0}ms</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="rules">Alert Rules</TabsTrigger>
            <TabsTrigger value="history">Alert History</TabsTrigger>
          </TabsList>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Alert Rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    value={newRule.name || ""}
                    onChange={(e) => setNewRule((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter rule name"
                  />
                </div>

                <div>
                  <Label>Conditions</Label>
                  <div className="space-y-2">
                    {newRule.conditions?.map((condition, index) => (
                      <div key={condition.id} className="flex items-center gap-2 p-3 border rounded-lg">
                        <Select
                          value={condition.type}
                          onValueChange={(value) => updateCondition(index, { type: value as any })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="price">Price</SelectItem>
                            <SelectItem value="indicator">Indicator</SelectItem>
                            <SelectItem value="volume">Volume</SelectItem>
                          </SelectContent>
                        </Select>

                        <Input
                          value={condition.symbol}
                          onChange={(e) => updateCondition(index, { symbol: e.target.value })}
                          placeholder="Symbol"
                          className="w-24"
                        />

                        <Select
                          value={condition.operator}
                          onValueChange={(value) => updateCondition(index, { operator: value as any })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="above">Above</SelectItem>
                            <SelectItem value="below">Below</SelectItem>
                            <SelectItem value="crosses_above">Crosses Above</SelectItem>
                            <SelectItem value="crosses_below">Crosses Below</SelectItem>
                          </SelectContent>
                        </Select>

                        <Input
                          type="number"
                          value={condition.value}
                          onChange={(e) => updateCondition(index, { value: Number.parseFloat(e.target.value) })}
                          placeholder="Value"
                          className="w-24"
                        />
                      </div>
                    ))}
                    <Button variant="outline" onClick={addCondition}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="throttle">Throttle (minutes)</Label>
                    <Input
                      id="throttle"
                      type="number"
                      value={newRule.throttle || 15}
                      onChange={(e) => setNewRule((prev) => ({ ...prev, throttle: Number.parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cooldown">Cooldown (minutes)</Label>
                    <Input
                      id="cooldown"
                      type="number"
                      value={newRule.cooldown || 60}
                      onChange={(e) => setNewRule((prev) => ({ ...prev, cooldown: Number.parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Notification Channels</Label>
                  <div className="flex gap-2 mt-2">
                    {["email", "push", "webhook", "telegram"].map((channel) => (
                      <Button
                        key={channel}
                        variant={newRule.channels?.includes(channel as any) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const channels = newRule.channels || []
                          const updated = channels.includes(channel as any)
                            ? channels.filter((c) => c !== channel)
                            : [...channels, channel as any]
                          setNewRule((prev) => ({ ...prev, channels: updated }))
                        }}
                      >
                        {getChannelIcon(channel)}
                        <span className="ml-2 capitalize">{channel}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createRule}>Create Rule</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="rules" className="space-y-4">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <Badge variant={rule.active ? "default" : "secondary"}>{rule.active ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={rule.active} onCheckedChange={(checked) => toggleRule(rule.id, checked)} />
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteRule(rule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Conditions:</p>
                    <div className="flex flex-wrap gap-2">
                      {rule.conditions.map((condition, index) => (
                        <Badge key={condition.id} variant="outline">
                          {condition.symbol} {condition.type} {condition.operator} {condition.value}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">Channels:</span>
                      <div className="flex gap-1">
                        {rule.channels.map((channel) => (
                          <div key={channel} className="flex items-center gap-1">
                            {getChannelIcon(channel)}
                            <span className="capitalize">{channel}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span>Triggers: {rule.triggerCount}</span>
                      <span>Throttle: {rule.throttle}m</span>
                      <span>Cooldown: {rule.cooldown}m</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {history.map((alert) => (
            <Card key={alert.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${alert.delivered ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                    >
                      {alert.delivered ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{alert.ruleName}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatTimeAgo(alert.timestamp)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {alert.channels.map((channel) => (
                        <div key={channel} className="text-muted-foreground">
                          {getChannelIcon(channel)}
                        </div>
                      ))}
                      {alert.deliveryTime && (
                        <span className="text-xs text-muted-foreground ml-2">{alert.deliveryTime}ms</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
