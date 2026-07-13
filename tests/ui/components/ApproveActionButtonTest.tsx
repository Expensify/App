import {act, render} from '@testing-library/react-native';

import ApproveActionButton from '@components/ReportActionItem/MoneyRequestReportPreview/ApproveActionButton';

import useOnyx from '@hooks/useOnyx';

import {hasHeldExpensesFromTransactions} from '@libs/ReportUtils';

import {approveMoneyRequest} from '@userActions/IOU/ReportWorkflow';

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
} as Report;

function createOnyxResult<T>(value: NonNullable<T> | undefined): UseOnyxResult<T> {
    return [value, {status: 'loaded'}];
}

// Capture the onPress (confirmApproval) handler the button passes to the underlying Button so approval can be triggered.
const mockOnPressHolder: {current?: () => void} = {current: undefined};
jest.mock('@components/Button', () => ({
    __esModule: true,
    default: (props: {onPress?: () => void}) => {
        mockOnPressHolder.current = props.onPress;
        return null;
    },
}));

jest.mock('@userActions/IOU/ReportWorkflow', () => ({
    __esModule: true,
    approveMoneyRequest: jest.fn(),
}));

jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- partial mock of the real module
    const actual = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- spread the real module and override selected exports
    return {
        ...actual,
        __esModule: true,
        hasHeldExpensesFromTransactions: jest.fn(() => false),
        hasViolations: jest.fn(() => false),
    };
});

// ApproveActionButton reads from context instead of props; these mock-prefixed objects back the mocked slice hooks.
const mockStartApprovedAnimation = jest.fn();
const mockOnHoldMenuOpen = jest.fn();
jest.mock('@components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContext', () => ({
    __esModule: true,
    useReportPreviewData: () => ({iouReportID: TEST_IOU_REPORT_ID}),
    useReportPreviewActionState: () => ({shouldShowPayButton: true}),
    useReportPreviewActions: () => ({startApprovedAnimation: mockStartApprovedAnimation, onHoldMenuOpen: mockOnHoldMenuOpen}),
}));

let mockIsDelegateAccessRestricted = false;
const mockShowDelegateNoAccessModal = jest.fn();
jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    __esModule: true,
    useDelegateNoAccessState: () => ({isDelegateAccessRestricted: mockIsDelegateAccessRestricted}),
    useDelegateNoAccessActions: () => ({showDelegateNoAccessModal: mockShowDelegateNoAccessModal}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({__esModule: true, default: jest.fn(() => ({accountID: 1, email: 'approver@test.com'}))}));
jest.mock('@hooks/usePermissions', () => ({__esModule: true, default: jest.fn(() => ({isBetaEnabled: () => false}))}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: jest.fn(() => ({translate: (key: string) => key}))}));
jest.mock('@hooks/useTransactionsAndViolationsForReport', () => ({__esModule: true, default: jest.fn(() => ({transactions: {}, violations: {}, isLoaded: true}))}));
jest.mock('@hooks/useOnyx', () => jest.fn());

const mockedUseOnyx = jest.mocked(useOnyx);
const mockedApproveMoneyRequest = jest.mocked(approveMoneyRequest);
const mockedHasHeldExpenses = jest.mocked(hasHeldExpensesFromTransactions);

describe('ApproveActionButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockOnPressHolder.current = undefined;
        mockIsDelegateAccessRestricted = false;
        mockedHasHeldExpenses.mockReturnValue(false);
        mockedUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${TEST_IOU_REPORT_ID}`) {
                return createOnyxResult<Report>(iouReport);
            }
            return createOnyxResult(undefined);
        });
    });

    it('approves the report with the full expense report and starts the approved animation', () => {
        render(<ApproveActionButton />);

        act(() => {
            mockOnPressHolder.current?.();
        });

        expect(mockedApproveMoneyRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                expenseReport: iouReport,
                full: true,
                onApproved: mockStartApprovedAnimation,
            }),
        );
    });

    it('opens the hold menu instead of approving when the report has held expenses', () => {
        mockedHasHeldExpenses.mockReturnValue(true);
        render(<ApproveActionButton />);

        act(() => {
            mockOnPressHolder.current?.();
        });

        expect(mockOnHoldMenuOpen).toHaveBeenCalledWith(CONST.IOU.REPORT_ACTION_TYPE.APPROVE, undefined, true);
        expect(mockedApproveMoneyRequest).not.toHaveBeenCalled();
    });

    it('shows the delegate no-access modal instead of approving when delegate access is restricted', () => {
        mockIsDelegateAccessRestricted = true;
        render(<ApproveActionButton />);

        act(() => {
            mockOnPressHolder.current?.();
        });

        expect(mockShowDelegateNoAccessModal).toHaveBeenCalled();
        expect(mockedApproveMoneyRequest).not.toHaveBeenCalled();
    });
});
