import { createRootRoute, Outlet } from "@tanstack/react-router";

import { AppShellMain, AppShellNav } from "@/components/AppShell";
import { ConfigsBootstrap } from "@/components/ConfigsBootstrap";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <ConfigsBootstrap />
      <AppShellNav />
      <AppShellMain>
        <Outlet />
      </AppShellMain>
    </>
  );
}
