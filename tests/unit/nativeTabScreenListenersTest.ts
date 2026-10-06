import navigateToInboxTab from '@components/Navigation/NavigationTabBar/navigateToInboxTab';

import tabScreenListeners, {isNativeTabSelectionEnabled} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabScreenListeners';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

jest.mock('@components/Navigation/NavigationTabBar/navigateToInboxTab', () => jest.fn());

describe('tabScreenListeners', () => {
    it('opens the Inbox chat list only when Inbox is pressed from another tab', () => {
        // Given the native bar, whose Inbox selection is left to JS so that it opens at the chat list like InboxTabButton
        const pressInbox = (isFocused: boolean) => tabScreenListeners({route: {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}, navigation: {isFocused: () => isFocused}}).tabPress();

        // When the user presses Inbox while it is focused and then from another tab
        pressInbox(true);
        pressInbox(false);

        // Then only the press from another tab runs the shared Inbox navigation, as the JS tab button does
        expect(navigateToInboxTab).toHaveBeenCalledTimes(1);
    });

    it('leaves to JS the switches whose JS tab buttons do more than switching', () => {
        // Given a signed-in user who has been to Spend, one who has not, and an anonymous user
        const signedIn = {isAnonymousUser: false, hasSpendBeenSelected: true};
        const beforeSpend = {isAnonymousUser: false, hasSpendBeenSelected: false};
        const anonymous = {isAnonymousUser: true, hasSpendBeenSelected: true};

        // When the native selection is decided
        // Then Inbox and Workspaces are always switched by JS, Spend's first visit is, and anonymous users are kept from Spend, Insights and Account
        expect(isNativeTabSelectionEnabled(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, signedIn)).toBe(false);
        expect(isNativeTabSelectionEnabled(NAVIGATORS.WORKSPACE_NAVIGATOR, signedIn)).toBe(false);
        expect(isNativeTabSelectionEnabled(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, signedIn)).toBe(true);
        expect(isNativeTabSelectionEnabled(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, beforeSpend)).toBe(false);
        expect(isNativeTabSelectionEnabled(SCREENS.INSIGHTS, anonymous)).toBe(false);
        expect(isNativeTabSelectionEnabled(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, anonymous)).toBe(false);
        expect(isNativeTabSelectionEnabled(SCREENS.HOME, anonymous)).toBe(true);
    });
});
