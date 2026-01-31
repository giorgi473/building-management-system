// Local storage keys
const STORAGE_KEYS = {
  TICKETS: "abos_tickets",
  VISITORS: "abos_visitors",
  POSTS: "abos_posts",
  COMMENTS: "abos_comments",
  BUILDINGS: "abos_buildings",
  NOTIFICATIONS: "abos_notifications",
} as const;

// Types
export interface StoredTicket {
  id: string;
  buildingId: string;
  unitId: string;
  createdByUserId: string;
  title: string;
  description: string;
  category: "maintenance" | "repair" | "complaint" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedToUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredVisitorPass {
  id: string;
  buildingId: string;
  residentId: string;
  visitorName: string;
  validFrom: string;
  validTo: string;
  status: "active" | "used" | "revoked" | "expired";
  createdAt: string;
}

export interface StoredPost {
  id: string;
  buildingId: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  status: "active" | "deleted";
  likes: string[]; // user IDs who liked
  createdAt: string;
  updatedAt: string;
}

export interface StoredComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface StoredBuilding {
  id: string;
  name: string;
  address: string;
  createdAt: string;
}

export interface StoredNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

// Helper functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getItem<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setItem<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Initialize with demo data if empty
function initializeData(): void {
  // Initialize buildings
  if (getItem<StoredBuilding>(STORAGE_KEYS.BUILDINGS).length === 0) {
    setItem(STORAGE_KEYS.BUILDINGS, [
      {
        id: "b1",
        name: "Sunset Apartments",
        address: "ვაჟა-ფშაველას გამზ. 71, თბილისი",
        createdAt: new Date().toISOString(),
      },
      {
        id: "b2",
        name: "Green Valley Residence",
        address: "რუსთაველის გამზ. 24, თბილისი",
        createdAt: new Date().toISOString(),
      },
      {
        id: "b3",
        name: "Sky Tower",
        address: "აბაშიძის ქ. 15, თბილისი",
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  // Initialize tickets
  if (getItem<StoredTicket>(STORAGE_KEYS.TICKETS).length === 0) {
    setItem(STORAGE_KEYS.TICKETS, [
      {
        id: "t1",
        buildingId: "b1",
        unitId: "u1",
        createdByUserId: "demo-user-001",
        title: "წყლის გაჟონვა აბაზანაში",
        description: "აბაზანის ნიჟარის ქვეშ მუდმივად წყალი ჟონავს",
        category: "repair",
        priority: "high",
        status: "open",
        assignedToUserId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "t2",
        buildingId: "b1",
        unitId: "u1",
        createdByUserId: "demo-user-001",
        title: "კონდიციონერის პრობლემა",
        description: "კონდიციონერი არ აცივებს კარგად",
        category: "maintenance",
        priority: "medium",
        status: "in_progress",
        assignedToUserId: "tech-001",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "t3",
        buildingId: "b1",
        unitId: "u1",
        createdByUserId: "demo-user-001",
        title: "ნათურის შეცვლა",
        description: "დერეფანში ნათურა დაიწვა",
        category: "maintenance",
        priority: "low",
        status: "resolved",
        assignedToUserId: "tech-001",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ]);
  }

  // Initialize visitor passes
  if (getItem<StoredVisitorPass>(STORAGE_KEYS.VISITORS).length === 0) {
    setItem(STORAGE_KEYS.VISITORS, [
      {
        id: "v1",
        buildingId: "b1",
        residentId: "demo-user-001",
        visitorName: "გიორგი გელაშვილი",
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 86400000).toISOString(),
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        id: "v2",
        buildingId: "b1",
        residentId: "demo-user-001",
        visitorName: "მარიამ ჯორბენაძე",
        validFrom: new Date(Date.now() - 86400000).toISOString(),
        validTo: new Date(Date.now() - 43200000).toISOString(),
        status: "used",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ]);
  }

  // Initialize posts
  if (getItem<StoredPost>(STORAGE_KEYS.POSTS).length === 0) {
    setItem(STORAGE_KEYS.POSTS, [
      {
        id: "p1",
        buildingId: "b1",
        userId: "admin-001",
        userName: "ადმინისტრატორი",
        title: "კეთილი იყოს თქვენი მობრძანება! 🎉",
        content:
          "გილოცავთ ჩვენს ახალ კომუნიტის პლატფორმაზე შემოერთებას! აქ თქვენ შეგიძლიათ გაეცნოთ სიახლეებს, დაუკავშირდეთ მეზობლებს და მიიღოთ მნიშვნელოვანი ინფორმაცია.",
        status: "active",
        likes: ["demo-user-001"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "p2",
        buildingId: "b1",
        userId: "demo-user-002",
        userName: "ნიკა მარტინენკო",
        title: "აუზის მოვლის განრიგი",
        content:
          "შეგახსენებთ, რომ აუზი დაიხურება მოვლის მიზნით შაბათს 8:00-დან 14:00 საათამდე. მადლობა გაგებისთვის!",
        status: "active",
        likes: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ]);
  }

  // Initialize comments
  if (getItem<StoredComment>(STORAGE_KEYS.COMMENTS).length === 0) {
    setItem(STORAGE_KEYS.COMMENTS, [
      {
        id: "c1",
        postId: "p1",
        userId: "demo-user-002",
        userName: "ნიკა მარტინენკო",
        content: "მშვენიერი პლატფორმაა! მადლობა!",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ]);
  }

  // Initialize notifications
  if (getItem<StoredNotification>(STORAGE_KEYS.NOTIFICATIONS).length === 0) {
    setItem(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: "n1",
        userId: "demo-user-001",
        type: "ticket_created",
        title: "ახალი ტიკეტი შეიქმნა",
        body: 'თქვენი მოთხოვნა "წყლის გაჟონვა აბაზანაში" წარმატებით დარეგისტრირდა',
        data: {},
        readAt: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "n2",
        userId: "demo-user-001",
        type: "community_post",
        title: "ახალი პოსტი კომუნიტიში",
        body: "ადმინისტრატორმა გამოაქვეყნა ახალი პოსტი",
        data: {},
        readAt: null,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ]);
  }
}

// Storage class
class LocalStorage {
  constructor() {
    initializeData();
  }

  // Buildings
  getBuildings(): StoredBuilding[] {
    return getItem<StoredBuilding>(STORAGE_KEYS.BUILDINGS);
  }

  addBuilding(
    building: Omit<StoredBuilding, "id" | "createdAt">,
  ): StoredBuilding {
    const buildings = this.getBuildings();
    const newBuilding: StoredBuilding = {
      ...building,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    buildings.push(newBuilding);
    setItem(STORAGE_KEYS.BUILDINGS, buildings);
    return newBuilding;
  }

  // Tickets
  getTickets(buildingId?: string): StoredTicket[] {
    const tickets = getItem<StoredTicket>(STORAGE_KEYS.TICKETS);
    if (buildingId) {
      return tickets.filter((t) => t.buildingId === buildingId);
    }
    return tickets;
  }

  addTicket(
    ticket: Omit<
      StoredTicket,
      "id" | "createdAt" | "updatedAt" | "status" | "assignedToUserId"
    >,
  ): StoredTicket {
    const tickets = this.getTickets();
    const newTicket: StoredTicket = {
      ...ticket,
      id: generateId(),
      status: "open",
      assignedToUserId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tickets.push(newTicket);
    setItem(STORAGE_KEYS.TICKETS, tickets);

    // Add notification
    this.addNotification({
      userId: ticket.createdByUserId,
      type: "ticket_created",
      title: "ტიკეტი შეიქმნა",
      body: `თქვენი მოთხოვნა "${ticket.title}" წარმატებით დარეგისტრირდა`,
      data: { ticketId: newTicket.id },
    });

    return newTicket;
  }

  updateTicketStatus(
    ticketId: string,
    status: StoredTicket["status"],
  ): StoredTicket | null {
    const tickets = this.getTickets();
    const index = tickets.findIndex((t) => t.id === ticketId);
    if (index === -1) return null;

    tickets[index] = {
      ...tickets[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.TICKETS, tickets);
    return tickets[index];
  }

  // Visitor Passes
  getVisitorPasses(buildingId?: string): StoredVisitorPass[] {
    const passes = getItem<StoredVisitorPass>(STORAGE_KEYS.VISITORS);
    // Update expired passes
    const now = new Date();
    const updatedPasses = passes.map((pass) => {
      if (pass.status === "active" && new Date(pass.validTo) < now) {
        return { ...pass, status: "expired" as const };
      }
      return pass;
    });
    setItem(STORAGE_KEYS.VISITORS, updatedPasses);

    if (buildingId) {
      return updatedPasses.filter((p) => p.buildingId === buildingId);
    }
    return updatedPasses;
  }

  addVisitorPass(
    pass: Omit<StoredVisitorPass, "id" | "createdAt" | "status">,
  ): StoredVisitorPass {
    const passes = this.getVisitorPasses();
    const newPass: StoredVisitorPass = {
      ...pass,
      id: generateId(),
      status: "active",
      createdAt: new Date().toISOString(),
    };
    passes.push(newPass);
    setItem(STORAGE_KEYS.VISITORS, passes);
    return newPass;
  }

  revokeVisitorPass(passId: string): StoredVisitorPass | null {
    const passes = this.getVisitorPasses();
    const index = passes.findIndex((p) => p.id === passId);
    if (index === -1) return null;

    passes[index] = { ...passes[index], status: "revoked" };
    setItem(STORAGE_KEYS.VISITORS, passes);
    return passes[index];
  }

  // Posts
  getPosts(buildingId?: string): StoredPost[] {
    const posts = getItem<StoredPost>(STORAGE_KEYS.POSTS);
    if (buildingId) {
      return posts.filter(
        (p) => p.buildingId === buildingId && p.status === "active",
      );
    }
    return posts.filter((p) => p.status === "active");
  }

  addPost(
    post: Omit<
      StoredPost,
      "id" | "createdAt" | "updatedAt" | "status" | "likes"
    >,
  ): StoredPost {
    const posts = getItem<StoredPost>(STORAGE_KEYS.POSTS);
    const newPost: StoredPost = {
      ...post,
      id: generateId(),
      status: "active",
      likes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    posts.unshift(newPost);
    setItem(STORAGE_KEYS.POSTS, posts);
    return newPost;
  }

  togglePostLike(postId: string, userId: string): StoredPost | null {
    const posts = getItem<StoredPost>(STORAGE_KEYS.POSTS);
    const index = posts.findIndex((p) => p.id === postId);
    if (index === -1) return null;

    const post = posts[index];
    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }
    post.updatedAt = new Date().toISOString();
    posts[index] = post;
    setItem(STORAGE_KEYS.POSTS, posts);
    return post;
  }

  // Comments
  getComments(postId: string): StoredComment[] {
    const comments = getItem<StoredComment>(STORAGE_KEYS.COMMENTS);
    return comments.filter((c) => c.postId === postId);
  }

  addComment(comment: Omit<StoredComment, "id" | "createdAt">): StoredComment {
    const comments = getItem<StoredComment>(STORAGE_KEYS.COMMENTS);
    const newComment: StoredComment = {
      ...comment,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    comments.push(newComment);
    setItem(STORAGE_KEYS.COMMENTS, comments);
    return newComment;
  }

  getCommentCount(postId: string): number {
    return this.getComments(postId).length;
  }

  // Notifications
  getNotifications(userId?: string): StoredNotification[] {
    const notifications = getItem<StoredNotification>(
      STORAGE_KEYS.NOTIFICATIONS,
    );
    if (userId) {
      return notifications.filter((n) => n.userId === userId);
    }
    return notifications;
  }

  addNotification(
    notification: Omit<StoredNotification, "id" | "createdAt" | "readAt">,
  ): StoredNotification {
    const notifications = this.getNotifications();
    const newNotification: StoredNotification = {
      ...notification,
      id: generateId(),
      readAt: null,
      createdAt: new Date().toISOString(),
    };
    notifications.unshift(newNotification);
    setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return newNotification;
  }

  markNotificationRead(notificationId: string): StoredNotification | null {
    const notifications = this.getNotifications();
    const index = notifications.findIndex((n) => n.id === notificationId);
    if (index === -1) return null;

    notifications[index] = {
      ...notifications[index],
      readAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return notifications[index];
  }

  markAllNotificationsRead(userId: string): void {
    const notifications = this.getNotifications();
    const updated = notifications.map((n) =>
      n.userId === userId && !n.readAt
        ? { ...n, readAt: new Date().toISOString() }
        : n,
    );
    setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
  }
}

export const storage = new LocalStorage();
