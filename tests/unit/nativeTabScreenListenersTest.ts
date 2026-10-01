import tabScreenListeners from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabScreenListeners';
import {startNavigateToInboxTabSpan, startNavigateToReportsTabSpans} from '@libs/telemetry/startTabNavigationSpans';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/telemetry/startTabNavigationSpans', () => ({
    startNavigateToInboxTabSpan: jest.fn(),
    startNavigateToReportsTabSpans: jest.fn(),
}));

function pressTab(routeName: string, isFocused: boolean) {
    tabScreenListeners({route: {name: routeName}, navigation: {isFocused: () => isFocused}}).tabPress();
}

describe('tabScreenListeners', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('starts the inbox tab span when the Inbox tab is pressed from another tab', () => {
        // Given the native bar, which never renders InboxTabButton, so the span has to start from the tab press
        // When the user presses Inbox while another tab is focused
        pressTab(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, false);

        // Then the same span the JS tab button starts is started, tagged as a narrow layout tap
        expect(startNavigateToInboxTabSpan).toHaveBeenCalledWith({isWideLayout: false});
        expect(startNavigateToReportsTabSpans).not.toHaveBeenCalled();
    });

    it('starts the reports tab spans when the Spend tab is pressed from another tab', () => {
        // Given the native bar, which never renders SearchTabButton
        // When the user presses Spend while another tab is focused
        pressTab(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, false);

        // Then the legacy span and its FirstPaint/ContentLoad split are started, as on the JS tab button
        expect(startNavigateToReportsTabSpans).toHaveBeenCalledTimes(1);
        expect(startNavigateToInboxTabSpan).not.toHaveBeenCalled();
    });

    it('starts no span when the already focused tab is pressed again', () => {
        // Given native tabs also emit tabPress for a tap on the focused tab
        // When the user presses Inbox and Spend while each is already focused
        pressTab(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, true);
        pressTab(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, true);

        // Then nothing starts, because no navigation follows that would end the spans
        expect(startNavigateToInboxTabSpan).not.toHaveBeenCalled();
        expect(startNavigateToReportsTabSpans).not.toHaveBeenCalled();
    });

    it('starts no span for tabs without a navigation span', () => {
        // Given Home, Workspaces and Account have no tab navigation span
        // When the user presses each of them from another tab
        pressTab(SCREENS.HOME, false);
        pressTab(NAVIGATORS.WORKSPACE_NAVIGATOR, false);
        pressTab(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, false);

        // Then no tab navigation span starts
        expect(startNavigateToInboxTabSpan).not.toHaveBeenCalled();
        expect(startNavigateToReportsTabSpans).not.toHaveBeenCalled();
    });
});
