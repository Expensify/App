import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type {MenuItemProps} from '@components/MenuItem';
import MoneyRequestConfirmationListFooter from '@components/MoneyRequestConfirmationListFooter';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';

import {transactionR14932 as mockTransaction} from '../../__mocks__/reportData/transactions';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => 'activeRoute'),
}));

jest.mock('@components/MenuItemWithTopDescription', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View, Text} = require('react-native');
    return (props: MenuItemProps) => (
        <View
            testID={`menu-item-${props.description}`}
            accessibilityLabel={props.description}
            onPress={props.onPress}
            accessibilityState={{disabled: !props.interactive}}
        >
            <Text>{props.description}</Text>
            <Text>{props.title}</Text>
        </View>
    );
});

jest.mock('@libs/Navigation/navigationRef', () => ({
    getCurrentRoute: jest.fn(() => ({
        name: 'Money_Request_Step_Confirmation',
        params: {},
    })),
    getState: jest.fn(() => ({})),
}));

jest.mock('@libs/Navigation/Navigation', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Money_Request_Step_Confirmation',
            params: {},
        })),
        getState: jest.fn(() => ({})),
    };
    return {
        navigate: jest.fn(),
        getActiveRouteWithoutParams: jest.fn(() => ''),
        isNavigationReady: jest.fn(() => Promise.resolve()),
        goBack: jest.fn(),
        navigationRef: mockRef,
    };
});

const FAKE_REPORT_ID = '1';
const FAKE_REPORT_ID_2 = '2';
const FAKE_POLICY_ID = '1';
const FAKE_ACCOUNT_ID = 1;

const FAKE_UNREPORTED_REPORT_ID = CONST.REPORT.UNREPORTED_REPORT_ID;

const renderMoneyRequestConfirmationListFooter = async (transaction: Transaction) => {
    // The footer's sections + fields self-resolve the transaction from Onyx; seed it so they receive the value the test sets up.
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
    });
    const defaultProps = {
        action: CONST.IOU.ACTION.CREATE,
        iouType: CONST.IOU.TYPE.TRACK,
        transactionID: transaction.transactionID,
        reportID: '123',
        reportActionID: '',
        isScanRequest: false,
        policyID: FAKE_POLICY_ID,
        policy: createRandomPolicy(Number(FAKE_POLICY_ID), CONST.POLICY.TYPE.TEAM),
        policyTags: {},
        selectedParticipants: [
            {
                policyID: FAKE_POLICY_ID,
                ownerAccountID: FAKE_ACCOUNT_ID,
            },
        ],
        isReadOnly: false,
        didConfirm: false,
        isPolicyExpenseChat: true,
        expenseMode: {isDistance: false, isTime: false, isInvoice: false, isPerDiem: false},
        distanceFlags: {isManualDistanceRequest: false, isOdometerDistanceRequest: false, isGPSDistanceRequest: false},
        distanceData: {
            distance: 0,
            hasRoute: false,
            unit: undefined,
            rate: undefined,
            distanceRateName: undefined,
            distanceRateCurrency: 'USD',
            mileageRate: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, currency: 'USD'},
            expenseDate: undefined,
            customUnitRateID: undefined,
        },
        amountDisplay: {amount: 10000, formattedAmount: '100', formattedAmountPerAttendee: '50'},
        requiredFlags: {isCategoryRequired: false, isMerchantRequired: false, isDescriptionRequired: false},
        visibilityFlags: {
            shouldShowSmartScanFields: false,
            shouldShowAmountField: true,
            shouldShowMerchant: false,
            shouldShowCategories: false,
            shouldShowTax: false,
            isParticipantPickerVisible: false,
        },
        errorState: {shouldDisplayFieldError: false, formError: '', clearFormErrors: jest.fn(), setFormError: jest.fn()},
        receiptOptions: {
            receiptFilename: '',
            receiptPath: '',
            shouldDisplayReceipt: false,
            isReceiptEditable: false,
        },
        compactControls: {showMoreFields: false, setShowMoreFields: jest.fn()},
    };
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <ScreenWrapper testID="MoneyRequestConfirmationListFooter">
                <MoneyRequestConfirmationListFooter {...defaultProps} />
            </ScreenWrapper>
        </ComposeProviders>,
    );
};

describe('MoneyRequestConfirmationListFooter', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });

        initOnyxDerivedValues();
        return waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
        return waitForBatchedUpdatesWithAct();
    });
    it('should allow editing report field when there are at least 2 outstanding reports and creating from policy chat', async () => {
        const mockTransactionReport: Transaction = {
            ...mockTransaction,
            isFromGlobalCreate: false,
            reportID: FAKE_REPORT_ID,
        };

        await act(async () => {
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}` as const]: createRandomPolicy(Number(FAKE_POLICY_ID), CONST.POLICY.TYPE.TEAM),
                [`${ONYXKEYS.COLLECTION.REPORT}${FAKE_REPORT_ID}` as const]: {
                    reportID: FAKE_REPORT_ID,
                    reportName: 'Expense Report',
                    ownerAccountID: FAKE_ACCOUNT_ID,
                    policyID: FAKE_POLICY_ID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                },
                [`${ONYXKEYS.COLLECTION.REPORT}${FAKE_REPORT_ID_2}` as const]: {
                    reportID: FAKE_REPORT_ID_2,
                    reportName: 'Expense Report 2',
                    ownerAccountID: FAKE_ACCOUNT_ID,
                    policyID: FAKE_POLICY_ID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                },
            });
        });
        initOnyxDerivedValues();

        await renderMoneyRequestConfirmationListFooter(mockTransactionReport);

        await waitForBatchedUpdatesWithAct();

        const reportItem = screen.getByTestId('menu-item-Report');
        const accessibilityState = reportItem.props.accessibilityState as {disabled: boolean};
        expect(accessibilityState.disabled).toBe(false);
    });

    it('should disable report field when there is only 1 outstanding report and creating from policy chat', async () => {
        const mockTransactionReport: Transaction = {
            ...mockTransaction,
            isFromGlobalCreate: false,
            reportID: FAKE_REPORT_ID,
        };

        await act(async () => {
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}` as const]: createRandomPolicy(Number(FAKE_POLICY_ID), CONST.POLICY.TYPE.TEAM),
                [`${ONYXKEYS.COLLECTION.REPORT}${FAKE_REPORT_ID}` as const]: {
                    reportID: FAKE_REPORT_ID,
                    reportName: 'Expense Report',
                    ownerAccountID: FAKE_ACCOUNT_ID,
                    policyID: FAKE_POLICY_ID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                },
            });
        });
        initOnyxDerivedValues();

        await renderMoneyRequestConfirmationListFooter(mockTransactionReport);

        await waitForBatchedUpdatesWithAct();

        const reportItem = screen.getByTestId('menu-item-Report');
        const accessibilityState = reportItem.props.accessibilityState as {disabled: boolean};
        expect(accessibilityState.disabled).toBe(true);
    });

    it('should disable report field when there are no reports available', async () => {
        const mockTransactionReport: Transaction = {
            ...mockTransaction,
            isFromGlobalCreate: false,
            reportID: FAKE_REPORT_ID,
        };

        await act(async () => {
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}` as const]: createRandomPolicy(Number(FAKE_POLICY_ID), CONST.POLICY.TYPE.TEAM),
            });
        });
        initOnyxDerivedValues();

        await renderMoneyRequestConfirmationListFooter(mockTransactionReport);

        await waitForBatchedUpdatesWithAct();

        const reportItem = screen.getByTestId('menu-item-Report');
        const accessibilityState = reportItem.props.accessibilityState as {disabled: boolean};
        expect(accessibilityState.disabled).toBe(true);
    });

    it('should disable report field when transaction has reportID and creating from FAB with only 1 outstanding report', async () => {
        const mockTransactionReport: Transaction = {
            ...mockTransaction,
            isFromGlobalCreate: true,
            reportID: FAKE_REPORT_ID,
        };

        await act(async () => {
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}` as const]: createRandomPolicy(Number(FAKE_POLICY_ID), CONST.POLICY.TYPE.TEAM),
                [`${ONYXKEYS.COLLECTION.REPORT}${FAKE_REPORT_ID}` as const]: {
                    reportID: FAKE_REPORT_ID,
                    reportName: 'Expense Report',
                    ownerAccountID: FAKE_ACCOUNT_ID,
                    policyID: FAKE_POLICY_ID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                },
            });
        });
        initOnyxDerivedValues();

        await renderMoneyRequestConfirmationListFooter(mockTransactionReport);

        await waitForBatchedUpdatesWithAct();

        const reportItem = screen.getByTestId('menu-item-Report');
        const accessibilityState = reportItem.props.accessibilityState as {disabled: boolean};
        expect(accessibilityState.disabled).toBe(true);
    });

    it('should allow editing report field when transaction is unReported and creating from FAB with only 1 outstanding report', async () => {
        const mockTransactionReport: Transaction = {
            ...mockTransaction,
            isFromGlobalCreate: true,
            reportID: FAKE_UNREPORTED_REPORT_ID,
        };

        await act(async () => {
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}` as const]: createRandomPolicy(Number(FAKE_POLICY_ID), CONST.POLICY.TYPE.TEAM),
                [`${ONYXKEYS.COLLECTION.REPORT}${FAKE_REPORT_ID}` as const]: {
                    reportID: FAKE_REPORT_ID,
                    reportName: 'Expense Report',
                    ownerAccountID: FAKE_ACCOUNT_ID,
                    policyID: FAKE_POLICY_ID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                },
            });
        });
        initOnyxDerivedValues();

        await renderMoneyRequestConfirmationListFooter(mockTransactionReport);

        await waitForBatchedUpdatesWithAct();

        const reportItem = screen.getByTestId('menu-item-Report');
        const accessibilityState = reportItem.props.accessibilityState as {disabled: boolean};
        expect(accessibilityState.disabled).toBe(false);
    });
});
