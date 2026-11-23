import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

import { useConfigsStore } from "@/stores/configsStore";

export function ConfigsStatusBanner() {
  const { t } = useTranslation();
  const status = useConfigsStore((state) => state.status);
  const error = useConfigsStore((state) => state.error);
  const effectiveUrl = useConfigsStore((state) => state.effectiveUrl);

  if (status === "loading" || status === "idle") {
    return (
      <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: "center" }}>
        <CircularProgress size={20} aria-label={t("configs.loading")} />
        <Typography color="text.secondary">{t("configs.loading")}</Typography>
      </Stack>
    );
  }

  if (status === "error") {
    return (
      <Alert severity="error" sx={{ mb: 2 }} role="alert">
        <Typography component="span" sx={{ fontWeight: 600 }}>
          {t("configs.errorTitle")}
        </Typography>
        <Typography component="p" sx={{ mt: 0.5, mb: 0 }}>
          {error ?? t("configs.errorFallback")}
        </Typography>
        <Typography component="p" variant="body2" color="text.secondary" sx={{ mt: 1, mb: 0 }}>
          {t("configs.errorUrl", { url: effectiveUrl })}
        </Typography>
      </Alert>
    );
  }

  return null;
}
