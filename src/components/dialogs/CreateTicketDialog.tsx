import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { storage, StoredTicket } from "@/lib/storage";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTicketCreated: (ticket: StoredTicket) => void;
  buildingId?: string;
}

const categories = [
  { value: "maintenance", label: "მოვლა-პატრონობა" },
  { value: "repair", label: "შეკეთება" },
  { value: "complaint", label: "საჩივარი" },
  { value: "other", label: "სხვა" },
];

const priorities = [
  { value: "low", label: "დაბალი", color: "bg-muted" },
  { value: "medium", label: "საშუალო", color: "bg-primary" },
  { value: "high", label: "მაღალი", color: "bg-warning" },
  { value: "urgent", label: "სასწრაფო", color: "bg-destructive" },
];

export function CreateTicketDialog({
  open,
  onOpenChange,
  onTicketCreated,
  buildingId = "b1",
}: CreateTicketDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [priority, setPriority] = useState<string>("medium");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !category) {
      toast.error("გთხოვთ შეავსოთ ყველა ველი");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const userId = localStorage.getItem("demoEmail") || "demo-user-001";

      const ticket = storage.addTicket({
        buildingId,
        unitId: "u1",
        createdByUserId: userId,
        title: title.trim(),
        description: description.trim(),
        category: category as StoredTicket["category"],
        priority: priority as StoredTicket["priority"],
      });

      toast.success("ტიკეტი წარმატებით შეიქმნა!");
      onTicketCreated(ticket);
      onOpenChange(false);

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setPriority("medium");
    } catch (error) {
      toast.error("დაფიქსირდა შეცდომა");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>ახალი ტიკეტის შექმნა</DialogTitle>
          <DialogDescription>
            აღწერეთ თქვენი პრობლემა ან მოთხოვნა
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">სათაური *</Label>
            <Input
              id="title"
              placeholder="მაგ: წყლის გაჟონვა აბაზანაში"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">აღწერა *</Label>
            <Textarea
              id="description"
              placeholder="დეტალურად აღწერეთ პრობლემა..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>კატეგორია *</Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="აირჩიეთ" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>პრიორიტეტი</Label>
              <Select
                value={priority}
                onValueChange={setPriority}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="აირჩიეთ" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${p.color}`} />
                        {p.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              გაუქმება
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  იქმნება...
                </>
              ) : (
                "შექმნა"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
