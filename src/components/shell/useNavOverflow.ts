import { useLayoutEffect, useRef, useState } from "react";

import { fitVisibleCount } from "@/lib/nav";

import { MAX_VISIBLE_NAV_ITEMS, NAV_GAP_PX } from "./navChrome";

export function useNavOverflow(itemCount: number) {
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const moreMeasureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(Math.min(itemCount, MAX_VISIBLE_NAV_ITEMS));

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) {
      return undefined;
    }

    function measure() {
      const available = rowRef.current?.clientWidth ?? 0;
      const widths = Array.from({ length: itemCount }, (_, index) => {
        return measureRefs.current[index]?.offsetWidth ?? 0;
      });
      const moreWidth = moreMeasureRef.current?.offsetWidth ?? 0;
      // jsdom / pre-layout: treat as unlimited width but still respect the visible cap
      const widthForFit = available > 0 ? available : Number.POSITIVE_INFINITY;
      setVisibleCount(
        fitVisibleCount(widths, widthForFit, moreWidth, NAV_GAP_PX, MAX_VISIBLE_NAV_ITEMS),
      );
    }

    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => {
        window.removeEventListener("resize", measure);
      };
    }
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => {
      observer.disconnect();
    };
  }, [itemCount]);

  return { rowRef, measureRefs, moreMeasureRef, visibleCount };
}
