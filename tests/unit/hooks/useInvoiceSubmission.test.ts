import {act, renderHook} from '@testing-library/react-native';

import useInvoiceSubmission from '@pages/iou/request/step/confirmation/submission/useInvoiceSubmission';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, Report, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockSendInvoiceAction = jest.fn();
const mockCleanupAfterExpenseCreate = jest.fn();
const mockCleanupAndNavigateAfterExpenseCreate = jest.fn();

jest.mock('@userActions/IOU/SendInvoice', () => ({
    sendInvoice: (...args: unknown[]) => mockSendInvoiceAction(...args),
    getReceiverType: jest.fn(),
}));

jest.mock('@libs/Navigation/helpers/cleanupAfterExpenseCreate', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockCleanupAfterExpenseCreate(...args),
}));

jest.mock('@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockCleanupAndNavigateAfterExpenseCreate(...args),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: jest.fn((key: string) => key), formatPhoneNumber: jest.fn((phoneNumber: string) => phoneNumber)}),
}));

jest.mock('@hooks/useParticipantsInvoiceReport', () => ({
    __esModule: true,
    default: () => undefined,
}));

jest.mock('@libs/telemetry/markSubmitExpenseEnd', () => ({
    __esModule: true,
    default: jest.fn(),
}));

const REPORT_ID = 'chat-1';
const TRANSACTION_ID = 'transaction-1';
const DRAFT_ID = 'draft-1';

function buildParams(): Parameters<typeof useInvoiceSubmission>[0] {
    return {
        transaction: createMock<Transaction>({transactionID: TRANSACTION_ID, reportID: REPORT_ID, amount: 100, currency: 'USD'}),
        receiptFiles: {},
        report: createMock<Report>({reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT}),
        reportID: REPORT_ID,
        policy: createMock<Policy>({id: 'policy-1'}),
        policyCategories: {} as PolicyCategories,
        currentUserPersonalDetails: {accountID: 1, login: 'me@test.com', email: 'me@test.com'},
        action: CONST.IOU.ACTION.CREATE,
        draftTransactionIDs: [DRAFT_ID],
    };
}

describe('useInvoiceSubmission', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it('calls cleanupAndNavigateAfterExpenseCreate with isInvoice when shouldHandleNavigation=true', async () => {
        // Given an invoice confirmed on an existing chat report
        const {result} = renderHook(() => useInvoiceSubmission(buildParams()));
        await waitForBatchedUpdatesWithAct();

        // When the invoice is submitted and the hook owns the post-submit navigation
        await act(async () => {
            result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation: true});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the invoice is sent and the user is navigated to the invoice chat
        expect(mockSendInvoiceAction).toHaveBeenCalledTimes(1);
        expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                isInvoice: true,
                optimisticChatReportID: REPORT_ID,
                transactionID: TRANSACTION_ID,
            }),
        );
    });

    it('calls cleanupAfterExpenseCreate and skips cleanupAndNavigateAfterExpenseCreate when shouldHandleNavigation=false', async () => {
        // Given an invoice confirmed on an existing chat report
        const {result} = renderHook(() => useInvoiceSubmission(buildParams()));
        await waitForBatchedUpdatesWithAct();

        // When the invoice is submitted while the orchestrator owns the navigation
        await act(async () => {
            result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation: false});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the drafts are cleaned up without navigating, leaving navigation to the orchestrator
        expect(mockSendInvoiceAction).toHaveBeenCalledTimes(1);
        expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledTimes(1);
        expect(mockCleanupAndNavigateAfterExpenseCreate).not.toHaveBeenCalled();
    });
});
