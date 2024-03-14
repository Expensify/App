type ExpectedArgs = {
    mockNetwork?: boolean;
};
// @ts-expect-error by default property `launchArgs` doesn't exist, but we set it before page loading
const LaunchArgs: ExpectedArgs = window.launchArgs;

export default LaunchArgs;
