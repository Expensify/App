import {act, renderHook} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import usePerDiemSubmission from '@pages/iou/request/step/confirmation/submission/usePerDiemSubmission';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, Report, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockSubmitPerDiemExpenseAction = jest.fn<{transactionID: string}, unknown[]>();
const mockNavigateAfterExpenseCreate = jest.fn<void, unknown[]>();

jest.mock('@userActions/IOU/PerDiem', () => ({
    submitPerDiemExpense: (...args: unknown[]) => mockSubmitPerDiemExpenseAction(...args),
    submitPerDiemExpenseForSelfDM: jest.fn(),
    hasCompletePerDiemCustomUnit: () => true,
    getPerDiemExpensePolicyID: jest.fn(),
}));

jest.mock('@libs/Navigation/helpers/navigateAfterExpenseCreate', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockNavigateAfterExpenseCreate(...args),
}));

jest.mock('@libs/Navigation/helpers/cleanupAfterExpenseCreate', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: jest.fn((key: string) => key), toLocaleDigit: jest.fn((digit: string) => digit)}),
}));

jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: () => false, isBetaEnabledOrUnknown: () => false}),
}));

jest.mock('@hooks/useReportTransactions', () => ({
    __esModule: true,
    default: () => [],
}));

jest.mock('@libs/telemetry/markSubmitExpenseEnd', () => ({
    __esModule: true,
    default: jest.fn(),
}));

const CHAT_REPORT_ID = 'chat-1';
const TRANSACTION_ID = 'transaction-1';

const workspaceChat = {reportID: CHAT_REPORT_ID, type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT} as Report;
const workspaceChatParticipant = {accountID: CONST.DEFAULT_NUMBER_ID, reportID: CHAT_REPORT_ID, isPolicyExpenseChat: true, selected: true};
const perDiemTransaction = {
    transactionID: TRANSACTION_ID,
    reportID: CHAT_REPORT_ID,
    amount: 200,
    currency: 'USD',
    merchant: 'Per diem',
    created: '2026-04-24',
    comment: {
        comment: 'Trip per diem',
        customUnit: {
            customUnitID: 'per-diem-custom-unit',
            customUnitRateID: 'per-diem-rate',
            name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
            subRates: [{id: 'sub-rate-1', name: 'Meals', quantity: 1, rate: 200}],
            attributes: {dates: {start: '2026-04-24', end: '2026-04-24'}},
        },
    },
} as Transaction;

async function submitPerDiem(report: Report, {shouldHandleNavigation}: {shouldHandleNavigation: boolean}) {
    mockSubmitPerDiemExpenseAction.mockReturnValueOnce({transactionID: TRANSACTION_ID});
    const {result} = renderHook(() =>
        usePerDiemSubmission({
            transaction: perDiemTransaction,
            report,
            reportDrafts: {[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${CHAT_REPORT_ID}`]: workspaceChat},
            policy: createMock<Policy>({id: 'policy-1'}),
            policyCategories: {} as PolicyCategories,
            personalDetails: {},
            currentUserPersonalDetails: {accountID: 1, login: 'me@test.com', email: 'me@test.com'},
            selectedParticipants: [workspaceChatParticipant],
            isTrackExpense: false,
            isSelfDMDestination: false,
        }),
    );
    await waitForBatchedUpdatesWithAct();

    await act(async () => {
        result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation});
    });
    await waitForBatchedUpdatesWithAct();
}

describe('usePerDiemSubmission chat preview flag', () => {
    let getTopmostReportIdSpy: jest.SpyInstance;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    // A submission into an expense report reads the top report, and no navigator is mounted here.
    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        getTopmostReportIdSpy = jest.spyOn(Navigation, 'getTopmostReportId').mockReturnValue(undefined);
    });

    afterEach(() => {
        getTopmostReportIdSpy.mockRestore();
    });

    it('flags the new per diem expense for the chat preview when it is submitted to the chat', async () => {
        // Given a per diem expense submitted from the workspace chat
        // When the submission finishes and this hook handles the navigation
        await submitPerDiem(workspaceChat, {shouldHandleNavigation: true});

        // Then the chat preview is asked to highlight it, since the user lands on that chat
        expect(mockNavigateAfterExpenseCreate).toHaveBeenCalledWith(expect.objectContaining({activeReportID: CHAT_REPORT_ID, shouldFlagNewTransactionForChatPreview: true}));
    });

    it('does not flag the chat preview when the per diem expense is submitted into an expense report', async () => {
        // Given a per diem expense submitted from inside an expense report of that chat
        const expenseReport = {reportID: 'expense-1', type: CONST.REPORT.TYPE.EXPENSE, chatReportID: CHAT_REPORT_ID} as Report;

        // When the submission finishes
        await submitPerDiem(expenseReport, {shouldHandleNavigation: true});

        // Then the chat preview is not flagged, since the user stays on the report, whose table highlights the expense instead
        expect(mockNavigateAfterExpenseCreate).toHaveBeenCalledWith(expect.objectContaining({activeReportID: 'expense-1', shouldFlagNewTransactionForChatPreview: false}));
    });

    it('does not flag the chat preview when the navigation was already handled before the submission', async () => {
        // Given a per diem expense submitted to the workspace chat, after the caller already navigated away
        // When the submission finishes without this hook handling the navigation
        await submitPerDiem(workspaceChat, {shouldHandleNavigation: false});

        // Then the chat preview is not flagged by this hook
        expect(mockNavigateAfterExpenseCreate).toHaveBeenCalledWith(expect.objectContaining({activeReportID: CHAT_REPORT_ID, shouldFlagNewTransactionForChatPreview: false}));
    });
});
