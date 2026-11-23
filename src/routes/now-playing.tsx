import { createFileRoute } from "@tanstack/react-router";

import { NowPlayingView } from "@/components/player/NowPlayingView";

export const Route = createFileRoute("/now-playing")({
  component: NowPlayingPage,
});

function NowPlayingPage() {
  return <NowPlayingView />;
}
