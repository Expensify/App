import {act, render} from '@testing-library/react-native';

import SubmitActionButton from '@components/ReportActionItem/MoneyRequestReportPreview/SubmitActionButton';

import useOnyx from '@hooks/useOnyx';

import {isSubmitPolicy} from '@libs/PolicyUtils';
import {hasOnlyPendingCardTransactions, showPendingCardTransactionsBlockModal} from '@libs/TransactionUtils';

import {submitReport} from '@userActions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {UseOnyxResult} from 'react-native-onyx';

import React from 'react';

const TEST_IOU_REPORT_ID = '1001';

const iouReport = {
    reportID: TEST_IOU_REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    policyID: 'policy1',
    ownerAccountID: 2,
} as Report;

function createOnyxResult<T>(value: NonNullable<T> | undefined): UseOnyxResult<T> {
    return [value, {status: 'loaded'}];
}

// Capture the onPress (handleSubmit) handler the button passes to AnimatedSubmitButton so submission can be triggered.
const mockOnPressHolder: {current?: () => void} = {current: undefined};
jest.mock('@components/AnimatedSubmitButton', () => ({
    __esModule: true,
    default: (props: {onPress?: () => void}) => {
        mockOnPressHolder.current = props.onPress;
        return null;
    },
}));

const mockOpenReportSubmitToPopover = jest.fn();
jest.mock('@components/ReportSubmitToPopoverAnchor', () => ({
    __esModule: true,
    ReportSubmitToPopoverAnchor: ({children}: {children: React.ReactNode}) => children,
    useOpenReportSubmitToPopover: () => mockOpenReportSubmitToPopover,
}));

jest.mock('@userActions/IOU/ReportWorkflow', () => ({
    __esModule: true,
    submitReport: jest.fn(),
}));

jest.mock('@userActions/Transaction', () => ({
    __esModule: true,
    markPendingRTERTransactionsAsCash: jest.fn(),
}));

jest.mock('@libs/PolicyUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- partial mock of the real module
    const actual = jest.requireActual('@libs/PolicyUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- spread the real module and override selected exports
    return {
        ...actual,
        __esModule: true,
        hasDynamicExternalWorkflow: jest.fn(() => false),
        isSubmitPolicy: jest.fn(() => false),
    };
});

// Fully mocked (no requireActual): loading the real TransactionUtils barrel pulls in platform-specific modules that
// are unavailable in the jest environment, and the component only uses these three functions.
jest.mock('@libs/TransactionUtils', () => ({
    __esModule: true,
    hasOnlyPendingCardTransactions: jest.fn(() => false),
    hasAnyPendingRTERViolation: jest.fn(() => false),
    showPendingCardTransactionsBlockModal: jest.fn(),
}));

jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- partial mock of the real module
    const actual = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- spread the real module and override selected exports
    return {
        ...actual,
        __esModule: true,
        hasViolations: jest.fn(() => false),
        shouldShowMarkAsDone: jest.fn(() => false),
    };
});

// The RTER confirmation wrapper is exercised by its own tests; here it just proceeds straight to the submission.
jest.mock('@hooks/useConfirmPendingRTERAndProceed', () => ({
    __esModule: true,
    default: jest.fn(() => (proceed: () => void) => proceed()),
}));

// SubmitActionButton reads from context instead of props; these mock-prefixed objects back the mocked slice hooks.
const mockStartSubmittingAnimation = jest.fn();
jest.mock('@components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContext', () => ({
    __esModule: true,
    useReportPreviewData: () => ({iouReportID: TEST_IOU_REPORT_ID}),
    useReportPreviewAnimationState: () => ({isSubmittingAnimationRunning: false}),
    useReportPreviewActions: () => ({stopAnimation: jest.fn(), startSubmittingAnimation: mockStartSubmittingAnimation}),
}));

jest.mock('@hooks/useConfirmModal', () => ({__esModule: true, default: jest.fn(() => ({showConfirmModal: jest.fn()}))}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({__esModule: true, default: jest.fn(() => ({accountID: 1, email: 'submitter@test.com'}))}));
jest.mock('@hooks/usePermissions', () => ({__esModule: true, default: jest.fn(() => ({isBetaEnabled: () => false}))}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: jest.fn(() => ({translate: (key: string) => key}))}));
jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: jest.fn(() => ({isOffline: false}))}));
jest.mock('@hooks/useReportTransactionsCollection', () => ({__esModule: true, default: jest.fn(() => ({}))}));
jest.mock('@hooks/useOnyx', () => jest.fn());

const mockedUseOnyx = jest.mocked(useOnyx);
const mockedSubmitReport = jest.mocked(submitReport);
const mockedIsSubmitPolicy = jest.mocked(isSubmitPolicy);
const mockedHasOnlyPendingCardTransactions = jest.mocked(hasOnlyPendingCardTransactions);
const mockedShowPendingCardTransactionsBlockModal = jest.mocked(showPendingCardTransactionsBlockModal);

describe('SubmitActionButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockOnPressHolder.current = undefined;
        mockedIsSubmitPolicy.mockReturnValue(false);
        mockedHasOnlyPendingCardTransactions.mockReturnValue(false);
        mockedUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${TEST_IOU_REPORT_ID}`) {
                return createOnyxResult<Report>(iouReport);
            }
            return createOnyxResult(undefined);
        });
    });

    it('submits the report with the full expense report and starts the submitting animation', () => {
        render(<SubmitActionButton />);

        act(() => {
            mockOnPressHolder.current?.();
        });

        expect(mockedSubmitReport).toHaveBeenCalledWith(
            expect.objectContaining({
                expenseReport: iouReport,
                onSubmitted: mockStartSubmittingAnimation,
            }),
        );
    });

    it('opens the submit-to popover instead of submitting directly on a submit policy', () => {
        mockedIsSubmitPolicy.mockReturnValue(true);
        render(<SubmitActionButton />);

        act(() => {
            mockOnPressHolder.current?.();
        });

        expect(mockOpenReportSubmitToPopover).toHaveBeenCalled();
        expect(mockedSubmitReport).not.toHaveBeenCalled();
    });

    it('shows the pending card transactions block modal instead of submitting', () => {
        mockedHasOnlyPendingCardTransactions.mockReturnValue(true);
        render(<SubmitActionButton />);

        act(() => {
            mockOnPressHolder.current?.();
        });

        expect(mockedShowPendingCardTransactionsBlockModal).toHaveBeenCalled();
        expect(mockedSubmitReport).not.toHaveBeenCalled();
    });
});
