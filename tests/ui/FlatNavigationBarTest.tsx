import {cleanup, fireEvent, render, screen, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import FlatNavigationBar from '@components/Navigation/FlatNavigationBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {signOutAndRedirectToSignIn} from '@libs/actions/Session';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {ValueOf} from 'type-fest';

import React from 'react';
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
jest.mock('@components/Navigation/FlatNavigationBar/FlatNavCreateMenuButtons', () => () => null);
jest.mock('@pages/inbox/sidebar/SupportalSwitcherButton', () => () => null);
jest.mock('@components/Avatar/AccountNavigationAvatar', () => () => null);
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {navigate: jest.fn()},
}));
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

function getRow(name: string | RegExp) {
    return screen.getByRole(CONST.ROLE.TAB, {name});
}

describe('FlatNavigationBar', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockInboxIndicator = NO_INDICATOR;
        mockWorkspacesIndicator = NO_INDICATOR;
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
