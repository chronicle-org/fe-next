"use client";

import { cn } from "@/lib/utils";
import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";

const HIDE_AFTER_MS = 1000;
const MIN_THUMB = 40;
const INSET = 2;

// Page scrollbar drawn over the content, so it takes no width, and fades out
// when the page is idle. The native one is hidden in globals.css for mouse
// users; touch devices keep their own overlay scrollbar.
const OverlayScrollbar = () => {
  const thumbRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const drag = useRef<{ startY: number; startScroll: number } | null>(null);
  const hovering = useRef(false);
  const [visible, setVisible] = useState(false);
  const [scrollable, setScrollable] = useState(false);
  const [dragging, setDragging] = useState(false);

  const metrics = () => {
    const root = document.documentElement;
    const viewport = window.innerHeight;
    const content = root.scrollHeight;
    const track = viewport - INSET * 2;
    const thumb = Math.max(MIN_THUMB, (viewport / content) * track);
    return { viewport, content, track, thumb, maxScroll: content - viewport };
  };

  const scheduleHide = () => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!hovering.current && !drag.current) setVisible(false);
    }, HIDE_AFTER_MS);
  };

  useEffect(() => {
    let frame = 0;

    const position = () => {
      const thumb = thumbRef.current;
      const { track, thumb: size, maxScroll } = metrics();
      setScrollable(maxScroll > 1);
      if (!thumb || maxScroll <= 1) return;
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      thumb.style.height = `${size}px`;
      thumb.style.transform = `translateY(${INSET + progress * (track - size)}px)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(position);
      setVisible(true);
      scheduleHide();
    };

    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(position);
    };

    position();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // Content height changes as lists load more posts.
    const observer = new ResizeObserver(onResize);
    observer.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(hideTimer.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, []);

  const onThumbDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, startScroll: window.scrollY };
    setDragging(true);
    setVisible(true);
  };

  const onThumbMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const { track, thumb, maxScroll } = metrics();
    const ratio = maxScroll / (track - thumb);
    window.scrollTo({
      top: drag.current.startScroll + (e.clientY - drag.current.startY) * ratio,
    });
  };

  const onThumbUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    drag.current = null;
    setDragging(false);
    scheduleHide();
  };

  // Clicking the track jumps so the thumb centers on the click.
  const onTrackDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const { track, thumb, maxScroll } = metrics();
    const progress = (e.clientY - INSET - thumb / 2) / (track - thumb);
    window.scrollTo({
      top: Math.min(1, Math.max(0, progress)) * maxScroll,
      behavior: "smooth",
    });
  };

  if (!scrollable) return null;

  return (
    <div
      aria-hidden
      data-testid="overlay-scrollbar"
      className={cn(
        "group fixed top-0 right-0 bottom-0 z-[60] w-3.5 hidden pointer-fine:block",
        "transition-opacity duration-300",
        visible || dragging ? "opacity-100" : "opacity-0 hover:opacity-100",
      )}
      onPointerEnter={() => {
        hovering.current = true;
        setVisible(true);
      }}
      onPointerLeave={() => {
        hovering.current = false;
        scheduleHide();
      }}
      onPointerDown={onTrackDown}
    >
      <div
        ref={thumbRef}
        className={cn(
          "absolute right-0.5 top-0 rounded-full cursor-default",
          "transition-[width,background-color] duration-150",
          "w-1.5 bg-ink/35 dark:bg-white/30",
          "group-hover:w-2.5 group-hover:bg-brand",
          dragging && "w-2.5 bg-brand dark:bg-brand",
        )}
        onPointerDown={onThumbDown}
        onPointerMove={onThumbMove}
        onPointerUp={onThumbUp}
        onPointerCancel={onThumbUp}
      />
    </div>
  );
};

export default OverlayScrollbar;
