/** Resync sidecar audio when drift from video exceeds this many seconds. */
export const AUDIO_DRIFT_THRESHOLD_SECONDS = 0.35;

export function shouldResyncExternalAudio(
  audioTime: number,
  videoTime: number,
  thresholdSeconds: number = AUDIO_DRIFT_THRESHOLD_SECONDS,
): boolean {
  return Math.abs(audioTime - videoTime) > thresholdSeconds;
}
