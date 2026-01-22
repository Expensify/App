import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
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
        goBack: jest.fn(),
        navigationRef: mockRef,
    };
});

const FAKE_REPORT_ID = '1';
const FAKE_REPORT_ID_2 = '2';
const FAKE_POLICY_ID = '1';
const FAKE_ACCOUNT_ID = 1;

const FAKE_UNREPORTED_REPORT_ID = CONST.REPORT.UNREPORTED_REPORT_ID;

const renderMoneyRequestConfirmationListFooter = (transaction: Transaction) => {
    const defaultProps = {
        action: CONST.IOU.ACTION.CREATE,
        currency: 'USD',
        didConfirm: false,
        distance: 0,
        formattedAmount: '100',
        formattedAmountPerAttendee: '50',
        formError: '',
        hasRoute: false,
        iouAttendees: [],
        iouCategory: '',
        iouComment: '',
        iouCreated: new Date().toISOString(),
        iouCurrencyCode: 'USD',
        iouIsBillable: false,
        iouMerchant: '',
        iouType: CONST.IOU.TYPE.TRACK,
        isCategoryRequired: false,
        isDistanceRequest: false,
        isManualDistanceRequest: false,
        isPerDiemRequest: false,
        isMerchantEmpty: false,
        isMerchantRequired: false,
        isPolicyExpenseChat: true,
        isReadOnly: false,
        isTypeInvoice: false,
        policy: createRandomPolicy(Number(FAKE_POLICY_ID), CONST.POLICY.TYPE.TEAM),
        policyTags: {},
        policyTagLists: [],
        rate: undefined,
        receiptFilename: '',
        receiptPath: '',
        reportActionID: '',
        reportID: '123',
        selectedParticipants: [
            {
                policyID: FAKE_POLICY_ID,
                ownerAccountID: FAKE_ACCOUNT_ID,
            },
        ],
        shouldDisplayFieldError: false,
        shouldDisplayReceipt: false,
        shouldShowCategories: false,
        shouldShowMerchant: false,
        shouldShowSmartScanFields: false,
        shouldShowTax: false,
        transaction,
        transactionID: transaction.transactionID,
        unit: undefined,
        iouIsReimbursable: false,
        isReceiptEditable: false,
        isDescriptionRequired: false,
        iouTimeCount: undefined,
        iouTimeRate: undefined,
        isTimeRequest: false,
    };
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <ScreenWrapper testID="MoneyRequestConfirmationListFooter">
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
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

        renderMoneyRequestConfirmationListFooter(mockTransactionReport);

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

        renderMoneyRequestConfirmationListFooter(mockTransactionReport);

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

        renderMoneyRequestConfirmationListFooter(mockTransactionReport);

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

        renderMoneyRequestConfirmationListFooter(mockTransactionReport);

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

        renderMoneyRequestConfirmationListFooter(mockTransactionReport);

        await waitForBatchedUpdatesWithAct();

        const reportItem = screen.getByTestId('menu-item-Report');
        const accessibilityState = reportItem.props.accessibilityState as {disabled: boolean};
        expect(accessibilityState.disabled).toBe(false);
    });
});
