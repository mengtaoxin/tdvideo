import { useEffect, useRef } from "react";

import { useConfigsStore } from "@/stores/configsStore";

export function ConfigsBootstrap() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;
    void useConfigsStore.getState().initialize();
  }, []);

  return null;
}
