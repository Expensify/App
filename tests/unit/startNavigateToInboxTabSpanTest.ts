import {startSpan} from '@libs/telemetry/activeSpans';
import {markReportsTabPreloadDispatched} from '@libs/telemetry/reportsTabPreloadTime';
import {startNavigateToInboxTabSpan} from '@libs/telemetry/startTabNavigationSpans';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/telemetry/activeSpans', () => ({startSpan: jest.fn()}));
jest.mock('@libs/telemetry/navigateToReportsSpans', () => ({startNavigateToReportsSpans: jest.fn()}));
let mockRootState: unknown;
jest.mock('@navigation/navigationRef', () => ({getRootState: () => mockRootState}));

const REPORTS_ROUTE_KEY = 'reports-key';
const TAB_NAVIGATOR_KEY = 'tab-key';

function setRootState({focusedIndex, preloadedRouteKeys}: {focusedIndex: number; preloadedRouteKeys: string[]}) {
    mockRootState = {
        routes: [
            {
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    key: TAB_NAVIGATOR_KEY,
                    index: focusedIndex,
                    preloadedRouteKeys,
                    routes: [
                        {name: SCREENS.HOME, key: 'home-key'},
                        {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, key: 'search-key'},
                        {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, key: REPORTS_ROUTE_KEY},
                    ],
                },
            },
        ],
    };
}

function getStartedAttributes() {
    return jest.mocked(startSpan).mock.calls.at(-1)?.[1].attributes ?? {};
}

describe('startNavigateToInboxTabSpan', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('records the tab being left and how long the preloaded tab waited', () => {
        // Given the user is on Search and the Reports tab was preloaded 5 seconds ago
        const nowSpy = jest.spyOn(performance, 'now').mockReturnValue(1000);
        markReportsTabPreloadDispatched(TAB_NAVIGATOR_KEY);
        nowSpy.mockReturnValue(6000);
        setRootState({focusedIndex: 1, preloadedRouteKeys: [REPORTS_ROUTE_KEY]});

        // When the Inbox tab is tapped, before the switch is dispatched, so the span still sees the tab being left
        startNavigateToInboxTabSpan({isWideLayout: true});

        // Then the span says where the tap came from and how long the frozen tab waited, so slow taps can be split by both
        expect(getStartedAttributes()).toMatchObject({
            [CONST.TELEMETRY.ATTRIBUTE_SOURCE_TAB]: 'SEARCH',
            [CONST.TELEMETRY.ATTRIBUTE_IS_PRELOADED]: true,
            [CONST.TELEMETRY.ATTRIBUTE_MS_SINCE_PRELOAD]: 5000,
        });
        nowSpy.mockRestore();
    });

    it('leaves out the preload wait when the tab is not preloaded', () => {
        // Given a preload happened earlier, but the Reports tab is not preloaded anymore and the user is on Home
        markReportsTabPreloadDispatched(TAB_NAVIGATOR_KEY);
        setRootState({focusedIndex: 0, preloadedRouteKeys: []});

        // When the Inbox tab is tapped, before the switch is dispatched, so the span still sees the tab being left
        startNavigateToInboxTabSpan({isWideLayout: false});

        // Then no wait is reported, because an old preload time would describe a tab that is no longer frozen
        const attributes = getStartedAttributes();
        expect(attributes[CONST.TELEMETRY.ATTRIBUTE_SOURCE_TAB]).toBe('HOME');
        expect(attributes[CONST.TELEMETRY.ATTRIBUTE_IS_PRELOADED]).toBe(false);
        expect(attributes).not.toHaveProperty(CONST.TELEMETRY.ATTRIBUTE_MS_SINCE_PRELOAD);
    });

    it('leaves out the preload wait when the last preload went to another tab navigator', () => {
        // Given a cross-tab deep link pushed a second tab navigator whose preload overwrote the saved time, and the user went back to the first one
        markReportsTabPreloadDispatched('pushed-tab-key');
        setRootState({focusedIndex: 1, preloadedRouteKeys: [REPORTS_ROUTE_KEY]});

        // When the Inbox tab is tapped on the first tab navigator, whose Reports tab is still preloaded
        startNavigateToInboxTabSpan({isWideLayout: true});

        // Then no wait is reported, because the saved time belongs to the other navigator's preload and would understate the wait
        const attributes = getStartedAttributes();
        expect(attributes[CONST.TELEMETRY.ATTRIBUTE_IS_PRELOADED]).toBe(true);
        expect(attributes).not.toHaveProperty(CONST.TELEMETRY.ATTRIBUTE_MS_SINCE_PRELOAD);
    });
});
