import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import Toolbar from "@mui/material/Toolbar";
import { Link as RouterLink } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { FEEDBACK_URL, NAV_ITEMS } from "@/constants";

export function AppShellNav() {
  const { t, i18n } = useTranslation();

  function handleLanguageChange(event: SelectChangeEvent) {
    void i18n.changeLanguage(event.target.value);
  }

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ gap: 1, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, flexGrow: 1 }}>
          {NAV_ITEMS.map((item) => (
            <Button key={item.to} component={RouterLink} to={item.to} color="inherit" size="small">
              {t(item.labelKey)}
            </Button>
          ))}
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="language-switcher-label">{t("nav.language")}</InputLabel>
          <Select
            labelId="language-switcher-label"
            id="language-switcher"
            value={i18n.resolvedLanguage === "zh" ? "zh" : "en"}
            label={t("nav.language")}
            onChange={handleLanguageChange}
          >
            <MenuItem value="en">{t("language.en")}</MenuItem>
            <MenuItem value="zh">{t("language.zh")}</MenuItem>
          </Select>
        </FormControl>
        <Button
          color="inherit"
          size="small"
          href={FEEDBACK_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("nav.feedback")}
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export function AppShellMain({ children }: { children: ReactNode }) {
  return (
    <Container component="main" sx={{ py: 3 }}>
      {children}
    </Container>
  );
}
