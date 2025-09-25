// @ts-nocheck

(function () {
    if (typeof window === "undefined" || typeof document === "undefined") {
        return;
    }

    const modernScreenshot = require("modern-screenshot");
    const React = require("react");
    const { useEffect } = React;
    const { messenger, ALLOWED_ORIGINS } = require("../messenger");

    type ScreenshotRequestMessage = { type: "CAPTURE_SCREENSHOT" };

    const ScreenshotCapture: React.FC = () => {
        useEffect(() => {
            const handleScreenshotRequest = async (
                event: MessageEvent<ScreenshotRequestMessage>
            ) => {
                if (!ALLOWED_ORIGINS.includes(event.origin as any)) {
                    return;
                }
                if (event.data?.type === "CAPTURE_SCREENSHOT") {
                    try {
                        const canvas = await modernScreenshot.domToCanvas(document.body, {
                            width: window.innerWidth,
                            height: window.innerHeight,
                            scale: window.devicePixelRatio,
                            style: {
                                // Ensure better font rendering
                                fontSmooth: "always",
                                webkitFontSmoothing: "antialiased",
                                mozOsxFontSmoothing: "grayscale",
                            },
                        });

                        const dataUrl = canvas.toDataURL("image/png");
                        messenger.post({
                            type: "SCREENSHOT_CAPTURED",
                            data: {
                                dataUrl,
                                width: canvas.width,
                                height: canvas.height,
                                timestamp: Date.now(),
                            },
                        });
                    } catch (error) {
                        console.warn("Screenshot capture failed", error);
                        messenger.post({
                            type: "SCREENSHOT_CAPTURE_ERROR",
                            error: error instanceof Error ? error.message : String(error),
                        });
                    }
                }
            };

            window.addEventListener("message", handleScreenshotRequest);
            return () => window.removeEventListener("message", handleScreenshotRequest);
        }, []);

        return null;
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = { ScreenshotCapture };
    } else if (typeof window !== "undefined") {
        (window as any).ScreenshotCapture = ScreenshotCapture;
    }
})();

export interface IScreenshotCapture {}

export const ScreenshotCapture: React.FC = () => null;

export default {} as IScreenshotCapture;
