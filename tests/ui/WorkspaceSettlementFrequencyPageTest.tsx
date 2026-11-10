import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import WorkspaceSettlementFrequencyPage from '@pages/workspace/expensifyCard/WorkspaceSettlementFrequencyPage';

import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Test constants - these values MUST match the literals used in jest.mock() below
// because jest.mock() is hoisted before variable declarations are evaluated
const POLICY_ID = 'policy123';
const WORKSPACE_ACCOUNT_ID = 424242;

// The text the mocked access wrapper renders in place of the page when it blocks it, standing in for the not-found page.
const NOT_FOUND_TEXT = 'Mocked not found page';

// jest.mock() factories are hoisted and run before imports/variables are defined, so they cannot
// reference the constants above. Keep the literals in both places in sync.
jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useIsFocused: () => true,
        useRoute: () => ({
            key: 'test-route',
            name: 'Workspace_ExpensifyCard_Settings_Frequency',
            params: {policyID: 'policy123'}, // Must match POLICY_ID
        }),
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@src/hooks/useResponsiveLayout');

// The default fund ID falls back to the workspace account ID when there is no last-selected feed.
jest.mock('@hooks/useWorkspaceAccountID', () => ({
    __esModule: true,
    default: () => 424242, // Must match WORKSPACE_ACCOUNT_ID
}));

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({didScreenTransitionEnd: true}),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        goBack: jest.fn(),
        navigate: jest.fn(),
        getActiveRoute: jest.fn(() => ''),
        getActiveRouteWithoutParams: jest.fn(() => ''),
        isNavigationReady: jest.fn(() => Promise.resolve()),
        isTopmostRouteModalScreen: jest.fn(() => false),
    },
}));

// Stand in for the real access gate so the test can drive `shouldBeBlocked` directly: the policy access checks it also runs
// are not what this page decides, but whether it blocks itself is.
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const ReactMock = require('react') as typeof React;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const {Text} = require('react-native') as {Text: React.ComponentType<{children?: React.ReactNode}>};

    return ({children, shouldBeBlocked}: {children: React.ReactNode; shouldBeBlocked?: boolean}) =>
        shouldBeBlocked ? ReactMock.createElement(Text, null, 'Mocked not found page') : children; // Must match NOT_FOUND_TEXT
});

const cardSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${WORKSPACE_ACCOUNT_ID}` as const;

// The page resolves its settings through the card program they are nested under, so the test data has to be nested the same way.
const programKey = CONST.EXPENSIFY_CARD.CARD_PROGRAM.CURRENT;

// The day of the month the workspace already settles on, standing in for a frequency set in OldDot.
const existingSettlementDay = 10;

const route: PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS_FREQUENCY>['route'] = {
    key: 'workspace-expensify-card-settings-frequency',
    name: SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS_FREQUENCY,
    params: {policyID: POLICY_ID},
};
// The screen does not read navigation. This inert test double only satisfies the navigator-provided prop.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const navigation = {} as PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS_FREQUENCY>['navigation'];

const renderWorkspaceSettlementFrequencyPage = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <WorkspaceSettlementFrequencyPage
                route={route}
                navigation={navigation}
            />
        </ComposeProviders>,
    );

OnyxUpdateManager();
describe('WorkspaceSettlementFrequencyPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    const mockFetch = TestHelper.setupGlobalFetchMock();

    beforeEach(() => {
        mockFetch.succeed();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('does not block the page when the workspace settles monthly but is no longer eligible for monthly settlement', async () => {
        // Given a workspace put on monthly settlement in OldDot, which bypasses the eligibility gate NewDot applies
        await act(async () => {
            await Onyx.merge(cardSettingsKey, {
                [programKey]: {isMonthlySettlementAllowed: false, monthlySettlementDate: existingSettlementDay},
            });
            await waitForBatchedUpdatesWithAct();
        });

        // When the settlement frequency page is opened
        renderWorkspaceSettlementFrequencyPage();
        await waitForBatchedUpdatesWithAct();

        // Then the page opens on the Daily option rather than the not-found page, because there is still a change to make
        expect(screen.queryByText(NOT_FOUND_TEXT)).toBeNull();
        expect(screen.getByText('Daily')).toBeTruthy();
    });

    it('keeps showing the page after saving Daily, when the optimistic update makes the workspace settle daily', async () => {
        // Given the same workspace: settling monthly, with monthly no longer selectable
        await act(async () => {
            await Onyx.merge(cardSettingsKey, {
                [programKey]: {isMonthlySettlementAllowed: false, monthlySettlementDate: existingSettlementDay},
            });
            await waitForBatchedUpdatesWithAct();
        });

        renderWorkspaceSettlementFrequencyPage();
        await waitForBatchedUpdatesWithAct();

        // When Daily is picked and saved, which optimistically clears `monthlySettlementDate` while the page is still mounted
        fireEvent.press(screen.getByText('Daily'));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Save'));
        await waitForBatchedUpdatesWithAct();

        // Then the page does not block itself over the user's own successful change. Blocking here is what dropped the
        // not-found page on top of the selection and sent the back button to the workspace overview.
        expect(screen.queryByText(NOT_FOUND_TEXT)).toBeNull();
    });

    it('blocks the page when the workspace already settles daily and monthly is not selectable', async () => {
        // Given a workspace that settles daily and cannot switch to monthly, so the page has nothing to offer
        await act(async () => {
            await Onyx.merge(cardSettingsKey, {
                [programKey]: {isMonthlySettlementAllowed: false},
            });
            await waitForBatchedUpdatesWithAct();
        });

        // When the settlement frequency page is opened
        renderWorkspaceSettlementFrequencyPage();
        await waitForBatchedUpdatesWithAct();

        // Then it is still blocked - the fix must not open a page with a single, already-selected option
        expect(screen.getByText(NOT_FOUND_TEXT)).toBeTruthy();
    });
});
