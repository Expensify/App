import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import MoneyRequestView from '@components/ReportActionItem/MoneyRequestView';
import type {MoneyRequestViewCategoryDropdownProps} from '@components/ReportActionItem/MoneyRequestViewCategoryDropdown';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';

import Navigation from '@libs/Navigation/Navigation';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type * as NativeNavigation from '@react-navigation/native';
import type {PartialDeep} from 'type-fest';

import escapeRegExp from 'lodash/escapeRegExp';
import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// The component renders outside a NavigationContainer here, so the screen-bound hook cannot read focus.
jest.mock('@hooks/useScreenBoundDynamicRoute', () => () => (suffix: string) => suffix);

jest.mock('@expensify/react-native-hybrid-app', () => ({
    isHybridApp: jest.fn(() => false),
}));

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
    useRoute: jest.fn(() => ({key: '', name: '', params: {reportID: '1'}})),
}));

// Heavy children that play no part in how the category row opens.
jest.mock('@components/ReportActionItem/MoneyRequestReceiptView', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string}>>>('react-native');
    return () => <RN.View testID="money-request-receipt-view" />;
});
jest.mock('@pages/inbox/report/AnimatedEmptyStateBackground', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string}>>>('react-native');
    return () => <RN.View testID="animated-bg" />;
});
jest.mock('@hooks/useCardFeedsForDisplay', () => jest.fn(() => ({defaultCardFeed: null, cardFeedsByPolicy: {}})));

let mockIsAnchoredDropdownsBetaEnabled = true;
jest.mock('@hooks/usePermissions', () => {
    const {default: ActualCONST} = jest.requireActual<{default: typeof CONST}>('@src/CONST');
    return () => ({
        isBetaEnabled: (beta: string) => beta === ActualCONST.BETAS.ANCHORED_FIELD_DROPDOWNS && mockIsAnchoredDropdownsBetaEnabled,
        isBetaEnabledOrUnknown: () => false,
    });
});

// The list is covered by the MoneyRequestViewCategoryDropdown tests; here only whether the row opens it, and for which expense, matters.
let mockDropdownProps: MoneyRequestViewCategoryDropdownProps | undefined;
jest.mock('@components/ReportActionItem/MoneyRequestViewCategoryDropdown', () => (props: MoneyRequestViewCategoryDropdownProps) => {
    mockDropdownProps = props;
    return null;
});

TestHelper.setupGlobalFetchMock();

/** Matches the accessibility label a compound field row builds from its name, followed by its value when it has one */
const fieldLabel = (name: string) => new RegExp(`^${escapeRegExp(name)}(,|$)`);

const currentUserAccountID = 10;
const currentUserEmail = 'test@test.com';
const policyID = 'policy_mrv_category';
const expenseReportID = 'expense_mrv_category';
const parentReportActionID = 'parent_action_mrv_category';
const transactionID = 'txn_mrv_category';

const SCREEN_WRAPPER_STATUS = {didScreenTransitionEnd: true, shouldUseNarrowLayoutOnWideRHP: false, isSafeAreaTopPaddingApplied: true, isSafeAreaBottomPaddingApplied: true};

const threadReport = {
    ...LHNTestUtils.getFakeReport(),
    parentReportID: expenseReportID,
    parentReportActionID,
};

const renderMoneyRequestView = (policy?: PartialDeep<Policy>) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider]}>
            <ScreenWrapperStatusContext.Provider value={SCREEN_WRAPPER_STATUS}>
                <MoneyRequestView
                    transactionThreadReport={threadReport}
                    parentReportID={expenseReportID}
                    expensePolicy={createMock<Policy>({
                        id: policyID,
                        type: CONST.POLICY.TYPE.TEAM,
                        role: CONST.POLICY.ROLE.ADMIN,
                        name: 'Test Policy',
                        owner: currentUserEmail,
                        outputCurrency: CONST.CURRENCY.USD,
                        areCategoriesEnabled: true,
                        ...policy,
                    })}
                    shouldShowAnimatedBackground={false}
                />
            </ScreenWrapperStatusContext.Provider>
        </ComposeProviders>,
    );

// `MenuItem.Root` drops a press it was handed no event for, so every press here carries one.
const pressCategoryRow = () => fireEvent.press(screen.getByLabelText(fieldLabel('common.category')), {nativeEvent: {}});

describe('MoneyRequestView category row', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        initOnyxDerivedValues();
    });

    beforeEach(async () => {
        mockIsAnchoredDropdownsBetaEnabled = true;
        mockDropdownProps = undefined;
        jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        // The row sits near the top of a tall window, so the pop-over has room below it.
        jest.spyOn(View.prototype, 'measureInWindow').mockImplementation((callback) => {
            callback(16, 100, 300, 60);
        });

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
                areCategoriesEnabled: true,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {
                Travel: {name: 'Travel', enabled: true},
                Meals: {name: 'Meals', enabled: true},
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
                [parentReportActionID]: {
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
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                transactionID,
                reportID: expenseReportID,
                amount: 5000,
                currency: CONST.CURRENCY.USD,
                created: '2025-06-01',
                merchant: 'Coffee Shop',
                category: 'Travel',
                comment: {},
            });
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('opens the category list in place on a saved expense', async () => {
        // Given an editable expense on a workspace with categories, with the anchored dropdowns beta on
        renderMoneyRequestView();
        await waitForBatchedUpdatesWithAct();

        // When the category row is pressed
        expect(await screen.findByLabelText(fieldLabel('common.category'))).toBeOnTheScreen();
        act(() => {
            pressCategoryRow();
        });

        // Then the list opens anchored to the row, for this expense and its thread, rather than on the full page
        await waitFor(() => expect(mockDropdownProps?.isVisible).toBe(true));
        expect(mockDropdownProps?.transaction?.transactionID).toBe(transactionID);
        expect(mockDropdownProps?.transactionThreadReport.reportID).toBe(threadReport.reportID);
        expect(mockDropdownProps?.selectedCategory).toBe('Travel');
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('keeps the full page when the beta is off', async () => {
        // Given the same expense with the anchored dropdowns beta off
        mockIsAnchoredDropdownsBetaEnabled = false;
        renderMoneyRequestView();
        await waitForBatchedUpdatesWithAct();

        // When the category row is pressed
        expect(await screen.findByLabelText(fieldLabel('common.category'))).toBeOnTheScreen();
        act(() => {
            pressCategoryRow();
        });

        // Then it opens the full-page selector, as before
        await waitFor(() => expect(Navigation.navigate).toHaveBeenCalledTimes(1));
        expect(jest.mocked(Navigation.navigate).mock.calls.at(0)?.at(0)).toContain('category');
        expect(mockDropdownProps).toBeUndefined();
    });

    it('keeps the full page when every category is disabled', async () => {
        // Given a workspace whose categories are all disabled, where the full page explains there is nothing to pick
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {
                Travel: {enabled: false},
                Meals: {enabled: false},
            });
        });
        renderMoneyRequestView();
        await waitForBatchedUpdatesWithAct();

        // When the category row is pressed
        expect(await screen.findByLabelText(fieldLabel('common.category'))).toBeOnTheScreen();
        act(() => {
            pressCategoryRow();
        });

        // Then it opens the full page rather than an empty list
        await waitFor(() => expect(Navigation.navigate).toHaveBeenCalledTimes(1));
        expect(mockDropdownProps).toBeUndefined();
    });
});
