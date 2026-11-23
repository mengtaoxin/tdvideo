import { createTheme, ThemeProvider } from "@mui/material/styles";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShellMain } from "@/components/AppShell";

const theme = createTheme();

describe("AppShellMain", () => {
  it("does not cap main content width so gallery rows pack as many items as fit", () => {
    render(
      <ThemeProvider theme={theme}>
        <AppShellMain>
          <span>content</span>
        </AppShellMain>
      </ThemeProvider>,
    );

    const main = screen.getByRole("main");
    expect(main.className).not.toMatch(/MuiContainer-maxWidth/);
    expect(getComputedStyle(main).maxWidth).toBe("none");
  });
});
