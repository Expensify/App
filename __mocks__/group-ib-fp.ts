const Capability = {
    BatteryStatus: 0,
    Cellular: 1,
    Call: 2,
    Passcode: 3,
    WebView: 4,
    Network: 5,
    Motion: 6,
    Swizzle: 7,
    Location: 8,
    Audio: 9,
    CloudIdentifier: 10,
    DeviceStatus: 11,
    Capture: 12,
    Apps: 13,
    Proxy: 14,
    Keyboard: 15,
    Behavior: 16,
    PreventScreenshots: 17,
    Security: 18,
    Advertise: 19,
    PortScan: 20,
    GlobalId: 21,
};

const FPAttributeFormat = {
    ClearText: 0,
    Hashed: 1,
    Encrypted: 2,
};

const AndroidCapability = {
    CellsCollection: 0,
    AccessPointsCollection: 1,
    Location: 2,
    GlobalIdentification: 3,
    CloudIdentification: 4,
    CallIdentification: 5,
    ActivityCollection: 6,
    MotionCollection: 7,
    PackageCollection: 8,
};

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

export {AndroidCapability, Capability, FP, FPAttributeFormat};
