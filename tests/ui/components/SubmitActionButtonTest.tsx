import {act, render} from '@testing-library/react-native';

import SubmitActionButton from '@components/ReportActionItem/MoneyRequestReportPreview/SubmitActionButton';

import useOnyx from '@hooks/useOnyx';

import {isSubmitPolicy} from '@libs/PolicyUtils';
import {hasOnlyHeldExpenses, hasViolations, shouldBlockSubmitDueToPreventSelfApproval, shouldBlockSubmitDueToStrictPolicyRules} from '@libs/ReportUtils';
import {
    getTransactionViolations,
    hasAnyPendingRTERViolation,
    hasOnlyPendingCardTransactions,
    showHeldExpensesBlockModal,
    showPendingCardTransactionsBlockModal,
} from '@libs/TransactionUtils';

import {submitReport} from '@userActions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection, UseOnyxResult} from 'react-native-onyx';

import React from 'react';

import createMock from '../../utils/createMock';

const TEST_IOU_REPORT_ID = '1001';
const TEST_TRANSACTION_ID = '3003';
const TEST_ACCOUNT_ID = 1;
const TEST_EMAIL = 'submitter@test.com';

const iouReport = {
    reportID: TEST_IOU_REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    policyID: 'policy1',
    ownerAccountID: 2,
} as Report;

const reportViolations: OnyxCollection<TransactionViolations> = {
    [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TEST_TRANSACTION_ID}`]: [{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION}],
};

const reportTransactions = [createMock<Transaction>({transactionID: TEST_TRANSACTION_ID})];

// Mutable so each test can back the mocked useReportPreviewTransactionViolations slice with a specific value.
let mockTransactionViolations: OnyxCollection<TransactionViolations> = {};

// Mutable so each test can back the mocked useReportPreviewData slice with a specific transaction list.
let mockTransactions: Transaction[] = [];

// Mutable so a test can turn on the domain's "strictly enforce workspace rules" setting without standing up security groups.
let mockAreStrictPolicyRulesEnabled = false;

function createOnyxResult<T>(value: NonNullable<T> | undefined): UseOnyxResult<T> {
    return [value, {status: 'loaded'}];
}

// Capture the props the button passes to AnimatedSubmitButton so submission can be triggered (onPress) and the disabled
// state asserted (isDisabled).
const mockSubmitButtonPropsHolder: {current?: {onPress?: () => void; isDisabled?: boolean}} = {current: undefined};
jest.mock('@components/AnimatedSubmitButton', () => ({
    __esModule: true,
    default: (props: {onPress?: () => void; isDisabled?: boolean}) => {
        mockSubmitButtonPropsHolder.current = props;
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
// are unavailable in the jest environment, and the component only uses the functions listed here.
jest.mock('@libs/TransactionUtils', () => ({
    __esModule: true,
    getTransactionViolations: jest.fn(),
    hasOnlyPendingCardTransactions: jest.fn(() => false),
    hasAnyPendingRTERViolation: jest.fn(() => false),
    showPendingCardTransactionsBlockModal: jest.fn(),
    showHeldExpensesBlockModal: jest.fn(),
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
        hasOnlyHeldExpenses: jest.fn(() => false),
        // These two reach into TransactionUtils (hasViolation / hasNoticeTypeViolation / hasWarningTypeViolation), which
        // is fully mocked below with only the exports this component needs, so the real implementations would blow
        // up as soon as a test supplies transactions. The violation math itself is covered by ReportUtilsTest; what
        // matters here is that the button wires the predicates up to its disabled state and its press handler.
        shouldBlockSubmitDueToStrictPolicyRules: jest.fn(() => false),
        shouldBlockSubmitDueToPreventSelfApproval: jest.fn(() => false),
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
    useReportPreviewData: () => ({iouReportID: TEST_IOU_REPORT_ID, transactions: mockTransactions}),
    useReportPreviewTransactionViolations: () => ({transactionViolations: mockTransactionViolations}),
    useReportPreviewAnimationState: () => ({isSubmittingAnimationRunning: false}),
    useReportPreviewActions: () => ({stopAnimation: jest.fn(), startSubmittingAnimation: mockStartSubmittingAnimation}),
}));

jest.mock('@hooks/useConfirmModal', () => ({__esModule: true, default: jest.fn(() => ({showConfirmModal: jest.fn()}))}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({__esModule: true, default: jest.fn(() => ({accountID: TEST_ACCOUNT_ID, email: TEST_EMAIL}))}));
jest.mock('@hooks/useStrictPolicyRules', () => ({__esModule: true, default: jest.fn(() => ({areStrictPolicyRulesEnabled: mockAreStrictPolicyRulesEnabled}))}));
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
const mockedHasOnlyHeldExpenses = jest.mocked(hasOnlyHeldExpenses);
const mockedShowHeldExpensesBlockModal = jest.mocked(showHeldExpensesBlockModal);
const mockedHasViolations = jest.mocked(hasViolations);
const mockedHasAnyPendingRTERViolation = jest.mocked(hasAnyPendingRTERViolation);
const mockedGetTransactionViolations = jest.mocked(getTransactionViolations);
const mockedShouldBlockSubmitDueToStrictPolicyRules = jest.mocked(shouldBlockSubmitDueToStrictPolicyRules);
const mockedShouldBlockSubmitDueToPreventSelfApproval = jest.mocked(shouldBlockSubmitDueToPreventSelfApproval);

describe('SubmitActionButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSubmitButtonPropsHolder.current = undefined;
        mockTransactionViolations = {};
        mockTransactions = [];
        mockAreStrictPolicyRulesEnabled = false;
        mockedIsSubmitPolicy.mockReturnValue(false);
        mockedHasOnlyPendingCardTransactions.mockReturnValue(false);
        mockedHasOnlyHeldExpenses.mockReturnValue(false);
        mockedHasViolations.mockReturnValue(false);
        // jest.clearAllMocks() only clears recorded calls, so a mockReturnValue set by one test would otherwise leak
        // into every test that runs after it.
        mockedShouldBlockSubmitDueToStrictPolicyRules.mockReturnValue(false);
        mockedShouldBlockSubmitDueToPreventSelfApproval.mockReturnValue(false);
        // Default to nothing-dismissed passthrough so the filtered collection mirrors the raw slice; individual tests
        // override the implementation to simulate dismissals.
        mockedGetTransactionViolations.mockImplementation((transaction, violations) => violations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction?.transactionID}`]);
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
            mockSubmitButtonPropsHolder.current?.onPress?.();
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
            mockSubmitButtonPropsHolder.current?.onPress?.();
        });

        expect(mockOpenReportSubmitToPopover).toHaveBeenCalled();
        expect(mockedSubmitReport).not.toHaveBeenCalled();
    });

    it('shows the pending card transactions block modal instead of submitting', () => {
        mockedHasOnlyPendingCardTransactions.mockReturnValue(true);
        render(<SubmitActionButton />);

        act(() => {
            mockSubmitButtonPropsHolder.current?.onPress?.();
        });

        expect(mockedShowPendingCardTransactionsBlockModal).toHaveBeenCalled();
        expect(mockedSubmitReport).not.toHaveBeenCalled();
    });

    it('shows the held expenses block modal instead of submitting', () => {
        mockedHasOnlyHeldExpenses.mockReturnValue(true);
        render(<SubmitActionButton />);

        act(() => {
            mockSubmitButtonPropsHolder.current?.onPress?.();
        });

        expect(mockedShowHeldExpensesBlockModal).toHaveBeenCalled();
        expect(mockedSubmitReport).not.toHaveBeenCalled();
    });

    it('computes hasViolations from the context violations and forwards the result to submitReport', () => {
        mockTransactionViolations = reportViolations;
        mockedHasViolations.mockReturnValue(true);
        render(<SubmitActionButton />);

        act(() => {
            mockSubmitButtonPropsHolder.current?.onPress?.();
        });

        expect(mockedHasViolations.mock.calls.at(-1)?.[1]).toBe(reportViolations);
        expect(mockedHasAnyPendingRTERViolation.mock.calls.at(-1)?.[1]).toBe(reportViolations);
        expect(mockedSubmitReport).toHaveBeenCalledWith(expect.objectContaining({hasViolations: true}));
    });

    it('disables the button and blocks submission when strict policy rules are enforced on a violating report', () => {
        // Given a domain that strictly enforces workspace rules and a report whose transactions have violations
        mockAreStrictPolicyRulesEnabled = true;
        mockTransactions = reportTransactions;
        mockTransactionViolations = reportViolations;
        mockedShouldBlockSubmitDueToStrictPolicyRules.mockReturnValue(true);

        // When the button renders and onPress is called directly, to confirm the handler no-ops on its own — the
        // disabled prop is the first layer of defense, the early return in the handler is the second
        render(<SubmitActionButton />);

        act(() => {
            mockSubmitButtonPropsHolder.current?.onPress?.();
        });

        // Then nothing reaches the backend, because the backend would reject the submission and the user would be left
        // with the generic "Unexpected error. Please try again later." instead of the violations they need to fix
        expect(mockSubmitButtonPropsHolder.current?.isDisabled).toBe(true);
        expect(mockedSubmitReport).not.toHaveBeenCalled();

        // Then the decision is made from the report preview's own violations and transactions rather than a separate
        // Onyx read, which is what let this button drift out of sync with the report header's submit button
        expect(mockedShouldBlockSubmitDueToStrictPolicyRules).toHaveBeenCalledWith(TEST_IOU_REPORT_ID, reportViolations, true, TEST_ACCOUNT_ID, TEST_EMAIL, reportTransactions);
    });

    it('passes dismissal-filtered violations to the strict policy rules gate', () => {
        // Given a strict-rules domain and a report whose only violation has been dismissed — a dismissal that is only
        // detectable with the report/owner/policy context that getTransactionViolations applies
        mockAreStrictPolicyRulesEnabled = true;
        mockTransactions = reportTransactions;
        mockTransactionViolations = reportViolations;
        mockedGetTransactionViolations.mockReturnValue([]);

        // When the button renders
        render(<SubmitActionButton />);

        // Then the filter ran with the full context the report header's filter uses, and the gate received the filtered
        // collection instead of the raw context slice, so the two Submit buttons cannot disagree on dismissed violations
        expect(mockedGetTransactionViolations).toHaveBeenCalledWith(reportTransactions.at(0), reportViolations, TEST_EMAIL, TEST_ACCOUNT_ID, iouReport, undefined, undefined);
        expect(mockedShouldBlockSubmitDueToStrictPolicyRules).toHaveBeenCalledWith(
            TEST_IOU_REPORT_ID,
            {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TEST_TRANSACTION_ID}`]: []},
            true,
            TEST_ACCOUNT_ID,
            TEST_EMAIL,
            reportTransactions,
        );
    });

    it('does not open the submit-to popover on a submit policy when strict policy rules block the report', () => {
        // Given a blocked report on a submit workspace, where pressing submit normally opens the submit-to popover
        mockAreStrictPolicyRulesEnabled = true;
        mockTransactions = reportTransactions;
        mockTransactionViolations = reportViolations;
        mockedShouldBlockSubmitDueToStrictPolicyRules.mockReturnValue(true);
        mockedIsSubmitPolicy.mockReturnValue(true);

        // When the press handler runs
        render(<SubmitActionButton />);

        act(() => {
            mockSubmitButtonPropsHolder.current?.onPress?.();
        });

        // Then the popover never opens, because it runs the submission itself and would route around the block, landing
        // the user on the same backend rejection one step later
        expect(mockOpenReportSubmitToPopover).not.toHaveBeenCalled();
        expect(mockedSubmitReport).not.toHaveBeenCalled();
    });

    it('keeps the button enabled and submits when strict policy rules are enforced but nothing blocks the report', () => {
        // Given a domain that strictly enforces workspace rules and a report with no blocking violations
        mockAreStrictPolicyRulesEnabled = true;
        mockTransactions = reportTransactions;

        // When the button is pressed
        render(<SubmitActionButton />);

        act(() => {
            mockSubmitButtonPropsHolder.current?.onPress?.();
        });

        // Then the report still submits, so the new block never stands in the way of a report the backend would accept
        expect(mockSubmitButtonPropsHolder.current?.isDisabled).toBe(false);
        expect(mockedSubmitReport).toHaveBeenCalledWith(expect.objectContaining({expenseReport: iouReport}));
    });

    it('disables the button and blocks submission when the workspace prevents self-approval', () => {
        // Given a workspace that prevents self-approval on a report whose next approver is the submitter
        mockedShouldBlockSubmitDueToPreventSelfApproval.mockReturnValue(true);

        // When the press handler runs
        render(<SubmitActionButton />);

        act(() => {
            mockSubmitButtonPropsHolder.current?.onPress?.();
        });

        // Then the button behaves exactly like the report header's submit button, so the two cannot disagree about
        // whether the same report is submittable
        expect(mockSubmitButtonPropsHolder.current?.isDisabled).toBe(true);
        expect(mockedSubmitReport).not.toHaveBeenCalled();

        // Then the predicate received the same report and policy the header's gate reads (the policy is not hydrated
        // in this environment, so it is undefined)
        expect(mockedShouldBlockSubmitDueToPreventSelfApproval).toHaveBeenCalledWith(iouReport, undefined);
    });
});
