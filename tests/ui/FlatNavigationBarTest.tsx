import {cleanup, fireEvent, render, screen, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
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
let mockEnabledBetas: string[] = [];
let mockInboxIndicator = NO_INDICATOR;
let mockWorkspacesIndicator = NO_INDICATOR;

jest.mock('@components/Navigation/NavigationTabBar/useWideInboxNavigation', () => () => mockNavigateToInbox);
jest.mock('@components/Navigation/NavigationTabBar/useSearchTabNavigation', () => () => mockNavigateToSearch);
jest.mock('@components/Navigation/NavigationTabBar/useInsightsTabNavigation', () => () => mockNavigateToInsights);
jest.mock('@hooks/useRestoreWorkspacesTabOnNavigate', () => () => mockNavigateToWorkspaces);
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: (beta: string) => mockEnabledBetas.includes(beta)}));
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

function renderBar(selectedTab: ValueOf<typeof NAVIGATION_TABS>) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
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
        mockEnabledBetas = [CONST.BETAS.FLAT_NAV, CONST.BETAS.INSIGHTS_PAGE];
        mockInboxIndicator = NO_INDICATOR;
        mockWorkspacesIndicator = NO_INDICATOR;
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, email: 'user@example.com'});
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

    it('hides the Insights row without the Insights beta', async () => {
        // Given a user on the flatNav beta but not on the Insights beta
        mockEnabledBetas = [CONST.BETAS.FLAT_NAV];

        // When the bar renders
        renderBar(NAVIGATION_TABS.HOME);
        await waitForBatchedUpdatesWithAct();

        // Then Insights is missing, as it is from the icon bar today, while the other rows stay
        expect(screen.queryByRole(CONST.ROLE.TAB, {name: 'Insights'})).not.toBeOnTheScreen();
        expect(getRow('Spend')).toBeOnTheScreen();
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
