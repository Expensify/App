/// <reference types="jest" />

declare global {
    namespace jest {
        // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
        interface Expect {
            // eslint-disable-next-line @typescript-eslint/no-empty-object-type
            objectContaining<E = {}>(obj: E): unknown;
            arrayContaining<E = unknown>(arr: readonly E[]): unknown;
        }
    }
}

export {};
