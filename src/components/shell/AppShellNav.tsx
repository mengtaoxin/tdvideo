import MoreIcon from "@mui/icons-material/MoreHoriz";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import { Link as RouterLink } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { FEEDBACK_URL } from "@/constants";

import { LanguageMenu } from "./LanguageMenu";
import { CHROME_ITEMS, NAV_GAP_PX, iconFor, type NavChromeItem } from "./navChrome";
import { useNavOverflow } from "./useNavOverflow";

export function AppShellNav() {
  const { t, i18n } = useTranslation();
  const { rowRef, measureRefs, moreMeasureRef, visibleCount } = useNavOverflow(CHROME_ITEMS.length);
  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const visibleItems = CHROME_ITEMS.slice(0, visibleCount);
  const overflowItems = CHROME_ITEMS.slice(visibleCount);
  const language = i18n.resolvedLanguage === "zh" ? "zh" : "en";

  function closeMore() {
    setMoreAnchor(null);
  }

  function closeLanguage() {
    setLangAnchor(null);
  }

  function selectLanguage(next: "en" | "zh") {
    void i18n.changeLanguage(next);
    closeLanguage();
    closeMore();
  }

  function openFeedbackConfirm() {
    closeMore();
    setFeedbackOpen(true);
  }

  function closeFeedbackConfirm() {
    setFeedbackOpen(false);
  }

  function confirmFeedback() {
    window.open(FEEDBACK_URL, "_blank", "noopener,noreferrer");
    closeFeedbackConfirm();
  }

  function renderNavButton(item: NavChromeItem) {
    const label = t(item.labelKey);
    const startIcon = iconFor(item);

    if (item.kind === "route") {
      return (
        <Button
          key={item.id}
          component={RouterLink}
          to={item.to}
          color="inherit"
          size="small"
          startIcon={startIcon}
        >
          {label}
        </Button>
      );
    }

    if (item.kind === "feedback") {
      return (
        <Button
          key={item.id}
          color="inherit"
          size="small"
          startIcon={startIcon}
          onClick={openFeedbackConfirm}
        >
          {label}
        </Button>
      );
    }

    return (
      <Button
        key={item.id}
        color="inherit"
        size="small"
        startIcon={startIcon}
        aria-haspopup="menu"
        aria-expanded={Boolean(langAnchor)}
        onClick={(event) => setLangAnchor(event.currentTarget)}
      >
        {label}
      </Button>
    );
  }

  function renderOverflowItem(item: NavChromeItem) {
    const label = t(item.labelKey);
    const icon = iconFor(item);

    if (item.kind === "route") {
      return (
        <MenuItem key={item.id} component={RouterLink} to={item.to} onClick={closeMore}>
          <ListItemIcon>{icon}</ListItemIcon>
          {label}
        </MenuItem>
      );
    }

    if (item.kind === "feedback") {
      return (
        <MenuItem key={item.id} onClick={openFeedbackConfirm}>
          <ListItemIcon>{icon}</ListItemIcon>
          {label}
        </MenuItem>
      );
    }

    return (
      <MenuItem
        key={item.id}
        onClick={(event) => {
          setLangAnchor(event.currentTarget);
        }}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        {label}
      </MenuItem>
    );
  }

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ gap: 1, justifyContent: "flex-end" }}>
        <Box
          ref={rowRef}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: `${NAV_GAP_PX}px`,
            minWidth: 0,
            flex: 1,
            overflow: "hidden",
          }}
        >
          {visibleItems.map((item) => renderNavButton(item))}
          {overflowItems.length > 0 ? (
            <Button
              color="inherit"
              size="small"
              startIcon={<MoreIcon fontSize="small" />}
              aria-haspopup="menu"
              aria-expanded={Boolean(moreAnchor)}
              onClick={(event) => setMoreAnchor(event.currentTarget)}
            >
              {t("nav.more")}
            </Button>
          ) : null}
        </Box>

        <Box
          aria-hidden
          sx={{
            position: "absolute",
            visibility: "hidden",
            height: 0,
            overflow: "hidden",
            pointerEvents: "none",
            display: "flex",
            gap: `${NAV_GAP_PX}px`,
            whiteSpace: "nowrap",
          }}
        >
          {CHROME_ITEMS.map((item, index) => (
            <Box
              key={item.id}
              ref={(node: HTMLDivElement | null) => {
                measureRefs.current[index] = node;
              }}
              sx={{ display: "inline-flex" }}
            >
              {renderNavButton(item)}
            </Box>
          ))}
          <Box ref={moreMeasureRef} sx={{ display: "inline-flex" }}>
            <Button color="inherit" size="small" startIcon={<MoreIcon fontSize="small" />}>
              {t("nav.more")}
            </Button>
          </Box>
        </Box>

        <Menu
          anchorEl={moreAnchor}
          open={Boolean(moreAnchor)}
          onClose={closeMore}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          {overflowItems.map((item) => renderOverflowItem(item))}
        </Menu>

        <LanguageMenu
          anchorEl={langAnchor}
          open={Boolean(langAnchor)}
          language={language}
          onClose={closeLanguage}
          onSelect={selectLanguage}
        />

        <ConfirmDialog
          open={feedbackOpen}
          title={t("feedback.confirmTitle")}
          description={t("feedback.confirmBody")}
          confirmLabel={t("feedback.continue")}
          cancelLabel={t("feedback.cancel")}
          onConfirm={confirmFeedback}
          onCancel={closeFeedbackConfirm}
        />
      </Toolbar>
    </AppBar>
  );
}
