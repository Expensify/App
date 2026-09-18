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
    it('tells the browser SDK not to create resource spans for stylesheets/fonts and scripts', async () => {
        // Given the web integrations module, which configures browserTracingIntegration at import time
        await import('@libs/telemetry/integrations/index.web');

        // Then the two highest-volume resource span ops are never created
        expect(mockBrowserTracingIntegration).toHaveBeenCalledWith(expect.objectContaining({ignoreResourceSpans: ['resource.link', 'resource.script']}));
    });
});
