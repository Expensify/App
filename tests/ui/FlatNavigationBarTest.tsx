import {act, cleanup, fireEvent, render, screen, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import FlatNavigationBar from '@components/Navigation/FlatNavigationBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {signOutAndRedirectToSignIn} from '@libs/actions/Session';
import {getIsSearchTabHovered, setIsSearchTabHovered} from '@libs/Navigation/helpers/searchTabPreloadStore';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';
import {StyleSheet} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type IndicatorStatusMock = {status: string | undefined; indicatorColor: string | undefined};

const NO_INDICATOR: IndicatorStatusMock = {status: undefined, indicatorColor: undefined};
const REVIEW_REQUIRED: IndicatorStatusMock = {status: 'review-required', indicatorColor: 'red'};

const mockNavigateToInbox = jest.fn();
const mockNavigateToSearch = jest.fn();
const mockNavigateToInsights = jest.fn();
const mockNavigateToWorkspaces = jest.fn();
let mockInboxIndicator = NO_INDICATOR;
let mockWorkspacesIndicator = NO_INDICATOR;

jest.mock('@components/Navigation/NavigationTabBar/useWideInboxNavigation', () => () => mockNavigateToInbox);
jest.mock('@components/Navigation/NavigationTabBar/useSearchTabNavigation', () => () => mockNavigateToSearch);
jest.mock('@components/Navigation/NavigationTabBar/useInsightsTabNavigation', () => () => mockNavigateToInsights);
jest.mock('@hooks/useRestoreWorkspacesTabOnNavigate', () => () => mockNavigateToWorkspaces);
jest.mock('@hooks/useInboxTabIndicatorStatus', () => () => mockInboxIndicator);
jest.mock('@hooks/useWorkspacesTabIndicatorStatus', () => () => mockWorkspacesIndicator);
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: () => true,
    useFocusEffect: jest.fn(),
}));
type MockCreateButtonProps = {
    isCompact?: boolean;
    isCreateMenuActive?: boolean;
    isCreateMenuVisible?: boolean;
    showCreateMenu?: () => void;
    hideCreateMenu?: () => void;
    onCreateMenuHidden?: () => void;
};
let mockCreateButtonProps: MockCreateButtonProps | undefined;
jest.mock('@components/Navigation/FlatNavigationBar/FlatNavCreateButton', () => (props: MockCreateButtonProps) => {
    mockCreateButtonProps = props;
    return null;
});
let mockIsElementHovered = false;
let mockIsFocusMovingInside = false;
let mockHasKeyboardFocusInside = false;
jest.mock('@libs/isHTMLElement', () => ({
    __esModule: true,
    default: (val: unknown): val is HTMLElement => {
        if ((!mockIsElementHovered && !mockIsFocusMovingInside && !mockHasKeyboardFocusInside) || typeof val !== 'object' || val === null) {
            return false;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- attach DOM methods to the test instance for mock hover and focus verification
        const target = val as {matches?: (selector: string) => boolean; contains?: (other: unknown) => boolean; querySelector?: (selector: string) => unknown};
        target.matches = (selector: string) => mockIsElementHovered && selector === ':hover';
        target.contains = () => mockIsFocusMovingInside;
        target.querySelector = (selector: string) => (mockHasKeyboardFocusInside && selector === ':focus-visible' ? {} : null);
        return true;
    },
}));
jest.mock('@pages/inbox/sidebar/SupportalSwitcherButton', () => () => null);
jest.mock('@components/Avatar/AccountNavigationAvatar', () => () => null);
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {navigate: jest.fn()},
}));
let mockOuterHoverOut: (() => void) | undefined;
let mockInnerHoverIn: (() => void) | undefined;
jest.mock(
    '@components/Hoverable',
    () =>
        ({children, onHoverIn, onHoverOut}: {children: React.ReactNode | ((isHovered: boolean) => React.ReactNode); onHoverIn?: () => void; onHoverOut?: () => void}) => {
            if (onHoverOut) {
                mockOuterHoverOut = onHoverOut;
            }
            if (onHoverIn) {
                mockInnerHoverIn = onHoverIn;
            }
            return typeof children === 'function' ? children(false) : children;
        },
);
jest.mock('@libs/actions/Session', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/Session'),
    signOutAndRedirectToSignIn: jest.fn(),
}));

const REVIEW_REQUIRED_SUFFIX = 'Your review is required';
const ACCOUNT_ID = 1;

function renderBar(selectedTab: ValueOf<typeof NAVIGATION_TABS>) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
            <FlatNavigationBar selectedTab={selectedTab} />
        </ComposeProviders>,
    );
}

function getSavedSidebarState() {
    return Onyx.get(ONYXKEYS.NVP_SEARCH_SIDEBAR);
}

function isStyleProp(value: unknown): value is StyleProp<ViewStyle> {
    return value === undefined || value === null || typeof value === 'object';
}

function getRow(name: string | RegExp) {
    return screen.getByRole(CONST.ROLE.TAB, {name});
}

describe('FlatNavigationBar', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockCreateButtonProps = undefined;
        mockIsElementHovered = false;
        mockIsFocusMovingInside = false;
        mockHasKeyboardFocusInside = false;
        mockOuterHoverOut = undefined;
        mockInnerHoverIn = undefined;
        mockInboxIndicator = NO_INDICATOR;
        mockWorkspacesIndicator = NO_INDICATOR;
        setIsSearchTabHovered(false);
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: 'user@example.com'});
    });

    afterEach(async () => {
        cleanup();
        await Onyx.clear();
    });

    it('opens each destination through the same handlers the icon bar uses', async () => {
        // Given the bar on the Home tab
        renderBar(NAVIGATION_TABS.HOME);
        await waitForBatchedUpdatesWithAct();

        // When every row other than Home is pressed
        fireEvent.press(getRow('Inbox'));
        fireEvent.press(getRow('Spend'));
        fireEvent.press(getRow('Insights'));
        fireEvent.press(getRow('Workspaces'));

        // Then each row reuses its tab's navigation, so the bar navigates exactly as the icon bar does today
        expect(mockNavigateToInbox).toHaveBeenCalledTimes(1);
        expect(mockNavigateToSearch).toHaveBeenCalledTimes(1);
        expect(mockNavigateToInsights).toHaveBeenCalledTimes(1);
        expect(mockNavigateToWorkspaces).toHaveBeenCalledTimes(1);
    });

    it.each([
        [NAVIGATION_TABS.HOME, 'Home'],
        [NAVIGATION_TABS.INBOX, 'Inbox'],
        [NAVIGATION_TABS.SEARCH, 'Spend'],
        [NAVIGATION_TABS.INSIGHTS, 'Insights'],
        [NAVIGATION_TABS.WORKSPACES, 'Workspaces'],
        [NAVIGATION_TABS.SETTINGS, 'Account, My settings'],
    ])('selects only the row of the %s tab', async (selectedTab, rowName) => {
        // Given the bar on one tab
        renderBar(selectedTab);
        await waitForBatchedUpdatesWithAct();

        // When the rows are read
        const selectedRows = screen.getAllByRole(CONST.ROLE.TAB, {selected: true});

        // Then exactly the row for that tab is selected, so a row wired to another tab shows up here
        expect(selectedRows).toHaveLength(1);
        expect(getRow(rowName)).toBeSelected();
    });

    it('reports the pointer resting on the Spend row', async () => {
        // Given the bar on the Home tab
        renderBar(NAVIGATION_TABS.HOME);
        await waitForBatchedUpdatesWithAct();

        // When the pointer moves onto the Spend row
        fireEvent(getRow('Spend'), 'hoverIn');

        // Then the preloaded Spend tab hears about it, so it can catch up on skipped updates before the click, as with the icon bar
        expect(getIsSearchTabHovered()).toBe(true);

        // And when the pointer leaves, it can freeze again
        fireEvent(getRow('Spend'), 'hoverOut');
        expect(getIsSearchTabHovered()).toBe(false);
    });

    it('drops the Spend hover when the bar goes away while hovered', async () => {
        // Given the pointer rests on the Spend row
        const {unmount} = renderBar(NAVIGATION_TABS.HOME);
        await waitForBatchedUpdatesWithAct();
        fireEvent(getRow('Spend'), 'hoverIn');

        // When the bar unmounts with no hover out, e.g. on a switch to the narrow layout
        unmount();

        // Then the preloaded Spend tab is no longer kept unfrozen by a pointer that is not there
        expect(getIsSearchTabHovered()).toBe(false);
    });

    it('leaves pressing the current row as a no-op', async () => {
        // Given the bar on the Home tab
        renderBar(NAVIGATION_TABS.HOME);
        await waitForBatchedUpdatesWithAct();

        // When the Home row is pressed
        fireEvent.press(getRow('Home'));

        // Then it does not navigate, because the user is already there
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('leaves pressing the current Account row as a no-op', async () => {
        // Given the bar on the Account tab
        renderBar(NAVIGATION_TABS.SETTINGS);
        await waitForBatchedUpdatesWithAct();

        // When the Account row is pressed
        fireEvent.press(getRow('Account, My settings'));

        // Then it does not navigate, because the user is already in settings
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('labels the Account row with the user name', async () => {
        // Given a user with a display name
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, displayName: 'John Doe'}});

        // When the bar renders
        renderBar(NAVIGATION_TABS.HOME);
        await waitForBatchedUpdatesWithAct();

        // Then the row shows the name and its accessible name contains it, so voice control can activate it by the visible label
        expect(getRow('John Doe, My settings')).toBeOnTheScreen();
        expect(within(getRow('John Doe, My settings')).getByText('John Doe')).toBeOnTheScreen();
    });

    it('shows the emoji status on the right of the Account row', async () => {
        // Given a user with an emoji status
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, displayName: 'John Doe', status: {emojiCode: '🥪', text: 'Lunch!'}}});

        // When the bar renders
        renderBar(NAVIGATION_TABS.HOME);
        await waitForBatchedUpdatesWithAct();

        // Then the emoji sits inside the Account row as its own chip, because a badge on the avatar crowds its ring and dot
        expect(within(getRow('John Doe, My settings')).getByTestId('FlatNavAccountStatus')).toBeOnTheScreen();
        expect(within(getRow('John Doe, My settings')).getByText('🥪')).toBeOnTheScreen();
    });

    it('shows no status chip when the user has no emoji status', async () => {
        // Given a user without an emoji status
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, displayName: 'John Doe'}});

        // When the bar renders
        renderBar(NAVIGATION_TABS.HOME);
        await waitForBatchedUpdatesWithAct();

        // Then the row keeps only the avatar and the name, so an empty chip never takes space next to the name
        expect(screen.queryByTestId('FlatNavAccountStatus')).not.toBeOnTheScreen();
    });

    it('flags Inbox and Workspaces when they need the user', async () => {
        // Given both Inbox and Workspaces have something that needs the user's review
        mockInboxIndicator = REVIEW_REQUIRED;
        mockWorkspacesIndicator = REVIEW_REQUIRED;

        // When the bar renders
        renderBar(NAVIGATION_TABS.HOME);
        await waitForBatchedUpdatesWithAct();

        // Then both rows show the dot and tell screen readers, the same as the icon bar's tabs
        const inboxRow = getRow(`Inbox. ${REVIEW_REQUIRED_SUFFIX}`);
        const workspacesRow = getRow(`Workspaces. ${REVIEW_REQUIRED_SUFFIX}`);
        expect(within(inboxRow).getByTestId('FlatNavItemStatusIndicator')).toBeOnTheScreen();
        expect(within(workspacesRow).getByTestId('FlatNavItemStatusIndicator')).toBeOnTheScreen();
    });

    it('shows no dot when nothing needs the user', async () => {
        // Given nothing needs the user's review
        // When the bar renders
        renderBar(NAVIGATION_TABS.HOME);
        await waitForBatchedUpdatesWithAct();

        // Then no row carries a dot or the review-required label
        expect(screen.queryByTestId('FlatNavItemStatusIndicator')).not.toBeOnTheScreen();
        expect(getRow('Inbox')).toBeOnTheScreen();
        expect(getRow('Workspaces')).toBeOnTheScreen();
    });

    it('opens Account from the row at the bottom', async () => {
        // Given the bar on the Inbox tab
        renderBar(NAVIGATION_TABS.INBOX);
        await waitForBatchedUpdatesWithAct();

        // When the Account row is pressed
        fireEvent.press(getRow('Account, My settings'));

        // Then it opens the Account tab, which no longer has a slot among the rows above
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS);
    });

    describe('collapsing', () => {
        function getBarWidth() {
            const style: unknown = screen.getByTestId('FlatNavigationBar').props.style;
            return isStyleProp(style) ? StyleSheet.flatten(style)?.width : undefined;
        }

        it('collapses into a rail when the toggle is pressed and saves the state', async () => {
            // Given the expanded bar
            renderBar(NAVIGATION_TABS.HOME);
            await waitForBatchedUpdatesWithAct();
            expect(getBarWidth()).toBe(variables.flatNavigationBarWidth);

            // When the toggle next to the logo is pressed
            fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: 'Collapse'}));
            await waitForBatchedUpdatesWithAct();

            // Then the bar narrows to the rail, the flag is saved for the next load, and the toggle now offers to expand
            expect(getBarWidth()).toBe(variables.flatNavigationBarCollapsedWidth);
            expect(await getSavedSidebarState()).toEqual({isCollapsed: true});
            expect(screen.getByRole(CONST.ROLE.BUTTON, {name: 'Expand'})).toBeOnTheScreen();
        });

        it('renders collapsed on load when the saved state says so', async () => {
            // Given a collapsed state saved by an earlier session
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});

            // When the bar mounts
            renderBar(NAVIGATION_TABS.HOME);
            await waitForBatchedUpdatesWithAct();

            // Then it is already the rail, so a reload does not flash the wide bar first
            expect(getBarWidth()).toBe(variables.flatNavigationBarCollapsedWidth);
        });

        it('keeps every row reachable by its name while collapsed', async () => {
            // Given a collapsed bar with the Inbox flagged for review
            mockInboxIndicator = REVIEW_REQUIRED;
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});
            renderBar(NAVIGATION_TABS.HOME);
            await waitForBatchedUpdatesWithAct();

            // When the rows are read and one is pressed
            fireEvent.press(getRow('Spend'));

            // Then the labels are still the rows' accessible names, since only their drawing fades, and a press still navigates
            expect(getRow(`Inbox. ${REVIEW_REQUIRED_SUFFIX}`)).toBeOnTheScreen();
            expect(getRow('Workspaces')).toBeOnTheScreen();
            expect(mockNavigateToSearch).toHaveBeenCalledTimes(1);
            expect(screen.getAllByTestId('FlatNavItemStatusIndicator')).toHaveLength(1);
        });

        it('disables logo pointer events and accessibility while collapsed', async () => {
            // Given a collapsed bar
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});

            // When the bar mounts
            renderBar(NAVIGATION_TABS.HOME);
            await waitForBatchedUpdatesWithAct();

            // Then the logo container turns off pointer events and the logo button is disabled and hidden from accessibility
            expect(screen.getByTestId('FlatNavLogoContainer').props.pointerEvents).toBe('none');

            const logoButton = screen.getByTestId('ExpensifyLogoButton', {includeHiddenElements: true});
            expect(logoButton.props['aria-hidden']).toBe(true);
            expect(logoButton.props.accessibilityState).toEqual(expect.objectContaining({disabled: true}));
        });

        it('keeps the bar peeking when hovering out while the create menu is open', async () => {
            // Given a collapsed bar
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});
            renderBar(NAVIGATION_TABS.HOME);
            await waitForBatchedUpdatesWithAct();

            // When the pointer enters the items, which starts a peek
            act(() => {
                mockInnerHoverIn?.();
            });
            await waitForBatchedUpdatesWithAct();
            expect(getBarWidth()).toBe(variables.flatNavigationBarWidth);

            // And the Create menu opens
            act(() => {
                mockCreateButtonProps?.showCreateMenu?.();
            });
            await waitForBatchedUpdatesWithAct();

            // And the pointer leaves the bar (e.g. moving onto the popover)
            act(() => {
                mockOuterHoverOut?.();
            });
            await waitForBatchedUpdatesWithAct();

            // Then the bar stays peeking so the menu does not collapse out from under the pointer
            expect(getBarWidth()).toBe(variables.flatNavigationBarWidth);

            // When the menu closes and its modal is gone from the screen
            act(() => {
                mockCreateButtonProps?.hideCreateMenu?.();
            });
            act(() => {
                mockCreateButtonProps?.onCreateMenuHidden?.();
            });
            await waitForBatchedUpdatesWithAct();

            // Then the peek ends and the bar collapses back to a rail
            expect(getBarWidth()).toBe(variables.flatNavigationBarCollapsedWidth);
        });

        it('keeps the bar peeking after the create menu closes if the pointer is still hovering the bar', async () => {
            // Given a collapsed bar currently peeking with the Create menu open
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});
            renderBar(NAVIGATION_TABS.HOME);
            await waitForBatchedUpdatesWithAct();

            act(() => {
                mockInnerHoverIn?.();
            });
            await waitForBatchedUpdatesWithAct();
            act(() => {
                mockCreateButtonProps?.showCreateMenu?.();
            });
            await waitForBatchedUpdatesWithAct();

            // When the menu closes with the pointer still hovering over the bar
            mockIsElementHovered = true;
            act(() => {
                mockCreateButtonProps?.hideCreateMenu?.();
            });
            act(() => {
                mockCreateButtonProps?.onCreateMenuHidden?.();
            });
            await waitForBatchedUpdatesWithAct();

            // Then the bar stays peeking because the cursor is still hovering over it
            expect(getBarWidth()).toBe(variables.flatNavigationBarWidth);

            // When the pointer leaves the bar
            mockIsElementHovered = false;
            act(() => {
                mockOuterHoverOut?.();
            });
            await waitForBatchedUpdatesWithAct();

            // Then the peek ends and the bar collapses back to a rail
            expect(getBarWidth()).toBe(variables.flatNavigationBarCollapsedWidth);
        });

        it('keeps the bar peeking after the create menu closes if an item has keyboard focus', async () => {
            // Given a collapsed bar currently peeking with the Create menu open and no hover over the bar
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});
            renderBar(NAVIGATION_TABS.HOME);
            await waitForBatchedUpdatesWithAct();

            act(() => {
                mockInnerHoverIn?.();
            });
            await waitForBatchedUpdatesWithAct();
            act(() => {
                mockCreateButtonProps?.showCreateMenu?.();
            });
            await waitForBatchedUpdatesWithAct();

            // When the menu closes while an item inside the bar retains keyboard focus
            mockIsElementHovered = false;
            mockHasKeyboardFocusInside = true;
            act(() => {
                mockCreateButtonProps?.hideCreateMenu?.();
            });
            act(() => {
                mockCreateButtonProps?.onCreateMenuHidden?.();
            });
            await waitForBatchedUpdatesWithAct();

            // Then the bar stays peeking so the keyboard user still sees labels
            expect(getBarWidth()).toBe(variables.flatNavigationBarWidth);
        });

        it('keeps the bar peeking while the closing create menu is still on screen', async () => {
            // Given a collapsed bar currently peeking with the Create menu open and the pointer away from the bar
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});
            renderBar(NAVIGATION_TABS.HOME);
            await waitForBatchedUpdatesWithAct();

            act(() => {
                mockInnerHoverIn?.();
            });
            await waitForBatchedUpdatesWithAct();
            act(() => {
                mockCreateButtonProps?.showCreateMenu?.();
            });
            await waitForBatchedUpdatesWithAct();

            // When the menu starts closing, but its modal has not finished hiding yet
            act(() => {
                mockCreateButtonProps?.hideCreateMenu?.();
            });
            await waitForBatchedUpdatesWithAct();

            // Then the bar stays peeking, because the modal's overlay still covers the bar and hides whether the pointer is on it
            expect(getBarWidth()).toBe(variables.flatNavigationBarWidth);
        });

        it('keeps the bar peeking if the create menu reopens before the previous close finished', async () => {
            // Given a collapsed bar currently peeking with the Create menu open
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});
            renderBar(NAVIGATION_TABS.HOME);
            await waitForBatchedUpdatesWithAct();

            act(() => {
                mockInnerHoverIn?.();
            });
            await waitForBatchedUpdatesWithAct();
            act(() => {
                mockCreateButtonProps?.showCreateMenu?.();
            });
            await waitForBatchedUpdatesWithAct();

            // When the menu closes, reopens, and only then reports the earlier close as finished
            act(() => {
                mockCreateButtonProps?.hideCreateMenu?.();
            });
            act(() => {
                mockCreateButtonProps?.showCreateMenu?.();
            });
            act(() => {
                mockCreateButtonProps?.onCreateMenuHidden?.();
            });
            await waitForBatchedUpdatesWithAct();

            // Then the bar stays peeking under the open menu even though the pointer is not over it
            expect(getBarWidth()).toBe(variables.flatNavigationBarWidth);
        });

        it('peeks the bar when items receive keyboard focus and collapses on blur', async () => {
            // Given a collapsed bar
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});
            renderBar(NAVIGATION_TABS.HOME);
            await waitForBatchedUpdatesWithAct();
            expect(getBarWidth()).toBe(variables.flatNavigationBarCollapsedWidth);

            // When navigation items gain focus via keyboard navigation
            fireEvent(screen.getByTestId('FlatNavPeekableBody'), 'focus');
            await waitForBatchedUpdatesWithAct();

            // Then the bar peeks open to reveal labels for keyboard users
            expect(getBarWidth()).toBe(variables.flatNavigationBarWidth);

            // When focus leaves the navigation items
            fireEvent(screen.getByTestId('FlatNavPeekableBody'), 'blur', {
                nativeEvent: {},
            });
            await waitForBatchedUpdatesWithAct();

            // Then the bar collapses back to a skinny rail
            expect(getBarWidth()).toBe(variables.flatNavigationBarCollapsedWidth);
        });

        it('keeps the peek open when focus moves between items inside the bar', async () => {
            // Given a collapsed bar peeking because an item has keyboard focus
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});
            renderBar(NAVIGATION_TABS.HOME);
            await waitForBatchedUpdatesWithAct();
            fireEvent(screen.getByTestId('FlatNavPeekableBody'), 'focus');
            await waitForBatchedUpdatesWithAct();

            // When focus moves to another item inside the bar, e.g. tabbing from Home to Inbox
            mockIsFocusMovingInside = true;
            fireEvent(screen.getByTestId('FlatNavPeekableBody'), 'blur', {
                currentTarget: {},
                nativeEvent: {relatedTarget: {}},
            });
            await waitForBatchedUpdatesWithAct();

            // Then the bar stays peeking, so its labels do not flicker on every Tab press
            expect(getBarWidth()).toBe(variables.flatNavigationBarWidth);
        });

        it('keeps the peek open when the pointer leaves while an item has keyboard focus', async () => {
            // Given a collapsed bar peeking because an item has keyboard focus
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});
            renderBar(NAVIGATION_TABS.HOME);
            await waitForBatchedUpdatesWithAct();
            mockHasKeyboardFocusInside = true;
            fireEvent(screen.getByTestId('FlatNavPeekableBody'), 'focus');
            await waitForBatchedUpdatesWithAct();

            // When the pointer passes over the bar and leaves it
            act(() => {
                mockOuterHoverOut?.();
            });
            await waitForBatchedUpdatesWithAct();

            // Then the bar stays peeking, so the keyboard user still sees the label of the focused item
            expect(getBarWidth()).toBe(variables.flatNavigationBarWidth);
        });

        it('collapses when the pointer leaves after an item was focused by a mouse click', async () => {
            // Given a collapsed bar peeking with focus inside that is not keyboard focus, as after clicking an item
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});
            renderBar(NAVIGATION_TABS.HOME);
            await waitForBatchedUpdatesWithAct();
            fireEvent(screen.getByTestId('FlatNavPeekableBody'), 'focus');
            await waitForBatchedUpdatesWithAct();

            // When the pointer leaves the bar
            act(() => {
                mockOuterHoverOut?.();
            });
            await waitForBatchedUpdatesWithAct();

            // Then the bar collapses, because mouse focus must not hold it open
            expect(getBarWidth()).toBe(variables.flatNavigationBarCollapsedWidth);
        });
    });

    it('sends an anonymous user to sign in instead of Account', async () => {
        // Given an anonymous session
        await Onyx.set(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS});
        renderBar(NAVIGATION_TABS.INBOX);
        await waitForBatchedUpdatesWithAct();

        // When the Account row is pressed
        fireEvent.press(getRow('Account, My settings'));

        // Then the press goes through interceptAnonymousUser, as the icon bar's avatar does, so Account is never opened
        expect(signOutAndRedirectToSignIn).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});
