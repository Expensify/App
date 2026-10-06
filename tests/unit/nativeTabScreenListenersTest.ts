import navigateToInboxTab from '@components/Navigation/NavigationTabBar/navigateToInboxTab';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import tabScreenListeners, {isNativeTabSelectionEnabled} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabScreenListeners';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

jest.mock('@components/Navigation/NavigationTabBar/navigateToInboxTab', () => jest.fn());
jest.mock('@libs/interceptAnonymousUser', () => jest.fn((callback: () => void) => callback()));

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

    it('checks for an anonymous user when Account is pressed from another tab', () => {
        // Given the native bar, which never renders the JS Account button that keeps anonymous users out
        // When the user presses Account while another tab is focused
        pressTab(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, false);

        // Then the same anonymous user check runs
        expect(interceptAnonymousUser).toHaveBeenCalledTimes(1);
    });

    it('does nothing when the already focused tab is pressed again', () => {
        // Given native tabs also emit tabPress for a tap on the focused tab
        // When the user presses Inbox and Account while each is already focused
        pressTab(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, true);
        pressTab(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, true);

        // Then nothing runs, the same as a JS tab button pressed on its own tab
        expect(navigateToInboxTab).not.toHaveBeenCalled();
        expect(interceptAnonymousUser).not.toHaveBeenCalled();
    });

    it('leaves the switch to JS for Inbox and Workspaces and, for anonymous users, the tabs they are kept from', () => {
        // Given a signed-in and an anonymous user who have both already been to Spend
        const signedIn = {isAnonymousUser: false, hasSpendBeenSelected: true};
        const anonymous = {isAnonymousUser: true, hasSpendBeenSelected: true};

        // When the native selection is decided for each tab
        // Then Inbox and Workspaces are always switched by JS, and Spend, Insights and Account only for an anonymous user
        expect(isNativeTabSelectionEnabled(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, signedIn)).toBe(false);
        expect(isNativeTabSelectionEnabled(NAVIGATORS.WORKSPACE_NAVIGATOR, signedIn)).toBe(false);
        expect(isNativeTabSelectionEnabled(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, signedIn)).toBe(true);
        expect(isNativeTabSelectionEnabled(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, anonymous)).toBe(false);
        expect(isNativeTabSelectionEnabled(SCREENS.INSIGHTS, anonymous)).toBe(false);
        expect(isNativeTabSelectionEnabled(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, anonymous)).toBe(false);
        expect(isNativeTabSelectionEnabled(SCREENS.HOME, anonymous)).toBe(true);
        expect(isNativeTabSelectionEnabled(NAVIGATORS.WORKSPACE_NAVIGATOR, anonymous)).toBe(false);
    });

    it('leaves the first switch to Spend to JS', () => {
        // Given a signed-in user who has not been to Spend yet, whose tab was mounted at startup with the default search
        // When the native selection is decided for Spend
        // Then JS switches to it, so the first visit opens the latest search kept in Onyx as the JS tab button does
        expect(isNativeTabSelectionEnabled(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, {isAnonymousUser: false, hasSpendBeenSelected: false})).toBe(false);
    });
});
