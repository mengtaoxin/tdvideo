import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { selectTime, usePlayer } from "@videojs/react";

import { commentsVisibleAt, type BulletComment } from "@/lib/playback";

const DISPLAY_WINDOW_SECONDS = 4;

export function BulletCommentOverlay({
  comments,
  enabled,
}: {
  comments: readonly BulletComment[];
  enabled: boolean;
}) {
  const time = usePlayer(selectTime);
  const currentTime = typeof time?.currentTime === "number" ? time.currentTime : 0;
  const visible = enabled ? commentsVisibleAt(comments, currentTime, DISPLAY_WINDOW_SECONDS) : [];

  if (!enabled || visible.length === 0) {
    return null;
  }

  return (
    <Box
      aria-live="polite"
      sx={{
        pointerEvents: "none",
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: 2,
      }}
    >
      {visible.map((comment) => (
        <Typography
          key={`${comment.time}-${comment.text}`}
          component="div"
          variant="body2"
          sx={{
            position: "absolute",
            top: `${12 + ((comment.time * 17) % 60)}%`,
            right: 0,
            px: 1.5,
            py: 0.5,
            mx: 1,
            maxWidth: "80%",
            borderRadius: 1,
            bgcolor: "rgba(0, 0, 0, 0.55)",
            color: "common.white",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            animation: "tdvideo-bullet-scroll 6s linear forwards",
          }}
        >
          {comment.text}
        </Typography>
      ))}
    </Box>
  );
}
