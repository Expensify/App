import type {TelemetryBeforeSendError} from './index';

// Browser extensions, autofill/password managers, and injected user scripts run inside the page and can
// throw errors that Sentry's global `onunhandledrejection`/`onerror` handlers sweep up and mis-attribute
// to whatever route the tab was on. Their stack frames carry a browser-extension URL scheme rather than an
// Expensify bundle URL, so they surface as foreign crashes (e.g. `modifyFeaturesStep`) with symbols that
// don't exist anywhere in our bundle. Drop errors whose frames originate entirely from these third-party
// scripts so they don't pollute our issue stream.
// See https://github.com/Expensify/App/issues/97100
const THIRD_PARTY_FRAME_SCHEMES = ['chrome-extension://', 'moz-extension://', 'safari-web-extension://', 'safari-extension://', 'webkit-masked-url://'];

const isThirdPartyFrame = (source: string): boolean => THIRD_PARTY_FRAME_SCHEMES.some((scheme) => source.startsWith(scheme));

const thirdPartyErrorFilter: TelemetryBeforeSendError = (event) => {
    const sources = (event.exception?.values ?? [])
        .flatMap((value) => value.stacktrace?.frames ?? [])
        .map((frame) => frame.abs_path ?? frame.filename ?? '')
        .filter((source) => source.length > 0);

    // No frame URLs to judge by (e.g. native, minified, or synthetic errors) — keep the event.
    if (sources.length === 0) {
        return event;
    }

    // Drop the event only when every frame with a URL comes from a third-party extension script.
    // If any frame originates from our own bundle, it's a real App error and must be kept.
    if (sources.every(isThirdPartyFrame)) {
        return null;
    }

    return event;
};

export default thirdPartyErrorFilter;
