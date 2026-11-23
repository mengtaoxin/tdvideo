import AboutIcon from "@mui/icons-material/InfoOutlined";
import FeedbackIcon from "@mui/icons-material/FeedbackOutlined";
import HomeIcon from "@mui/icons-material/HomeOutlined";
import LanguageIcon from "@mui/icons-material/Translate";
import MoreIcon from "@mui/icons-material/MoreHoriz";
import NowPlayingIcon from "@mui/icons-material/PlayCircleOutlined";
import PlaylistsIcon from "@mui/icons-material/PlaylistPlayOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import VideosIcon from "@mui/icons-material/VideoLibraryOutlined";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import { Link as RouterLink } from "@tanstack/react-router";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { FEEDBACK_URL, NAV_ITEMS } from "@/constants";
import { fitVisibleCount } from "@/lib/nav";

const NAV_GAP_PX = 4;

const ROUTE_ICONS: Record<(typeof NAV_ITEMS)[number]["to"], typeof HomeIcon> = {
  "/": HomeIcon,
  "/now-playing": NowPlayingIcon,
  "/videos": VideosIcon,
  "/playlists": PlaylistsIcon,
  "/settings": SettingsIcon,
  "/about": AboutIcon,
};

type NavChromeItem =
  | { id: string; kind: "route"; to: (typeof NAV_ITEMS)[number]["to"]; labelKey: string }
  | { id: string; kind: "language"; labelKey: string }
  | { id: string; kind: "feedback"; labelKey: string };

const CHROME_ITEMS: NavChromeItem[] = [
  ...NAV_ITEMS.map((item) => ({
    id: item.to,
    kind: "route" as const,
    to: item.to,
    labelKey: item.labelKey,
  })),
  { id: "language", kind: "language", labelKey: "nav.language" },
  { id: "feedback", kind: "feedback", labelKey: "nav.feedback" },
];

function iconFor(item: NavChromeItem): ReactNode {
  const props = { fontSize: "small" as const };
  if (item.kind === "route") {
    const Icon = ROUTE_ICONS[item.to];
    return <Icon {...props} />;
  }
  if (item.kind === "language") {
    return <LanguageIcon {...props} />;
  }
  return <FeedbackIcon {...props} />;
}

export function AppShellNav() {
  const { t, i18n } = useTranslation();
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const moreMeasureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(CHROME_ITEMS.length);
  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) {
      return undefined;
    }

    function measure() {
      const available = rowRef.current?.clientWidth ?? 0;
      // jsdom / pre-layout: keep everything visible until we have a real width
      if (available <= 0) {
        setVisibleCount(CHROME_ITEMS.length);
        return;
      }
      const widths = CHROME_ITEMS.map((_, index) => measureRefs.current[index]?.offsetWidth ?? 0);
      const moreWidth = moreMeasureRef.current?.offsetWidth ?? 0;
      setVisibleCount(fitVisibleCount(widths, available, moreWidth, NAV_GAP_PX));
    }

    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => {
        window.removeEventListener("resize", measure);
      };
    }
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => {
      observer.disconnect();
    };
  }, []);

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
      <Toolbar sx={{ gap: 1, justifyContent: "flex-start" }}>
        <Box
          ref={rowRef}
          sx={{
            display: "flex",
            alignItems: "center",
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
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          {overflowItems.map((item) => renderOverflowItem(item))}
        </Menu>

        <Menu
          anchorEl={langAnchor}
          open={Boolean(langAnchor)}
          onClose={closeLanguage}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <MenuItem selected={language === "en"} onClick={() => selectLanguage("en")}>
            {t("language.en")}
          </MenuItem>
          <MenuItem selected={language === "zh"} onClick={() => selectLanguage("zh")}>
            {t("language.zh")}
          </MenuItem>
        </Menu>

        <Dialog
          open={feedbackOpen}
          onClose={closeFeedbackConfirm}
          transitionDuration={0}
          aria-labelledby="feedback-confirm-title"
          aria-describedby="feedback-confirm-description"
        >
          <DialogTitle id="feedback-confirm-title">{t("feedback.confirmTitle")}</DialogTitle>
          <DialogContent>
            <DialogContentText id="feedback-confirm-description">
              {t("feedback.confirmBody")}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeFeedbackConfirm}>{t("feedback.cancel")}</Button>
            <Button onClick={confirmFeedback} autoFocus>
              {t("feedback.continue")}
            </Button>
          </DialogActions>
        </Dialog>
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
