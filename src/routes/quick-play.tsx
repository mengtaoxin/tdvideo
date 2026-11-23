import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ConfigsStatusBanner } from "@/components/ConfigsStatus";
import { getHistoryEntry } from "@/db/database";
import { planQuickPlay, type QuickPlayErrorCode } from "@/lib/playback";
import { useConfigsStore } from "@/stores/configsStore";
import { usePlaybackStore } from "@/stores/playbackStore";

type QuickPlaySearch = {
  type?: string;
  id?: string;
};

export const Route = createFileRoute("/quick-play")({
  validateSearch: (search: Record<string, unknown>): QuickPlaySearch => ({
    type: typeof search.type === "string" ? search.type : undefined,
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: QuickPlayPage,
});

function QuickPlayPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { type, id } = Route.useSearch();
  const status = useConfigsStore((state) => state.status);
  const catalog = useConfigsStore((state) => state.catalog);
  const openVideo = usePlaybackStore((state) => state.openVideo);
  const openPlaylist = usePlaybackStore((state) => state.openPlaylist);
  const [error, setError] = useState<QuickPlayErrorCode | null>(null);

  useEffect(() => {
    if (status !== "ready" || !catalog) {
      return undefined;
    }

    let cancelled = false;
    const hasSession = usePlaybackStore.getState().session !== null;
    const plan = planQuickPlay(type, id, catalog, hasSession);

    if (plan.action === "error") {
      setError(plan.code);
      return undefined;
    }

    setError(null);

    void (async () => {
      if (plan.action === "continue") {
        await navigate({ to: "/now-playing", replace: true });
        return;
      }

      if (plan.action === "open-video") {
        openVideo(plan.videoId);
        await navigate({ to: "/now-playing", replace: true });
        return;
      }

      const entry = await getHistoryEntry("list", plan.playlistId);
      if (cancelled) {
        return;
      }
      const index = entry?.type === "list" ? entry.index : 0;
      openPlaylist(plan.playlistId, index);
      await navigate({ to: "/now-playing", replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [status, catalog, type, id, navigate, openVideo, openPlaylist]);

  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        {t("quickPlay.title")}
      </Typography>
      <ConfigsStatusBanner />
      {error ? (
        <Alert severity="warning" role="alert">
          {t(`quickPlay.errors.${error}`)}
        </Alert>
      ) : null}
    </>
  );
}
