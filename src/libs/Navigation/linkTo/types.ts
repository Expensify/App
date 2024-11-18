type ActionPayloadParams = {
    screen?: string;
    params?: unknown;
    path?: string;
};

type ActionPayload = {
    params?: ActionPayloadParams;
};

type LinkToOptions = Partial<{
    // To explicitly set the action type to replace.
    forceReplace: boolean;

    // If true, the report route will be converted to the opposite form (fullscreen to rhp or rhp to fullscreen) if necessary.
    // Check shouldConvertReportPath to see when it will be converted.
    reportPathConversionEnabled: boolean;
}>;

export type {ActionPayload, ActionPayloadParams, LinkToOptions};
