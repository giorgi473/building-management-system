import { NavLink, useLocation } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  Ticket,
  Users,
  Bell,
  Shield,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Buildings", href: "/buildings", icon: Building2 },
  { name: "Tickets", href: "/tickets", icon: Ticket },
  { name: "Community", href: "/community", icon: MessageSquare },
  { name: "Visitors", href: "/visitors", icon: Users },
  { name: "Notifications", href: "/notifications", icon: Bell },
];

const adminNavigation = [
  { name: "Access Control", href: "/access", icon: Shield },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isAdmin =
    user?.role === "building_admin" ||
    user?.role === "super_admin" ||
    user?.role === "manager";

  const handleLogout = async () => {
    await logout();
  };

  const NavItem = ({ item }: { item: (typeof navigation)[0] }) => {
    const isActive = location.pathname.startsWith(item.href);

    return (
      <NavLink
        to={item.href}
        onClick={() => setIsMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        <span>{item.name}</span>
      </NavLink>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="h-10 w-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
          <Building2 className="h-6 w-6 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-display font-bold text-sidebar-accent-foreground">
            ABOS
          </h1>
          <p className="text-xs text-sidebar-foreground">Building Manager</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                Admin
              </p>
            </div>
            {adminNavigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-accent-foreground">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
              {user?.email}
            </p>
            <p className="text-xs text-sidebar-foreground capitalize">
              {user?.role?.replace("_", " ")}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
