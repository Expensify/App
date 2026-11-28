declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface File {
        name?: string;
        source: string;
        uri?: string;
    }
}

export {};
