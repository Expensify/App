import setupSentry from '@src/setup/telemetry/setupSentry';

import type {Integration} from '@sentry/core';

/**
 * `classCallCheckNoiseFilterIntegration` reads the `third_party_code` tag that
 * `thirdPartyErrorFilterIntegration` writes in its own `processEvent`. Sentry runs the processors in
 * integration order, so a swap makes the filter permanently inert without any type error. The native
 * integrations index stubs both to `undefined`, so they are mocked here to observe the order
 * `setupSentry` builds.
 */
jest.mock('@libs/telemetry/integrations', () => ({
    navigationIntegration: {name: 'Navigation'},
    tracingIntegration: {name: 'Tracing'},
    browserProfilingIntegration: {name: 'BrowserProfiling'},
    breadcrumbsIntegration: {name: 'Breadcrumbs'},
    consoleIntegration: {name: 'Console'},
    reportingObserverIntegration: undefined,
    thirdPartyErrorFilterIntegration: {name: 'ThirdPartyErrorsFilter'},
    classCallCheckNoiseFilterIntegration: {name: 'ClassCallCheckNoiseFilter'},
}));

jest.mock('@sentry/react-native', () => ({
    init: jest.fn(),
    setTag: jest.fn(),
}));

const sentryMock = jest.requireMock<{init: jest.Mock<void, [{integrations: Integration[]}]>; setTag: jest.Mock}>('@sentry/react-native');

function initIntegrationNames(): string[] {
    setupSentry();
    return (sentryMock.init.mock.calls.at(0)?.at(0)?.integrations ?? []).map((integration) => integration.name);
}

describe('setupSentry integration order', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('registers thirdPartyErrorFilter before classCallCheckNoiseFilter, whose predicate reads its tag', () => {
        const names = initIntegrationNames();

        expect(names).toContain('ThirdPartyErrorsFilter');
        expect(names).toContain('ClassCallCheckNoiseFilter');
        expect(names.indexOf('ThirdPartyErrorsFilter')).toBeLessThan(names.indexOf('ClassCallCheckNoiseFilter'));
    });

    it('drops the integrations that are stubbed out on the current platform', () => {
        expect(initIntegrationNames()).not.toContain(undefined);
    });
});
