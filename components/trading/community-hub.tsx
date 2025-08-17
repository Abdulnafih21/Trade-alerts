"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Star,
  Eye,
  Heart,
  Share2,
  Trophy,
  Medal,
  Award,
  Crown,
  Search,
  Filter,
  GitFork,
  BarChart3,
} from "lucide-react"

interface CommunityStrategy {
  id: string
  name: string
  description: string
  author: {
    id: string
    name: string
    avatar: string
    verified: boolean
    followers: number
    rank: number
  }
  category: "momentum" | "mean-reversion" | "breakout" | "scalping" | "swing" | "news-driven"
  performance: {
    returns: number
    sharpeRatio: number
    winRate: number
    maxDrawdown: number
    totalTrades: number
    profitFactor: number
  }
  stats: {
    subscribers: number
    likes: number
    views: number
    forks: number
    comments: number
  }
  tags: string[]
  createdAt: string
  lastUpdated: string
  version: string
  isPublic: boolean
  isPremium: boolean
  rating: number
  ratingCount: number
}

const mockStrategies: CommunityStrategy[] = [
  {
    id: "1",
    name: "Momentum Scalper Pro",
    description: "High-frequency momentum strategy with advanced liquidity filtering and news sentiment analysis",
    author: {
      id: "user1",
      name: "TradingPro",
      avatar: "/trader-avatar.png",
      verified: true,
      followers: 12847,
      rank: 1,
    },
    category: "momentum",
    performance: {
      returns: 127.5,
      sharpeRatio: 2.34,
      winRate: 68.2,
      maxDrawdown: 12.3,
      totalTrades: 1247,
      profitFactor: 1.89,
    },
    stats: {
      subscribers: 3421,
      likes: 892,
      views: 15623,
      forks: 234,
      comments: 156,
    },
    tags: ["scalping", "momentum", "crypto", "high-frequency"],
    createdAt: "2024-01-15",
    lastUpdated: "2024-08-10",
    version: "2.1.0",
    isPublic: true,
    isPremium: false,
    rating: 4.8,
    ratingCount: 342,
  },
  {
    id: "2",
    name: "Mean Reversion Master",
    description: "Statistical arbitrage strategy using Bollinger Bands and RSI with dynamic position sizing",
    author: {
      id: "user2",
      name: "QuantMaster",
      avatar: "/quant-trader.png",
      verified: true,
      followers: 8934,
      rank: 3,
    },
    category: "mean-reversion",
    performance: {
      returns: 89.2,
      sharpeRatio: 1.89,
      winRate: 72.1,
      maxDrawdown: 8.7,
      totalTrades: 892,
      profitFactor: 2.12,
    },
    stats: {
      subscribers: 2156,
      likes: 567,
      views: 9834,
      forks: 123,
      comments: 89,
    },
    tags: ["mean-reversion", "statistical", "forex", "stocks"],
    createdAt: "2024-02-20",
    lastUpdated: "2024-08-05",
    version: "1.8.2",
    isPublic: true,
    isPremium: true,
    rating: 4.6,
    ratingCount: 198,
  },
  {
    id: "3",
    name: "Breakout Hunter",
    description: "Multi-timeframe breakout strategy with volume confirmation and false breakout filtering",
    author: {
      id: "user3",
      name: "AlgoTrader",
      avatar: "/algorithmic-trader.png",
      verified: false,
      followers: 5621,
      rank: 7,
    },
    category: "breakout",
    performance: {
      returns: 156.8,
      sharpeRatio: 2.01,
      winRate: 64.5,
      maxDrawdown: 15.2,
      totalTrades: 2103,
      profitFactor: 1.76,
    },
    stats: {
      subscribers: 1834,
      likes: 423,
      views: 7234,
      forks: 89,
      comments: 67,
    },
    tags: ["breakout", "multi-timeframe", "crypto", "stocks"],
    createdAt: "2024-03-10",
    lastUpdated: "2024-08-12",
    version: "1.5.1",
    isPublic: true,
    isPremium: false,
    rating: 4.4,
    ratingCount: 156,
  },
  {
    id: "4",
    name: "News Sentiment AI",
    description: "Machine learning strategy that trades based on real-time news sentiment and social media buzz",
    author: {
      id: "user4",
      name: "AISignals",
      avatar: "/ai-trader.png",
      verified: true,
      followers: 3456,
      rank: 12,
    },
    category: "news-driven",
    performance: {
      returns: 73.4,
      sharpeRatio: 1.67,
      winRate: 59.8,
      maxDrawdown: 18.9,
      totalTrades: 567,
      profitFactor: 1.54,
    },
    stats: {
      subscribers: 987,
      likes: 234,
      views: 4567,
      forks: 45,
      comments: 78,
    },
    tags: ["ai", "sentiment", "news", "machine-learning"],
    createdAt: "2024-04-05",
    lastUpdated: "2024-08-08",
    version: "1.2.3",
    isPublic: true,
    isPremium: true,
    rating: 4.2,
    ratingCount: 89,
  },
]

const leaderboardData = [
  {
    rank: 1,
    user: "TradingPro",
    avatar: "/trader-in-bustling-market.png",
    verified: true,
    totalReturn: 127.5,
    sharpeRatio: 2.34,
    strategies: 12,
    subscribers: 12847,
    badge: "crown",
  },
  {
    rank: 2,
    user: "CryptoKing",
    avatar: "/busy-stock-market-trader.png",
    verified: true,
    totalReturn: 98.7,
    sharpeRatio: 2.12,
    strategies: 8,
    subscribers: 9876,
    badge: "gold",
  },
  {
    rank: 3,
    user: "QuantMaster",
    avatar: "/fantasy-merchant.png",
    verified: true,
    totalReturn: 89.2,
    sharpeRatio: 1.89,
    strategies: 15,
    subscribers: 8934,
    badge: "silver",
  },
  {
    rank: 4,
    user: "ForexGuru",
    avatar: "/metatrader-interface.png",
    verified: false,
    totalReturn: 76.3,
    sharpeRatio: 1.76,
    strategies: 6,
    subscribers: 6543,
    badge: "bronze",
  },
  {
    rank: 5,
    user: "SwingMaster",
    avatar: "/futuristic-stock-trader.png",
    verified: true,
    totalReturn: 65.8,
    sharpeRatio: 1.65,
    strategies: 9,
    subscribers: 5432,
    badge: "none",
  },
]

export function CommunityHub() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("popular")
  const [activeTab, setActiveTab] = useState("discover")

  const filteredStrategies = mockStrategies.filter((strategy) => {
    const matchesSearch =
      strategy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      strategy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      strategy.author.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || strategy.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedStrategies = [...filteredStrategies].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.stats.subscribers - a.stats.subscribers
      case "performance":
        return b.performance.returns - a.performance.returns
      case "recent":
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      case "rating":
        return b.rating - a.rating
      default:
        return 0
    }
  })

  const getRankBadge = (badge: string) => {
    switch (badge) {
      case "crown":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "gold":
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case "silver":
        return <Medal className="h-4 w-4 text-gray-400" />
      case "bronze":
        return <Award className="h-4 w-4 text-orange-600" />
      default:
        return null
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-[var(--font-heading)]">Community Hub</h2>
          <p className="text-muted-foreground">Discover, share, and learn from the best trading strategies</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Share2 className="h-4 w-4 mr-2" />
          Share Strategy
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="my-strategies">My Strategies</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {/* Search and Filters */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search strategies, authors, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="momentum">Momentum</SelectItem>
                    <SelectItem value="mean-reversion">Mean Reversion</SelectItem>
                    <SelectItem value="breakout">Breakout</SelectItem>
                    <SelectItem value="scalping">Scalping</SelectItem>
                    <SelectItem value="swing">Swing</SelectItem>
                    <SelectItem value="news-driven">News Driven</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="performance">Best Performance</SelectItem>
                    <SelectItem value="recent">Recently Updated</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Strategy Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedStrategies.map((strategy) => (
              <Card key={strategy.id} className="bg-card border-border hover:bg-card/80 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg font-[var(--font-heading)]">{strategy.name}</CardTitle>
                        {strategy.isPremium && (
                          <Badge variant="secondary" className="bg-primary/20 text-primary">
                            PRO
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{strategy.description}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{strategy.rating}</span>
                      <span className="text-xs text-muted-foreground">({strategy.ratingCount})</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Author Info */}
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={strategy.author.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{strategy.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium">{strategy.author.name}</span>
                        {strategy.author.verified && (
                          <Badge variant="outline" className="h-4 px-1 text-xs">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        #{strategy.author.rank} • {formatNumber(strategy.author.followers)} followers
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {strategy.category.replace("-", " ")}
                    </Badge>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-chart-4">+{strategy.performance.returns}%</div>
                      <div className="text-xs text-muted-foreground">Returns</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{strategy.performance.sharpeRatio}</div>
                      <div className="text-xs text-muted-foreground">Sharpe</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{strategy.performance.winRate}%</div>
                      <div className="text-xs text-muted-foreground">Win Rate</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {strategy.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats and Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{formatNumber(strategy.stats.subscribers)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{formatNumber(strategy.stats.likes)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{formatNumber(strategy.stats.views)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <GitFork className="h-3 w-3" />
                        <span>{strategy.stats.forks}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <GitFork className="h-3 w-3 mr-1" />
                        Fork
                      </Button>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        Subscribe
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-[var(--font-heading)]">Top Strategy Creators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboardData.map((user, index) => (
                  <div
                    key={user.rank}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold">
                          {user.rank}
                        </div>
                        {getRankBadge(user.badge)}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{user.user[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{user.user}</span>
                          {user.verified && (
                            <Badge variant="outline" className="h-4 px-1 text-xs">
                              ✓
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.strategies} strategies • {formatNumber(user.subscribers)} followers
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-chart-4">+{user.totalReturn}%</div>
                      <div className="text-sm text-muted-foreground">Sharpe: {user.sharpeRatio}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Best Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardData.slice(0, 3).map((user) => (
                    <div key={user.rank} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">{user.user[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{user.user}</span>
                      </div>
                      <span className="text-sm font-semibold text-chart-4">+{user.totalReturn}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Most Followed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...leaderboardData]
                    .sort((a, b) => b.subscribers - a.subscribers)
                    .slice(0, 3)
                    .map((user) => (
                      <div key={user.rank} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">{user.user[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{user.user}</span>
                        </div>
                        <span className="text-sm font-semibold">{formatNumber(user.subscribers)}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Most Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...leaderboardData]
                    .sort((a, b) => b.strategies - a.strategies)
                    .slice(0, 3)
                    .map((user) => (
                      <div key={user.rank} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">{user.user[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{user.user}</span>
                        </div>
                        <span className="text-sm font-semibold">{user.strategies}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="following" className="space-y-6">
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Follow Strategy Creators</h3>
              <p className="text-muted-foreground mb-4">
                Follow your favorite strategy creators to get updates on their latest strategies and performance
              </p>
              <Button className="bg-primary hover:bg-primary/90">Browse Creators</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-strategies" className="space-y-6">
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Share Your Strategies</h3>
              <p className="text-muted-foreground mb-4">
                Create and share your own trading strategies with the community
              </p>
              <Button className="bg-primary hover:bg-primary/90">Create Strategy</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
