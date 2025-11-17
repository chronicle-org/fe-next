"use client";

import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

import type QuillType from "quill";

type Delta = ReturnType<QuillType["getContents"]>;
type Range = ReturnType<QuillType["getSelection"]>;

type EditorProps = {
  readOnly?: boolean;
  defaultValue?: Delta;
  onTextChange?: (
    delta: Delta,
    oldDelta: Delta,
    source: string
  ) => void;
  onSelectionChange?: (
    range: Range | null,
    oldRange: Range | null,
    source: string
  ) => void;
};

const Editor = forwardRef<QuillType | null, EditorProps>(
  ({ readOnly = false, defaultValue, onTextChange, onSelectionChange }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    // Keep latest callback refs
    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    }, [onTextChange, onSelectionChange]);

    useEffect(() => {
      if (typeof window === "undefined") return;

      let quill: QuillType | null = null;
      const container = containerRef.current; // 👈 snapshot the ref
      if (!container) return;

      const load = async () => {
        const Quill = (await import("quill")).default;

        const editorContainer = container.ownerDocument.createElement("div");
        container.appendChild(editorContainer);

        quill = new Quill(editorContainer, {
          theme: "snow",
          readOnly,
        });

        // Assign ref
        if (typeof ref === "function") ref(quill);
        else if (ref) (ref as React.MutableRefObject<QuillType | null>).current = quill;

        // Apply initial value
        if (defaultValueRef.current) {
          quill.setContents(defaultValueRef.current);
        }

        // Listen to text changes
        quill.on("text-change", (delta, oldDelta, source) => {
          onTextChangeRef.current?.(delta, oldDelta, source);
        });

        // Listen to selection changes
        quill.on("selection-change", (range, oldRange, source) => {
          onSelectionChangeRef.current?.(range, oldRange, source);
        });
      };

      load();

      // ✅ Cleanup using the *captured* container
      return () => {
        if (typeof ref === "function") ref(null);
        else if (ref) (ref as React.MutableRefObject<QuillType | null>).current = null;

        if (container) container.innerHTML = "";
        quill = null;
      };
    }, [ref, readOnly]);

    // Enable/disable readonly dynamically
    useEffect(() => {
      if (typeof window === "undefined") return;
      const instance = (ref as React.MutableRefObject<QuillType | null>).current;
      instance?.enable(!readOnly);
    }, [ref, readOnly]);

    return <div ref={containerRef} />;
  }
);

Editor.displayName = "Editor";

export default Editor;
