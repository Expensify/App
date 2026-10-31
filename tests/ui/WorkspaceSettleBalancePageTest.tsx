import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import WorkspaceSettleBalancePage from '@pages/workspace/expensifyCard/WorkspaceSettleBalancePage';

import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@src/libs/API/types';
import Navigation from '@src/libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import React from 'react';
import Onyx from 'react-native-onyx';

import currencyList from '../unit/currencyList.json';
import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// These values MUST match the literals used in jest.mock() below, because jest.mock() is hoisted before variable declarations are evaluated
const POLICY_ID = 'policy123';
const WORKSPACE_ACCOUNT_ID = 424242;
const NOT_FOUND_TEXT = 'Mocked not found page';

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useIsFocused: () => true,
        useRoute: () => ({
            key: 'test-route',
            name: 'Workspace_ExpensifyCard_Settle_Balance',
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

// Stand in for the real access gate so the test can see whether the page blocks itself
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const ReactMock = require('react') as typeof React;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const {Text} = require('react-native') as {Text: React.ComponentType<{children?: React.ReactNode}>};

    return ({children, shouldBeBlocked}: {children: React.ReactNode; shouldBeBlocked?: boolean}) =>
        shouldBeBlocked ? ReactMock.createElement(Text, null, 'Mocked not found page') : children; // Must match NOT_FOUND_TEXT
});

const cardSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${WORKSPACE_ACCOUNT_ID}` as const;
const manualBillingKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_MANUAL_BILLING}${WORKSPACE_ACCOUNT_ID}` as const;
const programKey = CONST.COUNTRY.US;

const route: PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTLE_BALANCE>['route'] = {
    key: 'workspace-expensify-card-settle-balance',
    name: SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTLE_BALANCE,
    params: {policyID: POLICY_ID},
};
// The screen does not read navigation. This inert test double only satisfies the navigator-provided prop.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const navigation = {} as PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTLE_BALANCE>['navigation'];

const renderPage = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <WorkspaceSettleBalancePage
                route={route}
                navigation={navigation}
            />
        </ComposeProviders>,
    );

// A workspace on monthly settlement with $17.00 outstanding
const monthlyCardSettings = {[programKey]: {monthlySettlementDate: 10, currentBalance: 1700, currency: 'USD'}};

OnyxUpdateManager();
describe('WorkspaceSettleBalancePage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    const mockFetch = TestHelper.setupGlobalFetchMock();

    beforeEach(async () => {
        mockFetch.succeed();
        await act(async () => {
            await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
            await waitForBatchedUpdatesWithAct();
        });
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('offers the full balance by default and moves straight to the confirmation', async () => {
        // Given a workspace on monthly settlement
        await act(async () => {
            await Onyx.merge(cardSettingsKey, monthlyCardSettings);
            await waitForBatchedUpdatesWithAct();
        });

        // When the page opens and Next is pressed without touching anything
        renderPage();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('Settle current balance')).toBeTruthy();
        expect(screen.queryByText('Amount to settle')).toBeNull();
        fireEvent.press(screen.getByText('Next'));
        await waitForBatchedUpdatesWithAct();

        // Then the full balance is what the confirmation page will show, and no request was needed to get there
        await expect(getOnyxValue(ONYXKEYS.RAM_ONLY_EXPENSIFY_CARD_SETTLEMENT_PREVIEW)).resolves.toEqual({settlementType: CONST.EXPENSIFY_CARD.SETTLEMENT_TYPE.FULL});
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTLE_BALANCE_CONFIRMATION.getRoute(POLICY_ID));
    });

    it('reveals the amount input for a partial settlement and refuses an amount above the balance', async () => {
        // Given a workspace on monthly settlement with $17.00 outstanding
        await act(async () => {
            await Onyx.merge(cardSettingsKey, monthlyCardSettings);
            await waitForBatchedUpdatesWithAct();
        });
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When partial is picked, which reveals the amount input, and more than the balance is entered
        fireEvent.press(screen.getByText('Settle partial balance'));
        await waitForBatchedUpdatesWithAct();
        const amountInput = screen.getByLabelText('Amount to settle');
        fireEvent.changeText(amountInput, '50');
        fireEvent.press(screen.getByText('Next'));
        await waitForBatchedUpdatesWithAct();

        // Then the admin is told how much can be settled and the backend is not asked for a preview
        expect(screen.getByText('Enter an amount up to $17.00')).toBeTruthy();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('drops the backend maximum error once the amount is changed', async () => {
        // Given a workspace on monthly settlement whose backend can settle less than the balance shown
        await act(async () => {
            await Onyx.merge(cardSettingsKey, monthlyCardSettings);
            await waitForBatchedUpdatesWithAct();
        });
        mockFetch.mockAPICommand(SIDE_EFFECT_REQUEST_COMMANDS.CALCULATE_EXPENSIFY_CARD_PARTIAL_SETTLEMENT, () => ({
            jsonCode: CONST.JSON_CODE.SUCCESS,
            requestedAmount: 1500,
            roundedAmount: 0,
            maximumAmount: 1200,
            transactionCount: 0,
            isAboveMaximum: true,
            isEverythingEligible: false,
        }));
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When a partial amount within the balance is previewed and the backend answers with a lower maximum
        fireEvent.press(screen.getByText('Settle partial balance'));
        await waitForBatchedUpdatesWithAct();
        const amountInput = screen.getByLabelText('Amount to settle');
        fireEvent.changeText(amountInput, '15');
        fireEvent.press(screen.getByText('Next'));
        await waitForBatchedUpdatesWithAct();

        // Then the backend maximum is shown under the amount
        expect(screen.getByText('Enter an amount up to $12.00')).toBeTruthy();
        expect(Navigation.navigate).not.toHaveBeenCalled();

        // When the amount is cleared and Next is pressed again
        fireEvent.changeText(amountInput, '');
        fireEvent.press(screen.getByText('Next'));
        await waitForBatchedUpdatesWithAct();

        // Then only the required-field error is left, the maximum answered for the old amount is gone
        expect(screen.getByText('This field is required')).toBeTruthy();
        expect(screen.queryByText('Enter an amount up to $12.00')).toBeNull();
    });

    it('does not let a partial settlement be previewed offline, since the rounded amount comes from the backend', async () => {
        // Given an admin who is offline on a workspace on monthly settlement
        await act(async () => {
            await Onyx.merge(cardSettingsKey, monthlyCardSettings);
            await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
            await waitForBatchedUpdatesWithAct();
        });
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When partial is picked and an amount is entered
        fireEvent.press(screen.getByText('Settle partial balance'));
        await waitForBatchedUpdatesWithAct();
        fireEvent.changeText(screen.getByLabelText('Amount to settle'), '4');
        await waitForBatchedUpdatesWithAct();

        // Then Next stays disabled, as forms do offline, instead of leaving a preview request waiting for the connection
        expect(screen.getByRole('button', {name: 'Next'})).toBeDisabled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('is not available while a settlement is already queued', async () => {
        // Given a workspace with a partial settlement already queued, which cannot be changed until it is processed
        await act(async () => {
            await Onyx.merge(cardSettingsKey, monthlyCardSettings);
            await Onyx.set(manualBillingKey, {type: 'partial', amount: 400, requestedAmount: 350, feedCountry: programKey});
            await waitForBatchedUpdatesWithAct();
        });

        // When the page is opened, for example through its link
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then it blocks itself
        expect(screen.getByText(NOT_FOUND_TEXT)).toBeTruthy();
    });
});
