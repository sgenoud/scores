import { useCallback, useEffect, useRef, useState } from "react";

type WakeLockSentinel = EventTarget & {
  released: boolean;
  release: () => Promise<void>;
  type: "screen";
};

type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinel>;
  };
};

const getWakeLock = () => (navigator as WakeLockNavigator).wakeLock;

export const isWakeLockSupported = () =>
  typeof navigator !== "undefined" && Boolean(getWakeLock());

export const useWakeLock = (enabled: boolean) => {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const [isSupported] = useState(
    () => typeof navigator !== "undefined" && Boolean(getWakeLock()),
  );
  const [isActive, setIsActive] = useState(false);

  const releaseWakeLock = useCallback(async () => {
    const sentinel = sentinelRef.current;
    sentinelRef.current = null;
    setIsActive(false);

    if (sentinel && !sentinel.released) {
      await sentinel.release().catch(() => undefined);
    }
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!enabled || !isSupported || document.visibilityState !== "visible")
      return;
    if (sentinelRef.current && !sentinelRef.current.released) return;

    try {
      const sentinel = await getWakeLock()?.request("screen");
      if (!sentinel) return;

      sentinelRef.current = sentinel;
      setIsActive(true);
      sentinel.addEventListener("release", () => {
        if (sentinelRef.current === sentinel) {
          sentinelRef.current = null;
          setIsActive(false);
        }
      });
    } catch {
      setIsActive(false);
    }
  }, [enabled, isSupported]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (enabled) {
        void requestWakeLock();
      } else {
        void releaseWakeLock();
      }
    }, 0);

    return () => {
      window.clearTimeout(timer);
      void releaseWakeLock();
    };
  }, [enabled, releaseWakeLock, requestWakeLock]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void requestWakeLock();
      } else {
        void releaseWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [releaseWakeLock, requestWakeLock]);

  return { isSupported, isActive };
};
