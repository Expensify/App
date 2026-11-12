// Held outside the factory so the assertion can read the calls without importing `@sentry/react`,
// which is a transitive dependency that knip flags when imported by name.
const mockBrowserTracingIntegration = jest.fn(() => ({name: 'BrowserTracing'}));

// The module builds integrations at import time, so the SDK factories are stubbed out.
jest.mock('@sentry/react', () => ({
    browserTracingIntegration: mockBrowserTracingIntegration,
    reportingObserverIntegration: jest.fn(() => ({name: 'ReportingObserver'})),
    thirdPartyErrorFilterIntegration: jest.fn(() => ({name: 'ThirdPartyErrorFilter'})),
    browserProfilingIntegration: jest.fn(() => ({name: 'BrowserProfiling'})),
}));

jest.mock('@sentry/react-native', () => ({
    reactNavigationIntegration: jest.fn(),
    breadcrumbsIntegration: jest.fn(),
    consoleLoggingIntegration: jest.fn(),
}));

describe('web tracing integration', () => {
    it('tells the browser SDK not to create resource spans for stylesheets/fonts, scripts, and beacons', async () => {
        // Given browser resource timings that add background traffic to page load traces
        // When the web integrations module configures browser tracing
        await import('@libs/telemetry/integrations/index.web');

        // Then asset and beacon requests remain enabled without generating these resource spans
        expect(mockBrowserTracingIntegration).toHaveBeenCalledWith(expect.objectContaining({ignoreResourceSpans: ['resource.link', 'resource.script', 'resource.beacon']}));
    });
});
