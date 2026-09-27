import {shouldCreateSpanForRequest} from '@libs/telemetry/integrations/common';

// The module builds integrations at import time, so the SDK factories are stubbed out.
jest.mock('@sentry/react-native', () => ({
    reactNavigationIntegration: jest.fn(),
    breadcrumbsIntegration: jest.fn(),
    consoleLoggingIntegration: jest.fn(),
}));

jest.mock('@sentry/react', () => ({
    browserProfilingIntegration: jest.fn(),
}));

describe('shouldCreateSpanForRequest', () => {
    it('creates a span for the API commands we debug with', () => {
        expect(shouldCreateSpanForRequest('https://www.expensify.com/api/OpenReport?')).toBe(true);
    });

    it('drops the NetInfo reachability heartbeat, which every client issues on a timer', () => {
        expect(shouldCreateSpanForRequest('https://www.expensify.com/api/Ping?accountID=123')).toBe(false);
    });

    it('drops the logging command, so writing logs cannot generate more telemetry', () => {
        expect(shouldCreateSpanForRequest('https://www.expensify.com/api/Log?')).toBe(false);
    });

    it.each([
        ['ccm/collect', 'https://www.google.com/ccm/collect?tid=G-12345&en=page_view'],
        ['rmkt/collect', 'https://www.google.com/rmkt/collect?tid=12345'],
        ['pagead/form-data', 'https://googleads.g.doubleclick.net/pagead/form-data?id=12345'],
        ['ccm/form-data', 'https://www.google.com/ccm/form-data?id=12345'],
    ])('drops the third-party Google Ads/Analytics request to %s', (_endpoint, url) => {
        expect(shouldCreateSpanForRequest(url)).toBe(false);
    });
});
