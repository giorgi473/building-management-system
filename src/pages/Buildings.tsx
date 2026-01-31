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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Home,
  Users,
  Loader2,
} from "lucide-react";
import { storage, StoredBuilding } from "@/lib/storage";
import { toast } from "sonner";

export default function Buildings() {
  const [buildings, setBuildings] = useState<StoredBuilding[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBuildingName, setNewBuildingName] = useState("");
  const [newBuildingAddress, setNewBuildingAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const isAdmin =
    user?.role === "super_admin" ||
    user?.role === "manager" ||
    user?.role === "building_admin";

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Small delay for UX
    const storedBuildings = storage.getBuildings();
    setBuildings(storedBuildings);
    setIsLoading(false);
  };

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newBuildingName.trim() || !newBuildingAddress.trim()) {
      toast.error("გთხოვთ შეავსოთ ყველა ველი");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const building = storage.addBuilding({
        name: newBuildingName.trim(),
        address: newBuildingAddress.trim(),
      });

      setBuildings([...buildings, building]);
      toast.success("შენობა წარმატებით დაემატა!");
      setIsCreateDialogOpen(false);
      setNewBuildingName("");
      setNewBuildingAddress("");
    } catch (error) {
      toast.error("დაფიქსირდა შეცდომა");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBuildings = buildings.filter(
    (building) =>
      building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      building.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Generate random but consistent stats for each building
  const getBuildingStats = (buildingId: string) => {
    const hash = buildingId
      .split("")
      .reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
    return {
      units: Math.abs(hash % 50) + 10,
      residents: Math.abs((hash * 2) % 100) + 20,
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">შენობები</h1>
          <p className="text-muted-foreground mt-1">
            მართეთ შენობები და ბინები
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            შენობის დამატება
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="მოძებნე შენობა..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Buildings Grid */}
      {filteredBuildings.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBuildings.map((building, index) => {
            const stats = getBuildingStats(building.id);
            return (
              <Card
                key={building.id}
                className="group hover:shadow-card transition-all duration-300 cursor-pointer animate-slide-up overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Building Image Placeholder */}
                <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-primary/40 group-hover:scale-110 transition-transform" />
                </div>

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {building.name}
                    </CardTitle>
                    <Badge variant="secondary" className="shrink-0">
                      <Home className="h-3 w-3 mr-1" />
                      {stats.units} ბინა
                    </Badge>
                  </div>
                  <CardDescription className="flex items-start gap-2 mt-2">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    {building.address}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {stats.residents} მაცხოვრებელი
                    </span>
                    <Button variant="outline" size="sm">
                      დეტალები
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="py-12">
          <CardContent className="text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-medium mb-1">შენობები არ მოიძებნა</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "სცადეთ სხვა საძიებო ფრაზა"
                : "ჯერ არ არის დამატებული შენობა"}
            </p>
            {isAdmin && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                შენობის დამატება
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Building Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>ახალი შენობის დამატება</DialogTitle>
            <DialogDescription>შეიყვანეთ შენობის ინფორმაცია</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBuilding} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buildingName">შენობის სახელი *</Label>
              <Input
                id="buildingName"
                placeholder="მაგ: Sunset Apartments"
                value={newBuildingName}
                onChange={(e) => setNewBuildingName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buildingAddress">მისამართი *</Label>
              <Input
                id="buildingAddress"
                placeholder="მაგ: რუსთაველის გამზ. 24, თბილისი"
                value={newBuildingAddress}
                onChange={(e) => setNewBuildingAddress(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                გაუქმება
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ემატება...
                  </>
                ) : (
                  "დამატება"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
