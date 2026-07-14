import {renderHook} from '@testing-library/react-native';

import usePreviewMessageAnimation from '@components/ReportActionItem/MoneyRequestReportPreview/usePreviewMessageAnimation';

import {getDisplayNameForParticipant} from '@libs/ReportUtils';

import type {Report} from '@src/types/onyx';

const mockTranslate = jest.fn((path: string) => path);
const mockFormatPhoneNumber = jest.fn((value: string) => value);

jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate, formatPhoneNumber: mockFormatPhoneNumber}));

jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        __esModule: true,
        getDisplayNameForParticipant: jest.fn(() => 'SPY_NAME'),
    };
});

const mockGetDisplayNameForParticipant = jest.mocked(getDisplayNameForParticipant);

const MANAGER_ID = 424242;
const CHAT_OWNER_ID = 515151;

const baseParams = {
    isScanning: false,
    numberOfPendingRequests: 0,
    numberOfRequests: 2,
    shouldShowRTERViolationMessage: false,
    isPolicyExpenseChat: false,
    isTripRoom: false,
    isInvoiceRoom: false,
    isApproved: false,
    iouSettled: false,
    iouReport: undefined,
    hasNonReimbursableTransactions: false,
    totalDisplaySpend: 100,
    chatReport: undefined,
    policy: undefined,
    invoiceReceiverPolicy: undefined,
    invoiceReceiverPersonalDetail: null,
    managerID: MANAGER_ID,
    isPaidAnimationRunning: false,
    isApprovedAnimationRunning: false,
    isSubmittingAnimationRunning: false,
};

describe('usePreviewMessageAnimation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('threads the translate function from useLocalize into the manager display name resolution', () => {
        const {result} = renderHook(() => usePreviewMessageAnimation(baseParams));

        // The hook resolves the payer/approver name via getDisplayNameForParticipant, which must receive the translate from useLocalize.
        expect(mockGetDisplayNameForParticipant).toHaveBeenCalledWith(expect.objectContaining({accountID: MANAGER_ID, shouldUseShortForm: true, translate: mockTranslate}));
        expect(result.current.previewMessageStyle).toBeDefined();
    });

    it('threads the translate function when resolving the chat owner name for non-reimbursable transactions', () => {
        const chatReport = {reportID: 'preview-chat', ownerAccountID: CHAT_OWNER_ID} as Report;

        renderHook(() => usePreviewMessageAnimation({...baseParams, hasNonReimbursableTransactions: true, chatReport}));

        // The payerSpent branch re-resolves the name from the chat owner, and it must also receive the translate from useLocalize.
        expect(mockGetDisplayNameForParticipant).toHaveBeenCalledWith(expect.objectContaining({accountID: CHAT_OWNER_ID, shouldUseShortForm: true, translate: mockTranslate}));
    });
});
