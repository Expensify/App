import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';
import cleanupAndNavigateAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate';

import useInvoiceSubmission from '@pages/iou/request/step/confirmation/submission/useInvoiceSubmission';

import {sendInvoice} from '@userActions/IOU/SendInvoice';
import type * as SendInvoice from '@userActions/IOU/SendInvoice';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import {buildChatReport, buildTransaction, CURRENT_USER_PERSONAL_DETAILS, DRAFT_ID, renderAndSubmit, REPORT_ID, TRANSACTION_ID} from '../../utils/expenseSubmissionTestUtils';

jest.mock('@userActions/IOU/SendInvoice', () => ({
    ...jest.requireActual<typeof SendInvoice>('@userActions/IOU/SendInvoice'),
    sendInvoice: jest.fn(),
}));
jest.mock('@libs/Navigation/helpers/cleanupAfterExpenseCreate', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate', () => ({__esModule: true, default: jest.fn()}));

const mockSendInvoiceAction = jest.mocked(sendInvoice);
const mockCleanupAfterExpenseCreate = jest.mocked(cleanupAfterExpenseCreate);
const mockCleanupAndNavigateAfterExpenseCreate = jest.mocked(cleanupAndNavigateAfterExpenseCreate);

type UseInvoiceSubmissionParams = Parameters<typeof useInvoiceSubmission>[0];

// Differs from the chat's own ID, so the tests can tell which one the hook navigated to
const ROUTE_REPORT_ID = 'route-report';

function buildParams(): UseInvoiceSubmissionParams {
    return {
        transaction: buildTransaction(),
        receiptFiles: {},
        report: buildChatReport(),
        reportID: ROUTE_REPORT_ID,
        policy: createMock<Policy>({id: 'policy-1'}),
        policyCategories: {},
        currentUserPersonalDetails: CURRENT_USER_PERSONAL_DETAILS,
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

    it('cleans up and navigates to the invoice chat when shouldHandleNavigation=true', async () => {
        // Given an invoice sent from a chat that already exists, while the route still carries a different report ID

        // When it is submitted and the hook owns the navigation
        await renderAndSubmit(() => useInvoiceSubmission(buildParams()), true);

        // Then the navigation is told it is an invoice and lands on the chat the invoice was sent in
        expect(mockSendInvoiceAction).toHaveBeenCalledTimes(1);
        expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                isInvoice: true,
                optimisticChatReportID: REPORT_ID,
                transactionID: TRANSACTION_ID,
            }),
        );
    });

    it('only cleans up when shouldHandleNavigation=false, because the orchestrator already navigated', async () => {
        // Given an invoice sent from a chat that already exists, whose destination the orchestrator already revealed

        // When it is submitted after the orchestrator navigated away
        await renderAndSubmit(() => useInvoiceSubmission(buildParams()), false);

        // Then the drafts are cleaned up without navigating a second time
        expect(mockSendInvoiceAction).toHaveBeenCalledTimes(1);
        expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledTimes(1);
        expect(mockCleanupAndNavigateAfterExpenseCreate).not.toHaveBeenCalled();
    });
});
