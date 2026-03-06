import * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MoneyRequestReportActionsList from '@components/MoneyRequestReportView/MoneyRequestReportActionsList';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import {SearchContextProvider} from '@components/Search/SearchContext';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, Session, Transaction} from '@src/types/onyx';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const FAKE_REPORT_ID = '100001';
const FAKE_POLICY_ID = 'FAKE_POLICY_001';
const FAKE_ACCOUNT_ID = 15593135;
const FAKE_TRANSACTION_ID = 'FAKE_TXN_001';
const FAKE_EMAIL = 'testuser@example.com';

jest.mock('@react-navigation/native');

jest.mock('@rnmapbox/maps', () => ({
    default: jest.fn(),
    MarkerView: jest.fn(),
    setAccessToken: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    navigationRef: {
        getRootState: jest.fn(() => ({routes: [{name: 'Report'}]})),
        getCurrentRoute: jest.fn(() => ({name: 'Report', params: {}})),
        getState: jest.fn(() => ({})),
    },
    getActiveRoute: jest.fn(() => 'activeRoute'),
}));

jest.mock('@components/MoneyRequestReportView/MoneyRequestReportTransactionList', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return () => <View testID="MockMoneyRequestReportTransactionList" />;
});

jest.mock('@components/HoldOrRejectEducationalModal', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: {onConfirm: () => void}) => (
        <View testID="HoldOrRejectEducationalModal">
            <View
                testID="HoldOrRejectEducationalModal-confirm"
                onTouchEnd={props.onConfirm}
            />
        </View>
    );
});

jest.mock('@components/ButtonWithDropdownMenu', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View, Pressable, Text} = require('react-native');
    return ({options}: {options: Array<{text: string; value: string; onSelected?: () => void}>}) => (
        <View testID="ButtonWithDropdownMenu">
            {options.map((option: {text: string; value: string; onSelected?: () => void}) => (
                <Pressable
                    key={option.value}
                    testID={`dropdown-option-${option.value}`}
                    onPress={() => option.onSelected?.()}
                    accessibilityRole="button"
                >
                    <Text>{option.text}</Text>
                </Pressable>
            ))}
        </View>
    );
});

const mockOriginalRejectOnSelected = jest.fn();
jest.mock('@hooks/useSelectedTransactionsActions', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {default: C} = require('@src/CONST');
    return jest.fn(() => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        options: [
            {
                text: 'Delete',
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                value: C.REPORT.SECONDARY_ACTIONS.DELETE,
                onSelected: jest.fn(),
            },
            {
                text: 'Reject',
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                value: C.REPORT.SECONDARY_ACTIONS.REJECT,
                onSelected: mockOriginalRejectOnSelected,
            },
        ],
        handleDeleteTransactions: jest.fn(),
        handleDeleteTransactionsWithNavigation: jest.fn(),
        isDeleteModalVisible: false,
        showDeleteModal: jest.fn(),
        hideDeleteModal: jest.fn(),
    }));
});

jest.mock('@hooks/useMobileSelectionMode', () => jest.fn(() => true));
jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => jest.fn(() => ({shouldUseNarrowLayout: true})));
jest.mock('@hooks/useFilterSelectedTransactions', () => jest.fn());
jest.mock('@hooks/useLoadReportActions', () => jest.fn(() => ({loadOlderChats: jest.fn(), loadNewerChats: jest.fn()})));
jest.mock('@pages/inbox/report/ReportActionsListItemRenderer', () => jest.fn(() => null));
jest.mock('@hooks/useParentReportAction', () => jest.fn(() => undefined));
jest.mock('@navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn(() => false));

const mockReport: Report = {
    reportID: FAKE_REPORT_ID,
    reportName: 'Test Expense Report',
    chatReportID: '200001',
    ownerAccountID: FAKE_ACCOUNT_ID,
    managerID: FAKE_ACCOUNT_ID,
    policyID: FAKE_POLICY_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    currency: CONST.CURRENCY.USD,
    total: 10000,
    unheldTotal: 10000,
    lastVisibleActionCreated: '2025-01-01 00:00:00',
    permissions: [CONST.REPORT.PERMISSIONS.READ, CONST.REPORT.PERMISSIONS.WRITE],
};

const mockPolicy: Policy = {
    id: FAKE_POLICY_ID,
    name: 'Test Workspace',
    role: CONST.POLICY.ROLE.ADMIN,
    type: CONST.POLICY.TYPE.CORPORATE,
    owner: FAKE_EMAIL,
    ownerAccountID: FAKE_ACCOUNT_ID,
    outputCurrency: CONST.CURRENCY.USD,
    avatarURL: '',
    employeeList: {
        [FAKE_EMAIL]: {
            email: FAKE_EMAIL,
            role: CONST.POLICY.ROLE.ADMIN,
        },
    },
    isPolicyExpenseChatEnabled: true,
} as Policy;

const mockTransaction: Transaction = {
    transactionID: FAKE_TRANSACTION_ID,
    reportID: FAKE_REPORT_ID,
    amount: 10000,
    currency: CONST.CURRENCY.USD,
    merchant: 'Test Merchant',
    created: '2025-01-01',
    status: CONST.TRANSACTION.STATUS.POSTED,
} as Transaction;

const mockReportAction: ReportAction = {
    reportActionID: 'ACTION_001',
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    created: '2025-01-01 00:00:00',
    actorAccountID: FAKE_ACCOUNT_ID,
    message: [{type: 'COMMENT', html: 'expense', text: 'expense'}],
    originalMessage: {
        IOUTransactionID: FAKE_TRANSACTION_ID,
        IOUReportID: FAKE_REPORT_ID,
        type: CONST.IOU.TYPE.CREATE,
        amount: 10000,
        currency: CONST.CURRENCY.USD,
    },
    childReportID: 'CHILD_001',
} as unknown as ReportAction;

const renderComponent = () => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <SearchContextProvider>
                <ScreenWrapper testID="test">
                    <MoneyRequestReportActionsList
                        report={mockReport}
                        policy={mockPolicy}
                        reportActions={[mockReportAction]}
                        transactions={[mockTransaction]}
                        newTransactions={[]}
                        hasNewerActions={false}
                        hasOlderActions={false}
                    />
                </ScreenWrapper>
            </SearchContextProvider>
        </ComposeProviders>,
    );
};

TestHelper.setupApp();
TestHelper.setupGlobalFetchMock();

describe('MoneyRequestReportActionsList - Reject Educational Modal', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        jest.spyOn(NativeNavigation, 'useRoute').mockReturnValue({
            key: 'test-key',
            name: 'Report' as never,
            params: {reportID: FAKE_REPORT_ID},
        });
        jest.spyOn(NativeNavigation, 'useIsFocused').mockReturnValue(true);
        await TestHelper.signInWithTestUser(FAKE_ACCOUNT_ID, FAKE_EMAIL);
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('should show reject educational modal when reject option is selected and explanation has NOT been dismissed', async () => {
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION]: false,
                [`${ONYXKEYS.COLLECTION.REPORT}${FAKE_REPORT_ID}` as const]: mockReport,
                [`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}` as const]: mockPolicy,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${FAKE_TRANSACTION_ID}` as const]: mockTransaction,
                [ONYXKEYS.SESSION]: {accountID: FAKE_ACCOUNT_ID, email: FAKE_EMAIL} as Session,
            });
        });

        renderComponent();
        await waitForBatchedUpdatesWithAct();

        // Modal should not be visible before pressing reject
        expect(screen.queryByTestId('HoldOrRejectEducationalModal')).toBeNull();

        // Press the reject option
        fireEvent.press(screen.getByTestId(`dropdown-option-${CONST.REPORT.SECONDARY_ACTIONS.REJECT}`));
        await waitForBatchedUpdatesWithAct();

        // Modal should now be visible
        expect(screen.getByTestId('HoldOrRejectEducationalModal')).toBeTruthy();
        expect(mockOriginalRejectOnSelected).not.toHaveBeenCalled();
    });

    it('should NOT show reject educational modal when explanation HAS been dismissed', async () => {
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION]: true,
                [`${ONYXKEYS.COLLECTION.REPORT}${FAKE_REPORT_ID}` as const]: mockReport,
                [`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}` as const]: mockPolicy,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${FAKE_TRANSACTION_ID}` as const]: mockTransaction,
                [ONYXKEYS.SESSION]: {accountID: FAKE_ACCOUNT_ID, email: FAKE_EMAIL} as Session,
            });
        });

        renderComponent();
        await waitForBatchedUpdatesWithAct();

        // Press the reject option
        fireEvent.press(screen.getByTestId(`dropdown-option-${CONST.REPORT.SECONDARY_ACTIONS.REJECT}`));
        await waitForBatchedUpdatesWithAct();

        // Modal should NOT be shown; original handler should be called directly
        expect(screen.queryByTestId('HoldOrRejectEducationalModal')).toBeNull();
        expect(mockOriginalRejectOnSelected).toHaveBeenCalled();
    });
});
