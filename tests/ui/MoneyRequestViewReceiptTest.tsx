import {act, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import MoneyRequestView from '@components/ReportActionItem/MoneyRequestView';
import {useWideRHPState} from '@components/WideRHPContextProvider';
import {defaultWideRHPStateContextValue} from '@components/WideRHPContextProvider/default';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type * as NativeNavigation from '@react-navigation/native';

import {useRoute} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn((num: number) => num.toString()),
        toLocaleDigit: jest.fn((digit: string) => digit),
    })),
);

jest.mock('@react-navigation/native', () => ({
    ...((): typeof NativeNavigation => {
        return jest.requireActual('@react-navigation/native');
    })(),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
    useIsFocused: jest.fn(() => true),
    useRoute: jest.fn(() => ({key: 'central-report', name: '', params: {reportID: '1'}})),
}));

// `useResponsiveLayout` is mocked to a wide layout so `isSmallScreenWidth` is false; on a narrow layout the
// receipt is always shown, which would mask the wide-RHP scoping the tests below verify.
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

// The receipt visibility is driven by `wideRHPRouteKeys`; control it explicitly per test.
jest.mock('@components/WideRHPContextProvider', () => ({
    ...jest.requireActual<Record<string, unknown>>('@components/WideRHPContextProvider'),
    useWideRHPState: jest.fn(),
}));

// Render the receipt as a lightweight probe so its presence/absence is assertable.
jest.mock('@components/ReportActionItem/MoneyRequestReceiptView', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string}>>>('react-native');
    return () => <RN.View testID="money-request-receipt-view" />;
});

jest.mock('@pages/inbox/report/AnimatedEmptyStateBackground', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string}>>>('react-native');
    return () => <RN.View testID="animated-bg" />;
});

jest.mock('@components/MenuItemWithTopDescription', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string; children?: React.ReactNode}>>>('react-native');
    return ({description}: {description?: string}) => <RN.View testID={`menu-item-${description}`} />;
});

jest.mock('@components/MenuItem', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string; children?: React.ReactNode}>>>('react-native');
    return ({title}: {title?: string}) => <RN.Text testID={`menu-item-simple-${title}`}>{title}</RN.Text>;
});

jest.mock('@hooks/useCardFeedsForDisplay', () => jest.fn(() => ({defaultCardFeed: null, cardFeedsByPolicy: {}})));

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: jest.fn(() => ({
        convertToDisplayString: jest.fn((amountInCents = 0, currency = '') => `${currency}${amountInCents}`),
        getCurrencySymbol: jest.fn((currency = '') => `${currency}`),
        getCurrencyDecimals: jest.fn(() => 2),
        convertToDisplayStringWithoutCurrency: jest.fn((amountInCents = 0) => `${amountInCents}`),
    })),
    useCurrencyListState: jest.fn(() => ({})),
}));

TestHelper.setupGlobalFetchMock();

const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);
const mockedUseWideRHPState = jest.mocked(useWideRHPState);
const mockedUseRoute = jest.mocked(useRoute);

const WIDE_LAYOUT = {
    isLargeScreenWidth: true,
    shouldUseNarrowLayout: false,
    isSmallScreenWidth: false,
    isMediumScreenWidth: false,
    isExtraSmallScreenWidth: false,
    isExtraSmallScreenHeight: false,
    isExtraLargeScreenWidth: true,
    isSmallScreen: false,
    isInNarrowPaneModal: false,
    onboardingIsMediumOrLargerScreenWidth: true,
    isInLandscapeMode: false,
} as ReturnType<typeof useResponsiveLayout>;

const WIDE_RHP_ROUTE_KEY = 'wide-rhp-report';

const currentUserAccountID = 10;
const currentUserEmail = 'test@test.com';
const policyID = 'policy_mrv_receipt_test';
const expenseReportID = 'expense_mrv_receipt_123';
const parentReportActionID = 'parent_action_mrv_receipt';
const transactionID = 'txn_mrv_receipt_test';

const threadReport = {
    ...LHNTestUtils.getFakeReport(),
    parentReportID: expenseReportID,
    parentReportActionID,
};

const expensePolicy: Policy = {
    ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM, 'Test Policy'),
    id: policyID,
    role: CONST.POLICY.ROLE.ADMIN,
    owner: currentUserEmail,
    outputCurrency: CONST.CURRENCY.USD,
    isPolicyExpenseChatEnabled: true,
};

const renderMoneyRequestView = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider]}>
            <MoneyRequestView
                transactionThreadReport={threadReport}
                parentReportID={expenseReportID}
                expensePolicy={expensePolicy}
                shouldShowAnimatedBackground={false}
            />
        </ComposeProviders>,
    );

const setupTestData = async () => {
    const iouReportAction = {
        ...LHNTestUtils.getFakeReportAction(),
        reportActionID: parentReportActionID,
        reportID: expenseReportID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID: currentUserAccountID,
        originalMessage: {
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            IOUTransactionID: transactionID,
            amount: 5000,
            currency: CONST.CURRENCY.USD,
        },
    };

    const transaction = {
        transactionID,
        reportID: expenseReportID,
        amount: 5000,
        currency: CONST.CURRENCY.USD,
        created: '2025-06-01',
        merchant: 'Coffee Shop',
        comment: {},
    };

    await act(async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: currentUserEmail});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [currentUserAccountID]: {accountID: currentUserAccountID, login: currentUserEmail, displayName: 'Test User'},
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
            id: policyID,
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            name: 'Test Policy',
            owner: currentUserEmail,
            outputCurrency: CONST.CURRENCY.USD,
            isPolicyExpenseChatEnabled: true,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, {
            reportID: expenseReportID,
            type: CONST.REPORT.TYPE.EXPENSE,
            policyID,
            ownerAccountID: currentUserAccountID,
            managerID: currentUserAccountID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReportID}`, {
            [parentReportActionID]: iouReportAction,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
    });
    await waitForBatchedUpdatesWithAct();
};

describe('MoneyRequestView receipt visibility with a wide RHP open', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(() => {
        mockedUseResponsiveLayout.mockReturnValue(WIDE_LAYOUT);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('shows the inline receipt on a background report screen while another screen owns the wide RHP', async () => {
        // The bug: a wide RHP registered by another screen hid the receipt on this background view. `route.key` is not
        // in `wideRHPRouteKeys`, so the receipt must stay visible (this assertion fails on the pre-fix global check).
        mockedUseWideRHPState.mockReturnValue({...defaultWideRHPStateContextValue, wideRHPRouteKeys: [WIDE_RHP_ROUTE_KEY]});
        mockedUseRoute.mockReturnValue({key: 'central-report', name: '', params: {reportID: expenseReportID}} as ReturnType<typeof useRoute>);

        await setupTestData();
        renderMoneyRequestView();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('money-request-receipt-view')).toBeOnTheScreen();
        });
    });

    it('hides the inline receipt for the view that owns the wide RHP', async () => {
        // The original intent: the MoneyRequestView inside the wide RHP hides its inline receipt because the wide RHP's
        // left panel shows it. `route.key` matches the registered wide-RHP key.
        mockedUseWideRHPState.mockReturnValue({...defaultWideRHPStateContextValue, wideRHPRouteKeys: [WIDE_RHP_ROUTE_KEY]});
        mockedUseRoute.mockReturnValue({key: WIDE_RHP_ROUTE_KEY, name: '', params: {reportID: expenseReportID}} as ReturnType<typeof useRoute>);

        await setupTestData();
        renderMoneyRequestView();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            // Anchor on an always-rendered field so the absence below reflects the hidden receipt, not an unrendered view.
            expect(screen.getByTestId('menu-item-common.merchant')).toBeOnTheScreen();
            expect(screen.queryByTestId('money-request-receipt-view')).not.toBeOnTheScreen();
        });
    });
});
