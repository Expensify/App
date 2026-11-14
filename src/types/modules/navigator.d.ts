declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Navigator {
        userLanguage: string;

        /** User-Agent Client Hints, only available in Chromium-based browsers */
        userAgentData?: {
            getHighEntropyValues?: (hints: string[]) => Promise<{platformVersion?: string}>;
        };
    }
}

// We used the export {} line to mark this file as an external module
export {};
