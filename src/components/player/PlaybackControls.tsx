import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import { useCaptionsOptions } from "@videojs/react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import type { SubtitleTrack } from "@/lib/configs";

const OFF_VALUE = "off";

export function PlaybackControls({
  subtitles,
  autoDisplaySubtitles,
  bulletCommentsEnabled,
  onBulletCommentsEnabledChange,
  hasBulletComments,
}: {
  subtitles: readonly SubtitleTrack[];
  autoDisplaySubtitles: boolean;
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
    if (!autoDisplaySubtitles || subtitles.length === 0) {
      captions.setValue(OFF_VALUE);
    }
  }, [autoDisplaySubtitles, captions, subtitles.length]);

  const subtitleOn = captions !== null && captions.value !== OFF_VALUE && captions.value !== "";
  const hasSubtitles = subtitles.length > 0;
  const captionOptions = captions?.options ?? [
    { value: OFF_VALUE, label: t("nowPlaying.subtitlesOff"), disabled: false },
  ];

  function handleSubtitleToggle(checked: boolean) {
    if (!captions) {
      return;
    }
    if (!checked) {
      captions.setValue(OFF_VALUE);
      return;
    }
    const firstTrackOption = captions.options.find((option) => option.value !== OFF_VALUE);
    if (firstTrackOption) {
      captions.setValue(firstTrackOption.value);
    }
  }

  function handleTrackChange(event: SelectChangeEvent) {
    captions?.setValue(event.target.value);
  }

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ alignItems: { sm: "center" } }}
    >
      <FormControlLabel
        control={
          <Switch
            checked={subtitleOn}
            onChange={(event) => handleSubtitleToggle(event.target.checked)}
            disabled={!hasSubtitles || !captions}
            slotProps={{ input: { "aria-label": t("nowPlaying.subtitlesToggle") } }}
          />
        }
        label={t("nowPlaying.subtitles")}
      />
      <FormControl size="small" sx={{ minWidth: 160 }} disabled={!hasSubtitles || !captions}>
        <InputLabel id="subtitle-track-label">{t("nowPlaying.subtitleTrack")}</InputLabel>
        <Select
          labelId="subtitle-track-label"
          id="subtitle-track"
          label={t("nowPlaying.subtitleTrack")}
          value={captions?.value ?? OFF_VALUE}
          onChange={handleTrackChange}
        >
          {captionOptions.map((option) => (
            <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.value === OFF_VALUE ? t("nowPlaying.subtitlesOff") : option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
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
