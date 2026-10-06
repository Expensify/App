import navigateToInboxTab from '@components/Navigation/NavigationTabBar/navigateToInboxTab';

import tabScreenListeners, {isNativeTabSelectionEnabled} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabScreenListeners';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

jest.mock('@components/Navigation/NavigationTabBar/navigateToInboxTab', () => jest.fn());
jest.mock('@libs/telemetry/startTabNavigationSpans');

describe('tabScreenListeners', () => {
    it('opens the Inbox chat list only when Inbox is pressed from another tab with a report open', () => {
        // Given Inbox left with a report open, which the native bar does not switch to, so JS opens it at the chat list like InboxTabButton
        const inboxWithReport = {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, state: {routes: [{name: SCREENS.INBOX}, {name: SCREENS.REPORT}], index: 1}};
        const inboxAtChatList = {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, state: {routes: [{name: SCREENS.INBOX}], index: 0}};
        const pressInbox = (route: Parameters<typeof tabScreenListeners>[0]['route'], isFocused: boolean) => tabScreenListeners({route, navigation: {isFocused: () => isFocused}}).tabPress();

        // When the user presses Inbox while it is focused, from another tab at the chat list, and from another tab with a report open
        pressInbox(inboxWithReport, true);
        pressInbox(inboxAtChatList, false);
        pressInbox(inboxWithReport, false);

        // Then only the last press runs the shared Inbox navigation, since the native switch already lands on the chat list
        expect(navigateToInboxTab).toHaveBeenCalledTimes(1);
    });

    it('leaves to JS only the switches that would land somewhere else than the JS tab buttons', () => {
        // Given a signed-in user whose Inbox and Workspaces tabs show what their tab buttons open, one whose do not, and an anonymous user
        const ready = {isAnonymousUser: false, isInboxAtChatList: true, isWorkspacesTabRestored: true};
        const unrestored = {isAnonymousUser: false, isInboxAtChatList: false, isWorkspacesTabRestored: false};
        const anonymous = {...ready, isAnonymousUser: true};

        // When the native selection is decided
        // Then Inbox and Workspaces are switched natively only when ready, Spend always is, and anonymous users are kept from Spend, Insights, Workspaces and Account
        expect(isNativeTabSelectionEnabled(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, ready)).toBe(true);
        expect(isNativeTabSelectionEnabled(NAVIGATORS.WORKSPACE_NAVIGATOR, ready)).toBe(true);
        expect(isNativeTabSelectionEnabled(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, unrestored)).toBe(false);
        expect(isNativeTabSelectionEnabled(NAVIGATORS.WORKSPACE_NAVIGATOR, unrestored)).toBe(false);
        expect(isNativeTabSelectionEnabled(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, unrestored)).toBe(true);
        expect(isNativeTabSelectionEnabled(SCREENS.INSIGHTS, anonymous)).toBe(false);
        expect(isNativeTabSelectionEnabled(NAVIGATORS.WORKSPACE_NAVIGATOR, anonymous)).toBe(false);
        expect(isNativeTabSelectionEnabled(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, anonymous)).toBe(false);
        expect(isNativeTabSelectionEnabled(SCREENS.HOME, anonymous)).toBe(true);
    });
});
