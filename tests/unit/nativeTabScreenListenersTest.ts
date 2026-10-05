import navigateToInboxTab from '@components/Navigation/NavigationTabBar/navigateToInboxTab';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import tabScreenListeners, {isNativeTabSelectionEnabled} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabScreenListeners';
import {startNavigateToReportsTabSpans} from '@libs/telemetry/startTabNavigationSpans';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

jest.mock('@components/Navigation/NavigationTabBar/navigateToInboxTab', () => jest.fn());
jest.mock('@libs/interceptAnonymousUser', () => jest.fn((callback: () => void) => callback()));
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

    it('opens the Inbox chat list when Inbox is pressed from another tab', () => {
        // Given the native bar, whose Inbox selection is left to JS so that it opens at the chat list like InboxTabButton
        // When the user presses Inbox while another tab is focused
        pressTab(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, false);

        // Then the shared Inbox navigation runs
        expect(navigateToInboxTab).toHaveBeenCalledTimes(1);
    });

    it('checks for an anonymous user before starting the Spend spans', () => {
        // Given the native bar, which never renders SearchTabButton
        // When the user presses Spend while another tab is focused
        pressTab(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, false);

        // Then the spans start behind the same anonymous user check the JS tab button uses
        expect(interceptAnonymousUser).toHaveBeenCalledWith(startNavigateToReportsTabSpans);
        expect(startNavigateToReportsTabSpans).toHaveBeenCalledTimes(1);
    });

    it('does nothing when the already focused tab is pressed again', () => {
        // Given native tabs also emit tabPress for a tap on the focused tab
        // When the user presses Inbox and Spend while each is already focused
        pressTab(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, true);
        pressTab(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, true);

        // Then nothing runs, the same as a JS tab button pressed on its own tab
        expect(navigateToInboxTab).not.toHaveBeenCalled();
        expect(interceptAnonymousUser).not.toHaveBeenCalled();
    });

    it('leaves the switch to JS only for Inbox and, for anonymous users, the tabs they are kept from', () => {
        // Given the tabs whose press has to run JS before any switch
        // When the native selection is decided for a signed-in and for an anonymous user
        // Then Inbox is always switched by JS, and Spend, Insights and Account only for an anonymous user
        expect(isNativeTabSelectionEnabled(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, false)).toBe(false);
        expect(isNativeTabSelectionEnabled(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, false)).toBe(true);
        expect(isNativeTabSelectionEnabled(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, true)).toBe(false);
        expect(isNativeTabSelectionEnabled(SCREENS.INSIGHTS, true)).toBe(false);
        expect(isNativeTabSelectionEnabled(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, true)).toBe(false);
        expect(isNativeTabSelectionEnabled(SCREENS.HOME, true)).toBe(true);
        expect(isNativeTabSelectionEnabled(NAVIGATORS.WORKSPACE_NAVIGATOR, true)).toBe(true);
    });
});
