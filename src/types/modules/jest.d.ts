declare global {
    namespace jest {
        // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
        interface Expect {
            // eslint-disable-next-line @typescript-eslint/ban-types
            objectContaining<E = {}>(obj: E): unknown;
            arrayContaining<E = unknown>(arr: readonly E[]): unknown;
        }
    }
}

// We used the export {} line to mark this file as an external module
export {};
