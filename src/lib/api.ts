const BASE_URL = "https://techgazzeta.com";

// Demo mode - set to true to bypass API and use mock data
const DEMO_MODE = true;

interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

// Mock user for demo mode
const DEMO_USER = {
  id: "demo-user-001",
  email: "demo@abos.ge",
  role: "building_admin",
  createdAt: new Date().toISOString(),
};

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.loadTokens();
  }

  private loadTokens() {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("accessToken");
      this.refreshToken = localStorage.getItem("refreshToken");
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  getAccessToken() {
    return this.accessToken;
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Try to refresh token if unauthorized
        if (response.status === 401 && this.refreshToken) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            return this.request<T>(endpoint, options);
          }
        }
        return {
          error: data.error || {
            message: "Request failed",
            code: "UNKNOWN",
            statusCode: response.status,
          },
        };
      }

      return { data };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : "Network error",
          code: "NETWORK_ERROR",
          statusCode: 0,
        },
      };
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${BASE_URL}/iam/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.accessToken;
        localStorage.setItem("accessToken", data.accessToken);
        return true;
      }
    } catch {
      // Ignore refresh errors
    }

    this.clearTokens();
    return false;
  }

  // Auth endpoints
  async register(email: string, password: string, role: string = "resident") {
    if (DEMO_MODE) {
      const demoUser = { ...DEMO_USER, email, role };
      localStorage.setItem("demoEmail", email);
      localStorage.setItem("demoRole", role);
      this.setTokens("demo-access-token", "demo-refresh-token");
      return {
        data: {
          user: demoUser,
          accessToken: "demo-access-token",
          refreshToken: "demo-refresh-token",
        },
      };
    }

    const result = await this.request<{
      user: { id: string; email: string; role: string; createdAt: string };
      accessToken: string;
      refreshToken: string;
    }>("/iam/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    });

    if (result.data) {
      this.setTokens(result.data.accessToken, result.data.refreshToken);
    }

    return result;
  }

  async login(email: string, password: string) {
    if (DEMO_MODE) {
      localStorage.setItem("demoEmail", email);
      this.setTokens("demo-access-token", "demo-refresh-token");
      return {
        data: {
          accessToken: "demo-access-token",
          refreshToken: "demo-refresh-token",
        },
      };
    }

    const result = await this.request<{
      accessToken: string;
      refreshToken: string;
    }>("/iam/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (result.data) {
      this.setTokens(result.data.accessToken, result.data.refreshToken);
    }

    return result;
  }

  async logout() {
    if (this.refreshToken) {
      await this.request("/iam/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
    }
    this.clearTokens();
  }

  async getMe() {
    if (DEMO_MODE && this.accessToken) {
      const storedEmail = localStorage.getItem("demoEmail") || "demo@abos.ge";
      const storedRole = localStorage.getItem("demoRole") || "building_admin";
      return { data: { ...DEMO_USER, email: storedEmail, role: storedRole } };
    }

    return this.request<{
      id: string;
      email: string;
      role: string;
      createdAt: string;
    }>("/iam/me");
  }

  // Buildings endpoints
  async getBuildings() {
    if (DEMO_MODE) {
      return {
        data: {
          buildings: [
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
          ],
        },
      };
    }

    return this.request<{
      buildings: Array<{
        id: string;
        name: string;
        address: string;
        createdAt: string;
      }>;
    }>("/buildings/");
  }

  async getBuilding(buildingId: string) {
    return this.request<{
      id: string;
      name: string;
      address: string;
      createdAt: string;
    }>(`/buildings/${buildingId}`);
  }

  async createBuilding(name: string, address: string) {
    return this.request<{
      id: string;
      name: string;
      address: string;
      createdAt: string;
    }>("/buildings/", {
      method: "POST",
      body: JSON.stringify({ name, address }),
    });
  }

  async getUnits(buildingId: string) {
    return this.request<{
      units: Array<{
        id: string;
        buildingId: string;
        unitNumber: string;
        floor: number;
        createdAt: string;
      }>;
    }>(`/buildings/${buildingId}/units`);
  }

  async getMyMembership(buildingId: string) {
    return this.request<{
      id: string;
      buildingId: string;
      unitId: string;
      userId: string;
      status: string;
      roleInBuilding: string;
      createdAt: string;
      verifiedAt: string | null;
    }>(`/buildings/${buildingId}/me`);
  }

  async requestAccess(buildingId: string, unitId: string) {
    return this.request<{
      id: string;
      buildingId: string;
      unitId: string;
      userId: string;
      status: string;
      roleInBuilding: string;
      createdAt: string;
    }>(`/buildings/${buildingId}/request-access`, {
      method: "POST",
      body: JSON.stringify({ unitId }),
    });
  }

  // Tickets endpoints
  async getTickets(buildingId: string, status?: string) {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    const query = params.toString() ? `?${params.toString()}` : "";

    return this.request<{
      tickets: Array<{
        id: string;
        buildingId: string;
        unitId: string;
        createdByUserId: string;
        title: string;
        description: string;
        category: string;
        priority: string;
        status: string;
        assignedToUserId: string | null;
        createdAt: string;
        updatedAt: string;
      }>;
      pagination: { limit: number; offset: number; total: number };
    }>(`/tickets/buildings/${buildingId}/tickets${query}`);
  }

  async createTicket(
    buildingId: string,
    title: string,
    description: string,
    category: string,
    priority: string,
  ) {
    return this.request<{
      id: string;
      buildingId: string;
      title: string;
      description: string;
      category: string;
      priority: string;
      status: string;
      createdAt: string;
    }>(`/tickets/buildings/${buildingId}/tickets`, {
      method: "POST",
      body: JSON.stringify({ title, description, category, priority }),
    });
  }

  // Community endpoints
  async getPosts(buildingId: string) {
    return this.request<{
      data: Array<{
        id: string;
        buildingId: string;
        userId: string;
        title: string;
        content: string;
        status: string;
        createdAt: string;
        updatedAt: string;
      }>;
    }>(`/community/buildings/${buildingId}/posts`);
  }

  async createPost(buildingId: string, title: string, content: string) {
    return this.request<{
      data: {
        id: string;
        buildingId: string;
        userId: string;
        title: string;
        content: string;
        status: string;
        createdAt: string;
      };
    }>(`/community/buildings/${buildingId}/posts`, {
      method: "POST",
      body: JSON.stringify({ title, content }),
    });
  }

  // Notifications endpoints
  async getNotifications() {
    if (DEMO_MODE) {
      return {
        data: {
          notifications: [
            {
              id: "n1",
              userId: "demo-user-001",
              type: "ticket_created",
              title: "ახალი ტიკეტი",
              body: "შეიქმნა ახალი მოთხოვნა",
              data: {},
              readAt: null,
              createdAt: new Date().toISOString(),
            },
            {
              id: "n2",
              userId: "demo-user-001",
              type: "community_post",
              title: "ახალი პოსტი",
              body: "ადმინისტრატორმა გამოაქვეყნა ახალი პოსტი",
              data: {},
              readAt: null,
              createdAt: new Date(Date.now() - 3600000).toISOString(),
            },
          ],
          pagination: { limit: 50, offset: 0, total: 2 },
        },
      };
    }

    return this.request<{
      notifications: Array<{
        id: string;
        userId: string;
        type: string;
        title: string;
        body: string;
        data: Record<string, unknown>;
        readAt: string | null;
        createdAt: string;
      }>;
      pagination: { limit: number; offset: number; total: number };
    }>("/notifications/");
  }

  async markNotificationRead(id: string) {
    return this.request<{
      id: string;
      readAt: string;
    }>(`/notifications/${id}/read`, {
      method: "PATCH",
    });
  }

  // Access endpoints
  async getVisitorPasses(buildingId: string) {
    return this.request<{
      visitorPasses: Array<{
        id: string;
        buildingId: string;
        residentId: string;
        visitorName: string;
        validFrom: string;
        validTo: string;
        status: string;
        createdAt: string;
      }>;
      pagination: { limit: number; offset: number; total: number };
    }>(`/access/buildings/${buildingId}/visitor-passes`);
  }

  async createVisitorPass(
    buildingId: string,
    visitorName: string,
    validFrom: string,
    validTo: string,
  ) {
    return this.request<{
      id: string;
      buildingId: string;
      visitorName: string;
      validFrom: string;
      validTo: string;
      status: string;
      createdAt: string;
    }>(`/access/buildings/${buildingId}/visitor-passes`, {
      method: "POST",
      body: JSON.stringify({ visitorName, validFrom, validTo }),
    });
  }

  async revokeVisitorPass(id: string) {
    return this.request<{
      id: string;
      status: string;
    }>(`/access/visitor-passes/${id}/revoke`, {
      method: "PATCH",
    });
  }
}

export const api = new ApiClient();
