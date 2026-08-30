import { useCallback, useEffect, useRef, useState } from "react";

const COPY_FEEDBACK_MS = 1_000;

export function useCopyFeedback(text: string): {
  readonly copied: boolean;
  readonly copy: (owner: HTMLElement) => void;
} {
  const [copied, setCopied] = useState(false);
  const pendingRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);
  const epochRef = useRef(0);

  useEffect(() => {
    epochRef.current += 1;
    pendingRef.current = false;
    setCopied(false);
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    return () => {
      epochRef.current += 1;
      pendingRef.current = false;
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
    };
  }, [text]);

  const copy = useCallback(
    (owner: HTMLElement) => {
      if (!text || copied || pendingRef.current) return;
      const epoch = epochRef.current;
      pendingRef.current = true;
      void writeClipboard(text, owner).then((accepted) => {
        if (epoch !== epochRef.current) return;
        pendingRef.current = false;
        if (!accepted) return;
        setCopied(true);
        timerRef.current = window.setTimeout(() => {
          timerRef.current = undefined;
          setCopied(false);
        }, COPY_FEEDBACK_MS);
      });
    },
    [copied, text],
  );

  return { copied, copy };
}

async function writeClipboard(
  text: string,
  owner: HTMLElement,
): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
  const execute =
    typeof document.execCommand === "function"
      ? document.execCommand.bind(document)
      : undefined;
  if (!execute) return false;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  const container =
    owner.closest(".pretty-aui") ??
    owner.parentElement ??
    document.documentElement;
  container.appendChild(textarea);
  textarea.select();
  try {
    return execute("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}
