const PLATFORMS = ['ios', 'android'] as const;

type BootstrapOptions = {
    rootDirectory: string;
    developmentTeam: string;
    bundleIdentifier: string;
    suffix?: string;
};
type AndroidBootstrapOptions = Omit<BootstrapOptions, 'developmentTeam'>;

function validateSuffix(value: string | undefined): string | undefined {
    if (!value) {
        return undefined;
    }
    if (!/^[A-Za-z0-9-]+$/.test(value)) {
        throw new Error(`Bundle identifier suffix must contain only letters, numbers, or hyphens. Received: ${value}`);
    }
    return value;
}

export {PLATFORMS, validateSuffix};
export type {AndroidBootstrapOptions, BootstrapOptions};
