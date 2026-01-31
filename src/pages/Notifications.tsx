import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCheck,
  Ticket,
  MessageSquare,
  Users,
  Building2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { storage, StoredNotification } from "@/lib/storage";
import { format } from "date-fns";
import { ka } from "date-fns/locale";

export default function Notifications() {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userId = localStorage.getItem("demoEmail") || "demo-user-001";

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    setIsLoading(true);
    const storedNotifications = storage.getNotifications(userId);
    setNotifications(storedNotifications);
    setIsLoading(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ticket_created":
      case "ticket_resolved":
        return <Ticket className="h-5 w-5" />;
      case "community_post":
        return <MessageSquare className="h-5 w-5" />;
      case "visitor_pass":
        return <Users className="h-5 w-5" />;
      case "building":
        return <Building2 className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ticket_created":
        return "bg-warning/10 text-warning";
      case "ticket_resolved":
        return "bg-success/10 text-success";
      case "community_post":
        return "bg-primary/10 text-primary";
      case "visitor_pass":
        return "bg-accent/10 text-accent";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "ახლახანს";
      if (minutes < 60) return `${minutes} წთ წინ`;
      if (hours < 24) return `${hours} სთ წინ`;
      if (days < 7) return `${days} დღის წინ`;
      return format(date, "d MMM", { locale: ka });
    } catch {
      return dateString;
    }
  };

  const handleMarkAsRead = (id: string) => {
    const updated = storage.markNotificationRead(id);
    if (updated) {
      setNotifications(notifications.map((n) => (n.id === id ? updated : n)));
      toast.success("წაკითხულად მონიშნულია");
    }
  };

  const handleMarkAllAsRead = () => {
    storage.markAllNotificationsRead(userId);
    setNotifications(
      notifications.map((n) => ({
        ...n,
        readAt: n.readAt || new Date().toISOString(),
      })),
    );
    toast.success("ყველა შეტყობინება წაკითხულად მონიშნულია");
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold">შეტყობინებები</h1>
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground">
                {unreadCount} ახალი
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            თვალი ადევნეთ უახლეს აქტივობას
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            ყველას წაკითხულად მონიშვნა
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification, index) => (
            <Card
              key={notification.id}
              className={`hover:shadow-card transition-all duration-300 cursor-pointer animate-slide-up ${
                !notification.readAt
                  ? "border-l-4 border-l-primary bg-primary/5"
                  : ""
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() =>
                !notification.readAt && handleMarkAsRead(notification.id)
              }
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}
                  >
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className={`font-medium ${
                            !notification.readAt
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.body}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12">
          <CardContent className="text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-medium mb-1">შეტყობინებები არ არის</h3>
            <p className="text-muted-foreground">
              ყველაფერი წაკითხულია! შეამოწმეთ მოგვიანებით.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
