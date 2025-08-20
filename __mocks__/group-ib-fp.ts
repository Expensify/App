enum FPAttributeFormat {
    ClearText = 1,
}

class FP {
    static getInstance(): FP {
        return new FP();
    }

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

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    run(): void {}
}

export default {FP, FPAttributeFormat};
