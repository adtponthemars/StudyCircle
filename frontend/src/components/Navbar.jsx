import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, LayoutDashboard, User, PlusCircle, ChevronRight, ChevronLeft, Tent, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Home", icon: Home, path: "/" },
  { name: "Upload", icon: Upload, path: "/upload" },
  { name: "Explore", icon: LayoutDashboard, path: "/explore" },
  { name: "Profile", icon: User, path: "/profile" },
  // { name: "Favourites", icon: PlusCircle, path: "/likes" },
];

export default function Navbar() {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "h-screen sticky top-0 flex flex-col border-r transition-all duration-300 backdrop-blur-xl",
          expanded ? "w-64" : "w-20"
        )}
        style={{
          background: "var(--sidebar)",
          color: "var(--sidebar-foreground)",
          borderColor: "var(--sidebar-border)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2">
          {expanded && (
            <div className="flex items-center gap-2 px-2">
              <Tent  size={28} style={{ color: "var(--primary)" }} />
              <span className="font-bold text-xl ">StudyCircle</span>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded((prev) => !prev)}
            className="hover:bg-sidebar-accent"
          >
            {expanded ? <ChevronLeft /> : <ChevronRight />}
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-2 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "shadow-sm"
                        : "hover:shadow-sm"
                    )}
                    style={{
                      background: isActive
                        ? "var(--sidebar-primary)"
                        : "transparent",
                      color: isActive
                        ? "var(--sidebar-primary-foreground)"
                        : "var(--sidebar-foreground)",
                    }}
                  >
                    <Icon
                      size={25}
                      style={{
                        color: isActive
                          ? "var(--sidebar-primary-foreground)"
                          : "var(--muted-foreground)",
                      }}
                    />
                    {expanded && <span>{item.name}</span>}
                  </Link>
                </TooltipTrigger>

                {!expanded && (
                  <TooltipContent side="right">
                    {item.name}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="mt-auto p-4 text-xs"
          style={{ color: "var(--muted-foreground)" }}
        >
          {expanded && "© 2026 StudyCircle"}
        </div>
      </aside>
    </TooltipProvider>
  );
}