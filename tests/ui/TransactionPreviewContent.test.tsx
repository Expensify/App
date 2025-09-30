import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import TransactionPreviewContent from '@components/ReportActionItem/TransactionPreview/TransactionPreviewContent';
import type {TransactionPreviewContentProps} from '@components/ReportActionItem/TransactionPreview/types';
import {buildOptimisticIOUReport, buildOptimisticIOUReportAction} from '@libs/ReportUtils';
import {buildOptimisticTransaction} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, Transaction, TransactionViolations} from '@src/types/onyx';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Mock navigation
jest.mock('@libs/Navigation/Navigation');

// Mock complex dependencies to simplify testing
jest.mock('@components/ReportActionItem/ReportActionItemImages', () => 'ReportActionItemImages');
jest.mock('@components/ReportActionAvatars', () => 'ReportActionAvatars');
jest.mock('@components/SelectionList/Search/UserInfoCellsWithArrow', () => 'UserInfoCellsWithArrow');
jest.mock('@components/TransactionPreviewSkeletonView', () => 'TransactionPreviewSkeletonView');

const mockTransactionID = 'mock-transaction-id';
const mockReportID = 'mock-report-id';

// Create mock violations
const createMockViolations = (violationType = CONST.VIOLATION_TYPES.VIOLATION): TransactionViolations => [
    {
        name: CONST.VIOLATIONS.MISSING_CATEGORY,
        type: violationType,
        showInReview: true,
    },
];

// Create mock transaction
const createMockTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
    ...buildOptimisticTransaction({
        transactionParams: {
            amount: 1000,
            currency: 'USD',
            comment: 'Test expense',
            merchant: 'Test Merchant',
            created: '2024-01-01',
            attendees: [],
            reportID: mockReportID,
        },
    }),
    transactionID: mockTransactionID,
    reportID: mockReportID,
    ...overrides,
});

// Create mock report
const createMockReport = (overrides: Partial<Report> = {}): Report => ({
    ...buildOptimisticIOUReport(123, 456, 1000, mockReportID, 'USD'),
    reportID: mockReportID,
    type: CONST.REPORT.TYPE.EXPENSE,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    ...overrides,
});

// Create mock action
const createMockAction = (overrides: Partial<ReportAction> = {}): ReportAction => ({
    ...buildOptimisticIOUReportAction({
        type: 'create',
        amount: 1000,
        currency: 'USD',
        comment: 'Test expense',
        participants: [],
        transactionID: mockTransactionID,
        paymentType: undefined,
        iouReportID: mockReportID,
    }),
    ...overrides,
});

// Helper function to render TransactionPreviewContent with real component
const renderTransactionPreviewContent = (overrides: Partial<TransactionPreviewContentProps> = {}) => {
    const defaultProps: TransactionPreviewContentProps = {
        action: createMockAction(),
        isWhisper: false,
        isHovered: false,
        chatReport: undefined,
        personalDetails: {},
        report: createMockReport(),
        transaction: createMockTransaction(),
        violations: [],
        transactionRawAmount: 1000,
        offlineWithFeedbackOnClose: jest.fn(),
        containerStyles: [],
        transactionPreviewWidth: 300,
        isBillSplit: false,
        areThereDuplicates: false,
        sessionAccountID: 123,
        walletTermsErrors: undefined,
        reportPreviewAction: undefined,
        shouldHideOnDelete: true,
        shouldShowPayerAndReceiver: false,
        navigateToReviewFields: jest.fn(),
        isReviewDuplicateTransactionPage: false,
        routeName: 'TEST_ROUTE',
        ...overrides,
    };

    return render(
        <LocaleContextProvider>
            <TransactionPreviewContent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultProps}
            />
        </LocaleContextProvider>,
    );
};

TestHelper.setupApp();

describe('TransactionPreviewContent - Violation Indicators', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        await TestHelper.signInWithTestUser();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('renders the component with violations without crashing', async () => {
        const violations = createMockViolations();

        renderTransactionPreviewContent({violations});
        await waitForBatchedUpdates();

        // Check that the component renders with the merchant name
        expect(screen.getByText('Test Merchant')).toBeOnTheScreen();

        // The actual violation display logic is complex and depends on many factors
        // This test ensures the component can handle violations without crashing
    });

    it('renders the component without violations without crashing', async () => {
        renderTransactionPreviewContent({violations: []});
        await waitForBatchedUpdates();

        // Component should render normally without violations
        expect(screen.getByText('Test Merchant')).toBeOnTheScreen();
    });

    it('handles multiple violations without crashing', async () => {
        const multipleViolations: TransactionViolations = [
            {
                name: CONST.VIOLATIONS.MISSING_CATEGORY,
                type: CONST.VIOLATION_TYPES.VIOLATION,
                showInReview: true,
            },
            {
                name: CONST.VIOLATIONS.MISSING_TAG,
                type: CONST.VIOLATION_TYPES.VIOLATION,
                showInReview: true,
            },
        ];

        renderTransactionPreviewContent({violations: multipleViolations});
        await waitForBatchedUpdates();

        // Component should handle multiple violations without crashing
        expect(screen.getByText('Test Merchant')).toBeOnTheScreen();
    });

    it('handles notice type violations without crashing', async () => {
        const noticeViolations: TransactionViolations = [
            {
                name: CONST.VIOLATIONS.MODIFIED_AMOUNT,
                type: CONST.VIOLATION_TYPES.NOTICE,
                showInReview: true,
            },
        ];

        renderTransactionPreviewContent({violations: noticeViolations});
        await waitForBatchedUpdates();

        // Component should handle notice violations without issues
        expect(screen.getByText('Test Merchant')).toBeOnTheScreen();
    });

    it('passes violations data to the component correctly', async () => {
        const violations = createMockViolations();

        renderTransactionPreviewContent({
            violations,
            transaction: createMockTransaction({merchant: 'Custom Merchant'}),
        });
        await waitForBatchedUpdates();

        // Verify the custom merchant name is displayed
        expect(screen.getByText('Custom Merchant')).toBeOnTheScreen();

        // The component receives the violations - the actual display logic
        // is tested in the utility function tests and integration tests
    });
});
