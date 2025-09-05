type FPAttributeFormat = 1;
const FPAttributeFormatMap = {ClearText: 1 as FPAttributeFormat};

class FP {
    static getInstance() {
        return new FP();
    }

    enableDebugLogs() {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    enableCapability(..._a: unknown[]) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    enableAndroidCapability(..._a: unknown[]) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setCustomerId(..._a: unknown[]) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setTargetURL(..._a: unknown[]) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setGlobalIdURL(..._a: unknown[]) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setSessionId(..._a: unknown[]) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setAttributeTitle(..._a: unknown[]) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setLogin(..._a: unknown[]) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setCustomEvent(..._a: unknown[]) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run(..._a: unknown[]) {}
}

export {FP, FPAttributeFormatMap as FPAttributeFormat};
