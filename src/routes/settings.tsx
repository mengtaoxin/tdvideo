import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ConfigsStatusBanner } from "@/components/ConfigsStatus";
import { clearAppCaches, DEFAULT_CONFIGS_URL } from "@/lib/configs";
import { useConfigsStore } from "@/stores/configsStore";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useTranslation();
  const settingsUrl = useConfigsStore((state) => state.settingsUrl);
  const effectiveUrl = useConfigsStore((state) => state.effectiveUrl);
  const status = useConfigsStore((state) => state.status);
  const saveConfigsUrl = useConfigsStore((state) => state.saveConfigsUrl);
  const resetConfigsUrl = useConfigsStore((state) => state.resetConfigsUrl);
  const reload = useConfigsStore((state) => state.reload);

  const [draftUrl, setDraftUrl] = useState(settingsUrl ?? DEFAULT_CONFIGS_URL);
  const [saving, setSaving] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  useEffect(() => {
    setDraftUrl(settingsUrl ?? DEFAULT_CONFIGS_URL);
  }, [settingsUrl]);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await saveConfigsUrl(draftUrl);
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setSaving(true);
    try {
      await resetConfigsUrl();
    } finally {
      setSaving(false);
    }
  }

  async function handleClearCache() {
    setClearConfirmOpen(false);
    setSaving(true);
    setCacheCleared(false);
    try {
      await clearAppCaches();
      await reload();
      setCacheCleared(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {t("settings.description")}
      </Typography>
      <ConfigsStatusBanner />
      {status === "ready" ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          {t("settings.loadedFrom", { url: effectiveUrl })}
        </Alert>
      ) : null}
      {cacheCleared ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t("settings.clearCacheDone")}
        </Alert>
      ) : null}
      <Box component="form" onSubmit={(event) => void handleSave(event)} noValidate>
        <TextField
          fullWidth
          margin="normal"
          id="configs-url"
          name="configsUrl"
          label={t("settings.configsUrlLabel")}
          value={draftUrl}
          onChange={(event) => setDraftUrl(event.target.value)}
          helperText={t("settings.configsUrlHelp", { defaultUrl: DEFAULT_CONFIGS_URL })}
          disabled={saving}
        />
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
          <Button type="submit" variant="contained" disabled={saving}>
            {t("settings.save")}
          </Button>
          <Button
            type="button"
            variant="outlined"
            disabled={saving}
            onClick={() => void handleReset()}
          >
            {t("settings.reset")}
          </Button>
          <Button type="button" variant="outlined" disabled={saving} onClick={() => void reload()}>
            {t("settings.reload")}
          </Button>
          <Button
            type="button"
            variant="outlined"
            color="warning"
            disabled={saving}
            onClick={() => setClearConfirmOpen(true)}
          >
            {t("settings.clearCache")}
          </Button>
        </Stack>
      </Box>

      <ConfirmDialog
        open={clearConfirmOpen}
        title={t("settings.clearCacheTitle")}
        description={t("settings.clearCacheDescription")}
        confirmLabel={t("settings.clearCacheAction")}
        cancelLabel={t("common.cancel")}
        confirmColor="warning"
        onConfirm={() => {
          void handleClearCache();
        }}
        onCancel={() => setClearConfirmOpen(false)}
      />
    </>
  );
}
