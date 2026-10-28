"use client";

import { PointerEvent as ReactPointerEvent, useEffect, useRef } from "react";

const HIDE_AFTER_MS = 1200;
const MIN_THUMB = 40;
const INSET = 2;
// How close to the right edge the pointer has to be to reveal the bar
const EDGE_PX = 16;
const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
]);

const scroller = () =>
  (document.scrollingElement as HTMLElement | null) ??
  document.documentElement;

const metrics = () => {
  const el = scroller();
  const viewport = el.clientHeight || window.innerHeight;
  const content = el.scrollHeight;
  const track = viewport - INSET * 2;
  const thumb = Math.max(MIN_THUMB, (viewport / content) * track);
  return { track, thumb, maxScroll: content - viewport, top: el.scrollTop };
};

// Page scrollbar drawn over the content, so it takes no width, and fades out
// when the page is idle. The native one is hidden in globals.css for mouse
// users; touch devices keep their own overlay scrollbar.
//
// Visibility and position are written straight to the DOM (data attributes
// and inline styles) from document-level listeners, so they don't depend on
// React re-rendering or on which element the browser fires scroll events at.
const OverlayScrollbar = () => {
  const barRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; startScroll: number } | null>(null);
  const reveal = useRef<() => void>(() => {});

  useEffect(() => {
    const bar = barRef.current;
    const thumb = thumbRef.current;
    if (!bar || !thumb) return;

    let frame = 0;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let nearEdge = false;

    const position = () => {
      const { track, thumb: size, maxScroll, top } = metrics();
      const scrollable = maxScroll > 1;
      bar.dataset.scrollable = String(scrollable);
      if (!scrollable) return;
      const progress = Math.min(1, Math.max(0, top / maxScroll));
      thumb.style.height = `${size}px`;
      thumb.style.transform = `translateY(${INSET + progress * (track - size)}px)`;
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(position);
    };

    const hideLater = () => {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        if (nearEdge || drag.current) return hideLater();
        bar.dataset.visible = "false";
      }, HIDE_AFTER_MS);
    };

    const show = () => {
      schedule();
      bar.dataset.visible = "true";
      hideLater();
    };
    reveal.current = show;

    const onScroll = (e: Event) => {
      // Capture catches scrolls from any element; only the page counts.
      const target = e.target;
      if (target !== document && target !== scroller()) return;
      show();
    };
    const onKey = (e: KeyboardEvent) => {
      if (SCROLL_KEYS.has(e.key)) show();
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const close = e.clientX >= window.innerWidth - EDGE_PX;
      if (close && !nearEdge) show();
      nearEdge = close;
    };
    const onPointerLeave = () => {
      nearEdge = false;
    };

    position();
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("wheel", show, { passive: true });
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", schedule);
    // Content height changes as lists load more posts.
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(hideTimer);
      reveal.current = () => {};
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("wheel", show);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, []);

  const onThumbDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, startScroll: scroller().scrollTop };
    barRef.current?.setAttribute("data-dragging", "true");
    reveal.current();
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
    barRef.current?.setAttribute("data-dragging", "false");
    reveal.current();
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

  return (
    <div
      ref={barRef}
      aria-hidden
      data-testid="overlay-scrollbar"
      data-visible="false"
      data-scrollable="false"
      data-dragging="false"
      className={
        "group fixed top-0 right-0 bottom-0 z-[60] w-3.5 hidden pointer-fine:block " +
        "data-[scrollable=false]:hidden! transition-opacity duration-300 " +
        "opacity-0 hover:opacity-100 data-[visible=true]:opacity-100 data-[dragging=true]:opacity-100"
      }
      onPointerDown={onTrackDown}
    >
      <div
        ref={thumbRef}
        className={
          "absolute right-0.5 top-0 rounded-full cursor-default " +
          "transition-[width,background-color] duration-150 " +
          "w-1.5 bg-foreground/35 " +
          "group-hover:w-2.5 group-hover:bg-brand " +
          "group-data-[dragging=true]:w-2.5 group-data-[dragging=true]:bg-brand"
        }
        onPointerDown={onThumbDown}
        onPointerMove={onThumbMove}
        onPointerUp={onThumbUp}
        onPointerCancel={onThumbUp}
      />
    </div>
  );
};

export default OverlayScrollbar;
