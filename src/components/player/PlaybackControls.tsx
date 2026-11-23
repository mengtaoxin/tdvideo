import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";
import Tooltip from "@mui/material/Tooltip";
import { useCaptionsOptions } from "@videojs/react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const OFF_VALUE = "off";

/** Staggered comment streaks — reads as scrolling overlay / 弹幕 without text. */
function BulletCommentsIcon({ off, ...props }: SvgIconProps & { off?: boolean }) {
  return (
    <SvgIcon viewBox="0 0 24 24" fontSize="small" {...props}>
      <path d="M2 6.75h11a1 1 0 0 1 0 2H2a1 1 0 1 1 0-2Zm3.5 4.5h14a1 1 0 0 1 0 2h-14a1 1 0 0 1 0-2ZM4 15.75h12a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2Z" />
      {off ? <path d="M4.22 3.81 20.19 19.78l-1.41 1.41L2.81 5.22z" /> : null}
    </SvgIcon>
  );
}

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

  const label = t("nowPlaying.bulletComments");
  const toggleLabel = t("nowPlaying.bulletCommentsToggle");

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
      <Tooltip title={label}>
        <span>
          <IconButton
            aria-label={toggleLabel}
            aria-pressed={bulletCommentsEnabled}
            color={bulletCommentsEnabled ? "primary" : "default"}
            disabled={!hasBulletComments}
            onClick={() => onBulletCommentsEnabledChange(!bulletCommentsEnabled)}
            size="small"
          >
            <BulletCommentsIcon off={!bulletCommentsEnabled} />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
