/**
 * How many leading items stay visible; the rest go behind a "More" control.
 * Reserves `moreWidth` (and gaps) whenever not every item fits.
 */
export function fitVisibleCount(
  itemWidths: readonly number[],
  availableWidth: number,
  moreWidth: number,
  gap = 0,
): number {
  const n = itemWidths.length;
  if (n === 0) {
    return 0;
  }

  const gapsBetween = (count: number) => (count > 1 ? gap * (count - 1) : 0);
  const totalWithoutMore = itemWidths.reduce((sum, width) => sum + width, 0) + gapsBetween(n);
  if (totalWithoutMore <= availableWidth) {
    return n;
  }

  let used = 0;
  let visible = 0;
  for (let i = 0; i < n; i++) {
    const width = itemWidths[i] ?? 0;
    const nextUsed = used + width + (visible > 0 ? gap : 0);
    const withMore = nextUsed + (gap > 0 || nextUsed > 0 ? gap : 0) + moreWidth;
    if (withMore <= availableWidth) {
      used = nextUsed;
      visible += 1;
    } else {
      break;
    }
  }
  return visible;
}
