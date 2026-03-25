import { Phone, BarChart3, Sliders, Users, ChevronLeft } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Reporte", url: "/", icon: BarChart3 },
  { title: "Simulador", url: "/simulator", icon: Sliders },
  { title: "Dimensionamiento", url: "/staffing", icon: Users },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-navy-deep">
      <SidebarContent className="bg-navy-deep">
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-border ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-lg bg-orange flex items-center justify-center shrink-0">
            <Phone className="w-[18px] h-[18px] text-accent-foreground" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-[13px] font-bold tracking-[1.5px] uppercase leading-tight text-foreground">
                CERCA <span className="text-orange">WFM</span>
              </div>
              <span className="text-[8px] font-semibold text-muted-foreground tracking-[1.5px] uppercase block">
                Workforce Intelligence
              </span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        end
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold tracking-[0.5px] uppercase transition-all duration-150 ${
                          isActive
                            ? 'bg-orange/15 text-orange'
                            : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]'
                        }`}
                        activeClassName=""
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-navy-deep border-t border-border">
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-2 px-3 py-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[1px] font-medium"
        >
          <ChevronLeft className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && "Colapsar"}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
