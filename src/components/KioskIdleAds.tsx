"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  enabled: boolean;
  idleSeconds: number;
  slideSeconds: number;
  slides: { id: string; imageUrl: string }[];
  children: React.ReactNode;
};

export function KioskIdleAds({
  enabled,
  idleSeconds,
  slideSeconds,
  slides,
  children,
}: Props) {
  const [showingAds, setShowingAds] = useState(false);
  const [index, setIndex] = useState(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canShow = enabled && slides.length > 0;

  const clearIdle = useCallback(() => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
  }, []);

  const resetIdle = useCallback(() => {
    clearIdle();
    if (!canShow) return;
    idleTimer.current = setTimeout(() => {
      setShowingAds(true);
      setIndex(0);
    }, idleSeconds * 1000);
  }, [canShow, clearIdle, idleSeconds]);

  const dismissAds = useCallback(() => {
    setShowingAds(false);
    resetIdle();
  }, [resetIdle]);

  useEffect(() => {
    if (!canShow) {
      setShowingAds(false);
      clearIdle();
      return;
    }
    resetIdle();
    return clearIdle;
  }, [canShow, clearIdle, resetIdle]);

  useEffect(() => {
    if (!showingAds || slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, slideSeconds * 1000);
    return () => clearInterval(timer);
  }, [showingAds, slideSeconds, slides.length]);

  useEffect(() => {
    if (!canShow) return;
    const onInteract = () => {
      if (showingAds) return;
      resetIdle();
    };
    const events: (keyof WindowEventMap)[] = [
      "pointerdown",
      "touchstart",
      "mousemove",
      "keydown",
      "scroll",
    ];
    events.forEach((event) => window.addEventListener(event, onInteract, { passive: true }));
    return () => {
      events.forEach((event) => window.removeEventListener(event, onInteract));
    };
  }, [canShow, resetIdle, showingAds]);

  return (
    <>
      {children}
      {showingAds ? (
        <button
          type="button"
          aria-label="Chạm để xem danh sách"
          onClick={dismissAds}
          onTouchStart={dismissAds}
          className="fixed inset-0 z-50 cursor-pointer bg-black"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slides[index]?.imageUrl}
            alt=""
            className="h-full w-full object-contain"
          />
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-4 py-2 text-sm text-white">
            Chạm để quay lại
          </span>
          {slides.length > 1 ? (
            <span className="absolute top-6 right-6 rounded-full bg-black/55 px-3 py-1 text-xs text-white">
              {index + 1}/{slides.length}
            </span>
          ) : null}
        </button>
      ) : null}
    </>
  );
}
