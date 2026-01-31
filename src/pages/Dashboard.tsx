import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Ticket,
  Users,
  Bell,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { storage, StoredTicket } from "@/lib/storage";

interface DashboardStats {
  buildings: number;
  openTickets: number;
  activeVisitors: number;
  unreadNotifications: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    buildings: 0,
    openTickets: 0,
    activeVisitors: 0,
    unreadNotifications: 0,
  });
  const [recentTickets, setRecentTickets] = useState<StoredTicket[]>([]);

  const userId = localStorage.getItem("demoEmail") || "demo-user-001";

  useEffect(() => {
    // Fetch all stats from localStorage
    const buildings = storage.getBuildings();
    const tickets = storage.getTickets();
    const visitors = storage.getVisitorPasses();
    const notifications = storage.getNotifications(userId);

    setStats({
      buildings: buildings.length,
      openTickets: tickets.filter((t) => t.status === "open").length,
      activeVisitors: visitors.filter((v) => v.status === "active").length,
      unreadNotifications: notifications.filter((n) => !n.readAt).length,
    });

    // Get recent tickets (last 3)
    const recent = tickets
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 3);
    setRecentTickets(recent);
  }, [userId]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "დილა მშვიდობისა";
    if (hour < 17) return "შუადღე მშვიდობისა";
    return "საღამო მშვიდობისა";
  };

  const userName = user?.email?.split("@")[0] || "მომხმარებელი";

  const statCards = [
    {
      title: "შენობები",
      value: stats.buildings,
      icon: Building2,
      change: "სულ",
      href: "/buildings",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "ღია ტიკეტები",
      value: stats.openTickets,
      icon: Ticket,
      change: "საჭიროებს ყურადღებას",
      href: "/tickets",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "აქტიური სტუმრები",
      value: stats.activeVisitors,
      icon: Users,
      change: "დღეს",
      href: "/visitors",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "შეტყობინებები",
      value: stats.unreadNotifications,
      icon: Bell,
      change: "წასაკითხი",
      href: "/notifications",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-warning text-warning-foreground";
      case "medium":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "სასწრაფო";
      case "high":
        return "მაღალი";
      case "medium":
        return "საშუალო";
      default:
        return "დაბალი";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
      case "closed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">
            {getGreeting()}, {userName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            აი რა ხდება თქვენს შენობებში დღეს.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/tickets">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Ticket className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">ახალი ტიკეტი</span>
            </Button>
          </Link>
          <Link to="/visitors">
            <Button
              size="sm"
              className="bg-success hover:bg-success/90 text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">სტუმრის დამატება</span>
            </Button>
          </Link>
          <Link to="/community">
            <Button
              size="sm"
              className="bg-accent hover:bg-accent/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">ახალი პოსტი</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Link key={stat.title} to={stat.href}>
            <Card
              className="relative overflow-hidden hover:shadow-card transition-all duration-300 cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div
                  className={`p-2 rounded-lg ${stat.bgColor} transition-transform group-hover:scale-110`}
                >
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change}
                </p>
              </CardContent>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          </Link>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Tickets */}
        <Card className="animate-slide-up" style={{ animationDelay: "400ms" }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>ბოლო ტიკეტები</CardTitle>
              <CardDescription>
                უახლესი პრობლემები და მოთხოვნები
              </CardDescription>
            </div>
            <Link to="/tickets">
              <Button variant="ghost" size="sm">
                ყველას ნახვა <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTickets.length > 0 ? (
              <div className="space-y-4">
                {recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    {getStatusIcon(ticket.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString("ka-GE")}
                      </p>
                    </div>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {getPriorityLabel(ticket.priority)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>ტიკეტები არ არის</p>
                <Link to="/tickets">
                  <Button variant="link" size="sm">
                    შექმენით პირველი ტიკეტი
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Overview */}
        <Card className="animate-slide-up" style={{ animationDelay: "500ms" }}>
          <CardHeader>
            <CardTitle>სწრაფი მიმოხილვა</CardTitle>
            <CardDescription>შენობის მართვის შეჯამება</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">აქტიური შენობები</p>
                    <p className="text-sm text-muted-foreground">
                      მართვის ქვეშ
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold font-display">
                  {stats.buildings}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-success/10 to-success/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-success/20">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">მოგვარებული ამ კვირაში</p>
                    <p className="text-sm text-muted-foreground">
                      დასრულებული ტიკეტები
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold font-display">
                  {
                    storage.getTickets().filter((t) => t.status === "resolved")
                      .length
                  }
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-warning/10 to-warning/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-warning/20">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium">მიმდინარე მოქმედებები</p>
                    <p className="text-sm text-muted-foreground">
                      საჭიროებს ყურადღებას
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold font-display">
                  {
                    storage
                      .getTickets()
                      .filter((t) => t.status === "in_progress").length
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
