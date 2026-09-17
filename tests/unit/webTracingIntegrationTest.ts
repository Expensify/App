// The module builds integrations at import time, so the SDK factories are stubbed out.
jest.mock('@sentry/react', () => ({
    browserTracingIntegration: jest.fn(() => ({name: 'BrowserTracing'})),
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
        const {browserTracingIntegration} = await import('@sentry/react');
        await import('@libs/telemetry/integrations/index.web');

        // Then the two highest-volume resource span ops are never created
        expect(browserTracingIntegration).toHaveBeenCalledWith(expect.objectContaining({ignoreResourceSpans: ['resource.link', 'resource.script']}));
    });
});
