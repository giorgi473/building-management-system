import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Ticket,
  Plus,
  Search,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  Filter,
  MoreVertical,
  Trash2,
  Eye,
  XCircle,
} from "lucide-react";
import { storage, StoredTicket } from "@/lib/storage";
import { CreateTicketDialog } from "@/components/dialogs/CreateTicketDialog";
import { toast } from "sonner";

export default function Tickets() {
  const [tickets, setTickets] = useState<StoredTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = () => {
    const storedTickets = storage.getTickets();
    setTickets(storedTickets);
  };

  const handleTicketCreated = (ticket: StoredTicket) => {
    setTickets([ticket, ...tickets]);
  };

  const handleStatusChange = (
    ticketId: string,
    status: StoredTicket["status"],
  ) => {
    const updated = storage.updateTicketStatus(ticketId, status);
    if (updated) {
      setTickets(tickets.map((t) => (t.id === ticketId ? updated : t)));
      toast.success("სტატუსი განახლდა");
    }
  };

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

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "maintenance":
        return "მოვლა";
      case "repair":
        return "შეკეთება";
      case "complaint":
        return "საჩივარი";
      default:
        return "სხვა";
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "ღია";
      case "in_progress":
        return "მიმდინარე";
      case "resolved":
        return "მოგვარებული";
      case "closed":
        return "დახურული";
      default:
        return status;
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && ticket.status === activeTab;
  });

  const ticketCounts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter(
      (t) => t.status === "resolved" || t.status === "closed",
    ).length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">ტიკეტები</h1>
          <p className="text-muted-foreground mt-1">
            მართეთ და თვალყური ადევნეთ მოთხოვნებს
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          ახალი ტიკეტი
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ღია</p>
                <p className="text-2xl font-bold">{ticketCounts.open}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  მიმდინარე
                </p>
                <p className="text-2xl font-bold">{ticketCounts.in_progress}</p>
              </div>
              <Clock className="h-8 w-8 text-warning/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  მოგვარებული
                </p>
                <p className="text-2xl font-bold">{ticketCounts.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">სულ</p>
                <p className="text-2xl font-bold">{ticketCounts.all}</p>
              </div>
              <Ticket className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="მოძებნე ტიკეტი..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="all">ყველა ({ticketCounts.all})</TabsTrigger>
          <TabsTrigger value="open">ღია ({ticketCounts.open})</TabsTrigger>
          <TabsTrigger value="in_progress">
            მიმდინარე ({ticketCounts.in_progress})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            მოგვარებული ({ticketCounts.resolved})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredTickets.length > 0 ? (
            <div className="space-y-4">
              {filteredTickets.map((ticket, index) => (
                <Card
                  key={ticket.id}
                  className="hover:shadow-card transition-all duration-300 group animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(ticket.status)}
                        <div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {ticket.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {ticket.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {getPriorityLabel(ticket.priority)}
                        </Badge>
                        <Badge variant="outline">
                          {getCategoryLabel(ticket.category)}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(ticket.id, "in_progress")
                              }
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              მიმდინარედ მონიშვნა
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(ticket.id, "resolved")
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              მოგვარებულად მონიშვნა
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(ticket.id, "closed")
                              }
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              დახურვა
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(ticket.createdAt).toLocaleDateString("ka-GE")}
                      </span>
                      <Badge variant="secondary">
                        {getStatusLabel(ticket.status)}
                      </Badge>
                      {ticket.assignedToUserId && (
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          მინიჭებულია
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="py-12">
              <CardContent className="text-center">
                <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-medium mb-1">
                  ტიკეტები არ მოიძებნა
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "სცადეთ სხვა საძიებო ფრაზა"
                    : "შექმენით ტიკეტი პრობლემის შესატყობინებლად"}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  ახალი ტიკეტი
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <CreateTicketDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTicketCreated={handleTicketCreated}
      />
    </div>
  );
}
