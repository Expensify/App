declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Window {
        enableMemoryOnlyKeys: () => void;
        disableMemoryOnlyKeys: () => void;
    }
}

// We used the export {} line to mark this file as an external module
export {};
