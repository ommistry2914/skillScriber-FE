import * as React from "react";

import { VersionSwitcher } from "@/components/version-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "./NavUser";
import { Link } from "react-router-dom";
import { routes } from "@/data/sidebarData";
import logo from "../assets/images/akinoLogo.svg";
import { Separator } from "./ui/separator";

export function AppSidebar({ ...props }) {
  return (
    <Sidebar {...props} className="">
      <div className="h-full bg-white text-black flex flex-col">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link to="/" className="flex justify-center">
                  <img src={logo} alt="logo" className="size-38" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <Separator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu className="gap-2">
              {routes.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    className="text-md  px-4 rounded-md"
                  >
                    <Link
                      to={item.url}
                      className={`font-medium transition-colors ${
                        location.pathname === item.url
                          ? "bg-gray-300 text-black"
                          : "text-black hover:text-gray"
                      }`}
                    >
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
        <SidebarRail />
      </div>
    </Sidebar>
  );
}
