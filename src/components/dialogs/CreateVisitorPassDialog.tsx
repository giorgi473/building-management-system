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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { storage, StoredVisitorPass } from "@/lib/storage";
import { toast } from "sonner";
import { Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ka } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CreateVisitorPassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPassCreated: (pass: StoredVisitorPass) => void;
  buildingId?: string;
}

export function CreateVisitorPassDialog({
  open,
  onOpenChange,
  onPassCreated,
  buildingId = "b1",
}: CreateVisitorPassDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [validFrom, setValidFrom] = useState<Date | undefined>(new Date());
  const [validTo, setValidTo] = useState<Date | undefined>(
    new Date(Date.now() + 24 * 60 * 60 * 1000),
  );
  const [fromTime, setFromTime] = useState("10:00");
  const [toTime, setToTime] = useState("18:00");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!visitorName.trim() || !validFrom || !validTo) {
      toast.error("გთხოვთ შეავსოთ ყველა ველი");
      return;
    }

    // Combine date and time
    const fromDateTime = new Date(validFrom);
    const [fromHours, fromMinutes] = fromTime.split(":");
    fromDateTime.setHours(parseInt(fromHours), parseInt(fromMinutes), 0, 0);

    const toDateTime = new Date(validTo);
    const [toHours, toMinutes] = toTime.split(":");
    toDateTime.setHours(parseInt(toHours), parseInt(toMinutes), 0, 0);

    if (toDateTime <= fromDateTime) {
      toast.error("დასრულების დრო უნდა იყოს დაწყების დროის შემდეგ");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const residentId = localStorage.getItem("demoEmail") || "demo-user-001";

      const pass = storage.addVisitorPass({
        buildingId,
        residentId,
        visitorName: visitorName.trim(),
        validFrom: fromDateTime.toISOString(),
        validTo: toDateTime.toISOString(),
      });

      toast.success("სტუმრის ბარათი წარმატებით შეიქმნა!");
      onPassCreated(pass);
      onOpenChange(false);

      // Reset form
      setVisitorName("");
      setValidFrom(new Date());
      setValidTo(new Date(Date.now() + 24 * 60 * 60 * 1000));
      setFromTime("10:00");
      setToTime("18:00");
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
          <DialogTitle>სტუმრის ბარათის შექმნა</DialogTitle>
          <DialogDescription>
            შექმენით ერთჯერადი წვდომის ბარათი სტუმრისთვის
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="visitorName">სტუმრის სახელი და გვარი *</Label>
            <Input
              id="visitorName"
              placeholder="მაგ: გიორგი გელაშვილი"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>მოქმედების დაწყება *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !validFrom && "text-muted-foreground",
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {validFrom
                      ? format(validFrom, "dd MMM", { locale: ka })
                      : "აირჩიეთ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={validFrom}
                    onSelect={setValidFrom}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>მოქმედების დასრულება *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !validTo && "text-muted-foreground",
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {validTo
                      ? format(validTo, "dd MMM", { locale: ka })
                      : "აირჩიეთ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={validTo}
                    onSelect={setValidTo}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                disabled={isLoading}
              />
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
