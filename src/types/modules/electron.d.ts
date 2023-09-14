declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Window {
        electron: Electron;
    }
}

// We used the export {} line to mark this file as an external module
export {};
