import React, { useEffect, useState } from "react";
import ErrorModal from "./error-modal";

type AnyData = any;

declare global {
    var __steercode:
        | {
              showError?: (data: AnyData) => void;
          }
        | undefined;
}

export default function ErrorModalProvider({ children }: { children: React.ReactNode }) {
    const [current, setCurrent] = useState<AnyData | null>(null);

    useEffect(() => {
        const g = globalThis as typeof globalThis & { __steercode?: any };
        g.__steercode ??= {};

        // Install the callable entry point
        g.__steercode.showError = (data: AnyData) => {
            setCurrent(data);
            // Return true to indicate we handled the error
            return true;
        };

        // Cleanup on HMR/unmount to avoid stale references
        return () => {
            if (g.__steercode) {
                g.__steercode.showError = undefined;
            }
        };
    }, []);

    const handleClose = () => {
        setCurrent(null);
    };

    return (
        <>
            {children}
            <ErrorModal visible={current !== null} data={current} onClose={handleClose} />
        </>
    );
}
