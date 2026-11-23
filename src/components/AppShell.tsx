import Container from "@mui/material/Container";
import type { ReactNode } from "react";

export { AppShellNav } from "./shell/AppShellNav";

export function AppShellMain({ children }: { children: ReactNode }) {
  return (
    <Container component="main" sx={{ py: 3 }}>
      {children}
    </Container>
  );
}
