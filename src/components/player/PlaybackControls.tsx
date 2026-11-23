import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import { useCaptionsOptions } from "@videojs/react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const OFF_VALUE = "off";

export function PlaybackControls({
  autoDisplaySubtitles,
  hasSubtitles,
  bulletCommentsEnabled,
  onBulletCommentsEnabledChange,
  hasBulletComments,
}: {
  autoDisplaySubtitles: boolean;
  hasSubtitles: boolean;
  bulletCommentsEnabled: boolean;
  onBulletCommentsEnabledChange: (enabled: boolean) => void;
  hasBulletComments: boolean;
}) {
  const { t } = useTranslation();
  const captions = useCaptionsOptions();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!captions || initializedRef.current) {
      return;
    }
    initializedRef.current = true;
    if (!autoDisplaySubtitles || !hasSubtitles) {
      captions.setValue(OFF_VALUE);
    }
  }, [autoDisplaySubtitles, captions, hasSubtitles]);

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ alignItems: { sm: "center" } }}
    >
      <FormControlLabel
        control={
          <Switch
            checked={bulletCommentsEnabled}
            onChange={(event) => onBulletCommentsEnabledChange(event.target.checked)}
            disabled={!hasBulletComments}
            slotProps={{ input: { "aria-label": t("nowPlaying.bulletCommentsToggle") } }}
          />
        }
        label={t("nowPlaying.bulletComments")}
      />
    </Stack>
  );
}
