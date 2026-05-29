const SSR_CAPTURE_KEY = "__LOVABLE_TANSTACK_CAPTURE_SSR_ERROR__";
const CAPTURE_TTL_MS = 5000;

let lastCapturedError: unknown;
let capturedAt = 0;

export function captureError(error: unknown) {
  lastCapturedError = error;
  capturedAt = Date.now();
}

export function consumeLastCapturedError(): unknown {
  if (lastCapturedError == null) return undefined;
  if (Date.now() - capturedAt > CAPTURE_TTL_MS) {
    lastCapturedError = undefined;
    return undefined;
  }
  const error = lastCapturedError;
  lastCapturedError = undefined;
  return error;
}

if (typeof globalThis !== "undefined") {
  (globalThis as Record<string, unknown>)[SSR_CAPTURE_KEY] = captureError;
}

if (typeof process !== "undefined") {
  process.on("unhandledRejection", captureError);
}
