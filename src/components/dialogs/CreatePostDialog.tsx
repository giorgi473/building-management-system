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
import { storage, StoredPost } from "@/lib/storage";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated: (post: StoredPost) => void;
  buildingId?: string;
}

export function CreatePostDialog({
  open,
  onOpenChange,
  onPostCreated,
  buildingId = "b1",
}: CreatePostDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("გთხოვთ შეავსოთ ყველა ველი");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const userEmail = localStorage.getItem("demoEmail") || "demo@abos.ge";
      const userName = userEmail.split("@")[0];

      const post = storage.addPost({
        buildingId,
        userId: userEmail,
        userName: userName.charAt(0).toUpperCase() + userName.slice(1),
        title: title.trim(),
        content: content.trim(),
      });

      toast.success("პოსტი წარმატებით გამოქვეყნდა!");
      onPostCreated(post);
      onOpenChange(false);

      // Reset form
      setTitle("");
      setContent("");
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
          <DialogTitle>ახალი პოსტი</DialogTitle>
          <DialogDescription>
            გააზიარეთ სიახლე ან შეკითხვა თქვენს კომუნიტისთვის
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="postTitle">სათაური *</Label>
            <Input
              id="postTitle"
              placeholder="მაგ: საზოგადოებრივი შეხვედრა"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postContent">შინაარსი *</Label>
            <Textarea
              id="postContent"
              placeholder="დაწერეთ თქვენი პოსტი აქ..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
              rows={6}
            />
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
                "გამოქვეყნება"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
