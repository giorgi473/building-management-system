import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  Plus,
  Search,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Calendar,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { storage, StoredPost, StoredComment } from "@/lib/storage";
import { CreatePostDialog } from "@/components/dialogs/CreatePostDialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { ka } from "date-fns/locale";

export default function Community() {
  const [posts, setPosts] = useState<StoredPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set(),
  );
  const [comments, setComments] = useState<Record<string, StoredComment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  const currentUserId = localStorage.getItem("demoEmail") || "demo-user-001";
  const currentUserName = currentUserId.split("@")[0];

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    const storedPosts = storage.getPosts();
    setPosts(storedPosts);

    // Load comment counts
    const commentsMap: Record<string, StoredComment[]> = {};
    storedPosts.forEach((post) => {
      commentsMap[post.id] = storage.getComments(post.id);
    });
    setComments(commentsMap);
  };

  const handlePostCreated = (post: StoredPost) => {
    setPosts([post, ...posts]);
    setComments({ ...comments, [post.id]: [] });
  };

  const handleLike = (postId: string) => {
    const updated = storage.togglePostLike(postId, currentUserId);
    if (updated) {
      setPosts(posts.map((p) => (p.id === postId ? updated : p)));
    }
  };

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const handleAddComment = (postId: string) => {
    const content = newComment[postId]?.trim();
    if (!content) return;

    const comment = storage.addComment({
      postId,
      userId: currentUserId,
      userName:
        currentUserName.charAt(0).toUpperCase() + currentUserName.slice(1),
      content,
    });

    setComments({
      ...comments,
      [postId]: [...(comments[postId] || []), comment],
    });
    setNewComment({ ...newComment, [postId]: "" });
    toast.success("კომენტარი დაემატა!");
  };

  const handleShare = (post: StoredPost) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/community/post/${post.id}`,
    );
    toast.success("ლინკი დაკოპირდა!");
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (hours < 1) return "ახლახანს";
      if (hours < 24) return `${hours} სთ წინ`;
      if (days < 7) return `${days} დღის წინ`;
      return format(date, "d MMM", { locale: ka });
    } catch {
      return dateString;
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">კომუნიტი</h1>
          <p className="text-muted-foreground mt-1">
            დარჩით კავშირზე მეზობლებთან
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          ახალი პოსტი
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="მოძებნე პოსტი..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Posts */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post, index) => (
            <Card
              key={post.id}
              className="hover:shadow-card transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {post.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{post.userName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 ${post.likes.includes(currentUserId) ? "text-destructive" : ""}`}
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${post.likes.includes(currentUserId) ? "fill-current" : ""}`}
                      />
                      <span>{post.likes.length}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => toggleComments(post.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{(comments[post.id] || []).length}</span>
                      {expandedComments.has(post.id) ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(post)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Comments Section */}
                {expandedComments.has(post.id) && (
                  <div className="space-y-4 pt-4 border-t">
                    {/* Existing Comments */}
                    {(comments[post.id] || []).length > 0 && (
                      <div className="space-y-3">
                        {(comments[post.id] || []).map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-muted">
                                {comment.userName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-muted rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">
                                  {comment.userName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {currentUserName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Textarea
                          placeholder="დაწერეთ კომენტარი..."
                          value={newComment[post.id] || ""}
                          onChange={(e) =>
                            setNewComment({
                              ...newComment,
                              [post.id]: e.target.value,
                            })
                          }
                          className="min-h-[40px] resize-none"
                          rows={1}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                        />
                        <Button
                          size="icon"
                          onClick={() => handleAddComment(post.id)}
                          disabled={!newComment[post.id]?.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12">
          <CardContent className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-medium mb-1">პოსტები არ მოიძებნა</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "სცადეთ სხვა საძიებო ფრაზა"
                : "გააზიარეთ რაიმე თქვენს კომუნიტისთვის"}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              ახალი პოსტი
            </Button>
          </CardContent>
        </Card>
      )}

      <CreatePostDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}
