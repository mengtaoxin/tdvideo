import type { SvgIconComponent } from "@mui/icons-material";
import CloudOffOutlinedIcon from "@mui/icons-material/CloudOffOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import LockPersonOutlinedIcon from "@mui/icons-material/LockPersonOutlined";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { createFileRoute, Link as RouterLink } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ConfigJsonSample } from "@/components/ConfigJsonSample";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const FEATURES: { icon: SvgIconComponent; key: string }[] = [
  { icon: CloudOffOutlinedIcon, key: "noServer" },
  { icon: LockPersonOutlinedIcon, key: "yourData" },
  { icon: HistoryOutlinedIcon, key: "history" },
];

function HomePage() {
  const { t } = useTranslation();

  return (
    <Stack spacing={4} sx={{ pb: 2 }}>
      <Stack spacing={1.5}>
        <Typography variant="overline" component="p" color="primary" sx={{ fontWeight: 600, m: 0 }}>
          {t("home.eyebrow")}
        </Typography>
        <Typography
          component="h1"
          variant="h4"
          sx={{ fontWeight: 600, fontSize: { xs: "1.75rem", sm: "2.125rem" } }}
        >
          {t("home.title")}
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: "62ch" }}>
          {t("home.lead")}
        </Typography>
      </Stack>

      <ConfigJsonSample />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Button component={RouterLink} to="/videos" variant="contained" size="large">
          {t("home.goToVideos")}
        </Button>
        <Button component={RouterLink} to="/playlists" variant="outlined" size="large">
          {t("home.goToPlaylists")}
        </Button>
        <Button component={RouterLink} to="/settings" variant="outlined" size="large">
          {t("home.goToSettings")}
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {FEATURES.map(({ icon: Icon, key }) => (
          <Grid key={key} size={{ xs: 12, sm: 4 }}>
            <Stack spacing={1}>
              <Icon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 600 }}>
                {t(`home.features.${key}.title`)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t(`home.features.${key}.description`)}
              </Typography>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
