// TODO: Move this type to desktop/contextBridge.js once it is converted to TS
type ContextBridgeApi = {
    send: (channel: string, data?: unknown) => void;
    sendSync: (channel: string, data?: unknown) => unknown;
    invoke: (channel: string, ...args: unknown) => Promise<unknown>;
    on: (channel: string, func: () => void) => void;
    removeAllListeners: (channel: string) => void;
};

declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Window {
        electron: ContextBridgeApi;
    }
}

// We used the export {} line to mark this file as an external module
export {};
