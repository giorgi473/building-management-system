import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StoredVisitorPass } from "@/lib/storage";
import { format } from "date-fns";
import { ka } from "date-fns/locale";
import { Copy, Download, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pass: StoredVisitorPass | null;
}

export function QRCodeDialog({ open, onOpenChange, pass }: QRCodeDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!pass) return null;

  const passCode = `PASS-${pass.id.toUpperCase().slice(0, 8)}`;

  // Generate a simple QR-like visual pattern (in a real app, use a QR library)
  const generatePattern = (code: string) => {
    const hash = code
      .split("")
      .reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
    const pattern = [];
    for (let i = 0; i < 64; i++) {
      pattern.push((hash * (i + 1)) % 2);
    }
    return pattern;
  };

  const pattern = generatePattern(passCode);

  const handleCopy = () => {
    navigator.clipboard.writeText(passCode);
    setCopied(true);
    toast.success("კოდი დაკოპირდა!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>სტუმრის ბარათი</DialogTitle>
          <DialogDescription>
            აჩვენეთ ეს QR კოდი დაცვის თანამშრომელს
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          {/* QR Code Visualization */}
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <div className="grid grid-cols-8 gap-1 w-48 h-48 p-2 border-4 border-primary/20 rounded-lg">
              {pattern.map((cell, i) => (
                <div
                  key={i}
                  className={`rounded-sm transition-colors ${
                    cell ? "bg-foreground" : "bg-muted/30"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Pass Code */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">კოდი:</p>
            <div className="flex items-center gap-2">
              <code className="text-xl font-mono font-bold bg-muted px-4 py-2 rounded-lg">
                {passCode}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Pass Details */}
          <div className="w-full bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">სტუმარი:</span>
              <span className="font-medium">{pass.visitorName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">მოქმედების დაწყება:</span>
              <span className="font-medium">
                {format(new Date(pass.validFrom), "d MMM, HH:mm", {
                  locale: ka,
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                მოქმედების დასრულება:
              </span>
              <span className="font-medium">
                {format(new Date(pass.validTo), "d MMM, HH:mm", { locale: ka })}
              </span>
            </div>
          </div>

          {/* Download Button */}
          <Button variant="outline" className="w-full gap-2">
            <Download className="h-4 w-4" />
            ჩამოტვირთვა
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
