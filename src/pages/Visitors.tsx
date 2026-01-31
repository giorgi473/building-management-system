import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  QrCode,
  Copy,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { storage, StoredVisitorPass } from "@/lib/storage";
import { CreateVisitorPassDialog } from "@/components/dialogs/CreateVisitorPassDialog";
import { QRCodeDialog } from "@/components/dialogs/QRCodeDialog";
import { format } from "date-fns";
import { ka } from "date-fns/locale";

export default function Visitors() {
  const [passes, setPasses] = useState<StoredVisitorPass[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState<StoredVisitorPass | null>(
    null,
  );
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [passToRevoke, setPassToRevoke] = useState<StoredVisitorPass | null>(
    null,
  );

  useEffect(() => {
    loadPasses();
  }, []);

  const loadPasses = () => {
    const storedPasses = storage.getVisitorPasses();
    setPasses(storedPasses);
  };

  const handlePassCreated = (pass: StoredVisitorPass) => {
    setPasses([pass, ...passes]);
  };

  const handleShowQR = (pass: StoredVisitorPass) => {
    setSelectedPass(pass);
    setIsQRDialogOpen(true);
  };

  const handleRevokePass = (pass: StoredVisitorPass) => {
    setPassToRevoke(pass);
  };

  const confirmRevoke = () => {
    if (passToRevoke) {
      const revoked = storage.revokeVisitorPass(passToRevoke.id);
      if (revoked) {
        setPasses(passes.map((p) => (p.id === passToRevoke.id ? revoked : p)));
        toast.success("ბარათი გაუქმებულია");
      }
    }
    setPassToRevoke(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-success text-success-foreground">აქტიური</Badge>
        );
      case "used":
        return <Badge variant="secondary">გამოყენებული</Badge>;
      case "revoked":
        return (
          <Badge className="bg-destructive text-destructive-foreground">
            გაუქმებული
          </Badge>
        );
      case "expired":
        return <Badge variant="outline">ვადაგასული</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "used":
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
      case "revoked":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "expired":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMM, HH:mm", { locale: ka });
    } catch {
      return dateString;
    }
  };

  const filteredPasses = passes.filter((pass) => {
    const matchesSearch = pass.visitorName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "expired")
      return (
        matchesSearch &&
        (pass.status === "expired" || pass.status === "revoked")
      );
    return matchesSearch && pass.status === activeTab;
  });

  const passCounts = {
    all: passes.length,
    active: passes.filter((p) => p.status === "active").length,
    used: passes.filter((p) => p.status === "used").length,
    expired: passes.filter(
      (p) => p.status === "expired" || p.status === "revoked",
    ).length,
  };

  const handleCopyCode = (id: string) => {
    navigator.clipboard.writeText(`PASS-${id.toUpperCase().slice(0, 8)}`);
    toast.success("კოდი დაკოპირდა!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">
            სტუმრების ბარათები
          </h1>
          <p className="text-muted-foreground mt-1">
            მართეთ სტუმრების წვდომა შენობაზე
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          ახალი ბარათი
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  აქტიური ბარათები
                </p>
                <p className="text-3xl font-bold font-display">
                  {passCounts.active}
                </p>
              </div>
              <div className="p-3 rounded-full bg-success/20">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  გამოყენებული
                </p>
                <p className="text-3xl font-bold font-display">
                  {passCounts.used}
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-muted to-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  ვადაგასული/გაუქმებული
                </p>
                <p className="text-3xl font-bold font-display">
                  {passCounts.expired}
                </p>
              </div>
              <div className="p-3 rounded-full bg-muted-foreground/20">
                <XCircle className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="მოძებნე სტუმრის სახელით..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="all">ყველა</TabsTrigger>
          <TabsTrigger value="active">აქტიური</TabsTrigger>
          <TabsTrigger value="used">გამოყენებული</TabsTrigger>
          <TabsTrigger value="expired">ვადაგასული</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredPasses.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPasses.map((pass, index) => (
                <Card
                  key={pass.id}
                  className="hover:shadow-card transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      {getStatusIcon(pass.status)}
                      {getStatusBadge(pass.status)}
                    </div>
                    <CardTitle className="mt-3">{pass.visitorName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>დაწყება: {formatDateTime(pass.validFrom)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>დასრულება: {formatDateTime(pass.validTo)}</span>
                      </div>
                    </div>

                    {pass.status === "active" && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => handleShowQR(pass)}
                        >
                          <QrCode className="h-4 w-4" />
                          QR კოდი
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleCopyCode(pass.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-destructive hover:text-destructive"
                          onClick={() => handleRevokePass(pass)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="py-12">
              <CardContent className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-medium mb-1">
                  ბარათები არ მოიძებნა
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "სცადეთ სხვა საძიებო ფრაზა"
                    : "შექმენით ბარათი სტუმრის დასაშვებად"}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  ახალი ბარათი
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <CreateVisitorPassDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onPassCreated={handlePassCreated}
      />

      <QRCodeDialog
        open={isQRDialogOpen}
        onOpenChange={setIsQRDialogOpen}
        pass={selectedPass}
      />

      <AlertDialog
        open={!!passToRevoke}
        onOpenChange={(open) => !open && setPassToRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ბარათის გაუქმება</AlertDialogTitle>
            <AlertDialogDescription>
              დარწმუნებული ხართ რომ გსურთ ამ ბარათის გაუქმება? ეს მოქმედება
              შეუქცევადია და სტუმარი ვეღარ შეძლებს შესვლას.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>გაუქმება</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRevoke}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              დადასტურება
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
