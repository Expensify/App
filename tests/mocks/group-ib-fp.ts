export enum FPAttributeFormat {
    ClearText = 1,
}

export class FP {
    static getInstance(): FP {
        return new FP();
    }

    // No-op implementations for tests
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    init(): void {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setCustomerId(): void {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setTargetURL(): void {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setSessionId(): void {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setAttributeTitle(): void {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setLogin(): void {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setCustomEvent(): void {}
}


