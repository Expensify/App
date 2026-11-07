import setupSentry from '@src/setup/telemetry/setupSentry';

import type {Integration} from '@sentry/core';

/**
 * Sentry runs event processors in integration order, so registering a noise filter before the
 * `thirdPartyErrorFilterIntegration` that writes the tag it reads makes it inert. The native index stubs all of
 * them to `undefined`, hence the mock, which also lets us observe the order `setupSentry` builds.
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
    googleTranslateRecursionNoiseFilterIntegration: {name: 'GoogleTranslateRecursionNoiseFilter'},
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

    it.each(['ClassCallCheckNoiseFilter', 'GoogleTranslateRecursionNoiseFilter'])('registers thirdPartyErrorFilter before %s, whose predicate reads its tag', (filterName) => {
        // Given a noise filter that reads the `third_party_code` tag
        // When setupSentry builds its integration list
        const names = initIntegrationNames();

        // Then the tagger runs first, or the filter would see untagged events and go inert
        expect(names).toContain('ThirdPartyErrorsFilter');
        expect(names).toContain(filterName);
        expect(names.indexOf('ThirdPartyErrorsFilter')).toBeLessThan(names.indexOf(filterName));
    });

    it('drops the integrations that are stubbed out on the current platform', () => {
        expect(initIntegrationNames()).not.toContain(undefined);
    });
});
