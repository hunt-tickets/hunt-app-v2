export const ALLOWED_ORIGINS = [
  "https://steercode.com",
  "https://www.steercode.com",
  "http://localhost:3000",
] as const;

export type ParentMessage =
  | {
      type: "SCREENSHOT_CAPTURED";
      data: {
        dataUrl: string;
        width: number;
        height: number;
        timestamp: number;
      };
    }
  | { type: "FIX_ERROR_MESSAGE"; message: string }
  | { type: "SCREENSHOT_CAPTURE_ERROR"; error: string };

export type ParentToIframeMessage = { type: "CAPTURE_SCREENSHOT" };

export class Messenger {
  constructor(private readonly parent: Window = window.parent) {}

  /** send the same payload to every allowed origin */
  public post<T extends ParentMessage>(msg: T): void {
    ALLOWED_ORIGINS.forEach((origin) => {
      try {
        const message = {
          ...msg,
          source: "steercode-expo-patch",
          timestamp: new Date().toISOString(),
        } as const;
        this.parent.postMessage(message, origin);
      } catch (_err) {
        // silent-fail – happens for sandboxed iframes with different origins
      }
    });
  }
}

export const messenger = new Messenger();


