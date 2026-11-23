import { useEffect, useState } from "react";

import { fetchBulletComments, type BulletComment } from "@/lib/playback";

export interface UseBulletCommentsResult {
  bulletComments: BulletComment[];
  bulletCommentsEnabled: boolean;
  setBulletCommentsEnabled: (enabled: boolean) => void;
  bulletError: string | null;
}

/** Load bullet-comment track for a URL; abort and ignore stale results on change. */
export function useBulletComments(
  bulletTrackUrl: string | undefined,
  loadErrorFallback: string,
): UseBulletCommentsResult {
  const [bulletComments, setBulletComments] = useState<BulletComment[]>([]);
  const [bulletCommentsEnabled, setBulletCommentsEnabled] = useState(true);
  const [bulletError, setBulletError] = useState<string | null>(null);

  useEffect(() => {
    if (!bulletTrackUrl) {
      setBulletComments([]);
      setBulletError(null);
      setBulletCommentsEnabled(false);
      return undefined;
    }

    const controller = new AbortController();
    setBulletCommentsEnabled(true);
    setBulletError(null);

    void fetchBulletComments(bulletTrackUrl, controller.signal)
      .then((comments) => {
        if (!controller.signal.aborted) {
          setBulletComments(comments);
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        setBulletComments([]);
        setBulletError(error instanceof Error ? error.message : loadErrorFallback);
      });

    return () => {
      controller.abort();
    };
  }, [bulletTrackUrl, loadErrorFallback]);

  return {
    bulletComments,
    bulletCommentsEnabled,
    setBulletCommentsEnabled,
    bulletError,
  };
}
