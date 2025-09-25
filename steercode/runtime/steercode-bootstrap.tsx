import React from "react";

// 1) Grab the router's context module BEFORE qualified-entry uses it.
const ctxMod: any = require("expo-router/_ctx");
const origCtx: any = ctxMod.ctx;

// Don't double-patch during Fast Refresh
if (!(globalThis as any).__STEERCODE_CTX_PATCHED__) {
  const WRAPPED_CACHE = new Map<string, any>();

  // Build a stable wrapper that survives HMR:
  // - The wrapper component identity stays the same (so Fast Refresh is happy)
  // - We swap the *inner* component whenever the original _layout changes.
  function getOrCreateWrapper(key: string) {
    let entry = WRAPPED_CACHE.get(key);
    if (!entry) {
      let Current: React.ComponentType<any> | null = null;

      const ErrorModalProvider = require("./error-modal/error-modal-provider").default;
      const ScreenshotCapture = require("./screenshot-capture/screenshot-capture").ScreenshotCapture;

      const Wrapper = (props: any) => {
        const Comp = Current!;
        return (
          <ErrorModalProvider>
            <ScreenshotCapture />
            {Comp ? <Comp {...props} /> : null}
          </ErrorModalProvider>
        );
      };
      Object.defineProperty(Wrapper, "name", { value: "SteerCodeRootLayoutWrapper" });

      entry = {
        Wrapper,
        set: (next: React.ComponentType<any>) => {
          Current = next;
        },
      };
      WRAPPED_CACHE.set(key, entry);
    }
    return entry;
  }

  // Only the *root* layout. Router context keys are relative to /app, e.g. "./_layout.tsx".
  const ROOT_LAYOUT_RE = /^\.\/_layout\.(tsx|ts|jsx|js)$/;

  function patchedCtx(request: string) {
    const mod = origCtx(request);

    if (ROOT_LAYOUT_RE.test(request)) {
      const origDefault = (mod && (mod.default || mod)) as React.ComponentType<any>;
      const { Wrapper, set } = getOrCreateWrapper(request);
      set(origDefault);

      // Return a module-like object with our wrapped default.
      // Preserve other exports so the router doesn't lose them.
      return { ...mod, default: Wrapper };
    }

    return mod;
  }

  // Preserve context API (keys, resolve, id)
  patchedCtx.keys = () => origCtx.keys();
  if (origCtx.resolve) patchedCtx.resolve = origCtx.resolve.bind(origCtx);
  if (origCtx.id) patchedCtx.id = origCtx.id;

  // 2) Swap the context used by Expo Router.
  try {
    ctxMod.ctx = patchedCtx;
  } catch {
    // In case the property is non-writable, force-define it.
    Object.defineProperty(ctxMod, "ctx", { value: patchedCtx });
  }

  (globalThis as any).__STEERCODE_CTX_PATCHED__ = true;
  // console.info("[steercode] ctx patched for root _layout");
}
