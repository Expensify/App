declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Navigator {
        userLanguage: string;
    }
}

// We used the export {} line to mark this file as an external module
export {};
