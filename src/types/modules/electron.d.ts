import type ContextBridgeApi from '@desktop/contextBridge';

declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Window {
        electron: ContextBridgeApi;
    }
}

// We used the export {} line to mark this file as an external module
export {};
