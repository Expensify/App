import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchColumnType} from '@components/Search/types';
import TransactionItemRow from '@components/TransactionItemRow';
import type {TransactionWithOptionalSearchFields} from '@components/TransactionItemRow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolations} from '@src/types/onyx';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@components/Icon/Expensicons');
jest.mock('@libs/Navigation/Navigation');
jest.mock('@hooks/useAnimatedHighlightStyle');

const MOCK_TRANSACTION_ID = '1';
const MOCK_REPORT_ID = '1';

// Default props for TransactionItemRow component
const defaultProps = {
    shouldUseNarrowLayout: false,
    isSelected: false,
    shouldShowTooltip: false,
    dateColumnSize: CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
    amountColumnSize: CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
    taxAmountColumnSize: CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
    onCheckboxPress: jest.fn(),
    shouldShowCheckbox: false,
    columns: Object.values(CONST.SEARCH.TABLE_COLUMNS) as SearchColumnType[],
    onButtonPress: jest.fn(),
    isParentHovered: false,
};

// Helper function to render TransactionItemRow with providers
const renderTransactionItemRow = (transactionItem: TransactionWithOptionalSearchFields) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
            <TransactionItemRow
                transactionItem={transactionItem}
                violations={transactionItem.violations}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultProps}
            />
        </ComposeProviders>,
    );
};

// Helper function to create base transaction
const createBaseTransaction = (overrides = {}) => ({
    ...createRandomTransaction(1),
    pendingAction: null,
    transactionID: MOCK_TRANSACTION_ID,
    reportID: MOCK_REPORT_ID,
    ...overrides,
});

// Helper function to create base report action
const createBaseReportAction = (id: number, overrides = {}) => ({
    ...createRandomReportAction(id),
    pendingAction: null,
    ...overrides,
});

// Helper function to create IOU report action
const createIOUReportAction = () =>
    createBaseReportAction(1, {
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        childReportID: MOCK_REPORT_ID,
        originalMessage: {
            IOUReportID: MOCK_REPORT_ID,
            amount: -100,
            currency: 'USD',
            comment: '',
            IOUTransactionID: MOCK_TRANSACTION_ID,
        },
    });

// Helper function to create error report action
const createErrorReportAction = () =>
    createBaseReportAction(2, {
        errors: {
            ERROR: 'Unexpected error posting the comment. Please try again later.',
        },
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    });

describe('TransactionItemRowRBR', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        return Onyx.clear([ONYXKEYS.NVP_PREFERRED_LOCALE]).then(waitForBatchedUpdates);
    });

    it('should display RBR message for transaction with single violation', async () => {
        // Given a transaction with a single violation
        const mockViolations: TransactionViolations = [
            {
                name: CONST.VIOLATIONS.MISSING_CATEGORY,
                type: CONST.VIOLATION_TYPES.VIOLATION,
            },
        ];
        const mockTransaction = createBaseTransaction({violations: mockViolations});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${MOCK_TRANSACTION_ID}`, mockTransaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${MOCK_TRANSACTION_ID}`, mockViolations);

        // When rendering the transaction item row
        renderTransactionItemRow(mockTransaction);
        await waitForBatchedUpdates();

        // Then the RBR message should be displayed
        expect(screen.getByText('Missing category.')).toBeOnTheScreen();
    });

    it('should default reimbursable to Yes when field is missing', async () => {
        const mockTransaction = createBaseTransaction({reimbursable: undefined, billable: false});

        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                <TransactionItemRow
                    transactionItem={mockTransaction}
                    violations={undefined}
                    // eslint-disable-next-line react/jsx-props-no-spreading -- test: avoids repeating many required props
                    {...defaultProps}
                    columns={[CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE]}
                />
            </ComposeProviders>,
        );
        await waitForBatchedUpdates();

        expect(screen.getByText('Yes')).toBeOnTheScreen();
        expect(screen.queryByText('No')).not.toBeOnTheScreen();
    });

    it('should display RBR message for transaction with multiple violations', async () => {
        // Given a transaction with two violations
        const mockViolations: TransactionViolations = [
            {
                name: CONST.VIOLATIONS.MISSING_CATEGORY,
                type: CONST.VIOLATION_TYPES.VIOLATION,
            },
            {
                name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
                type: CONST.VIOLATION_TYPES.VIOLATION,
            },
        ];
        const mockTransaction = createBaseTransaction({violations: mockViolations});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${MOCK_TRANSACTION_ID}`, mockTransaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${MOCK_TRANSACTION_ID}`, mockViolations);

        // When rendering the transaction item row
        renderTransactionItemRow(mockTransaction);
        await waitForBatchedUpdates();

        // Then the RBR message should be displayed with both violations
        expect(screen.getByText('Missing category. Potential duplicate.')).toBeOnTheScreen();
    });

    it('should display RBR message for transaction with violations, and missing merchant error', async () => {
        // Given a transaction with violations, errors, and missing merchant errors
        const mockViolations: TransactionViolations = [
            {
                name: CONST.VIOLATIONS.MISSING_CATEGORY,
                type: CONST.VIOLATION_TYPES.VIOLATION,
            },
        ];
        const mockReport = {
            ...createRandomReport(1, undefined),
            pendingAction: null,
            type: CONST.REPORT.TYPE.EXPENSE,
        };
        const mockTransaction = createBaseTransaction({
            violations: mockViolations,
            modifiedMerchant: '',
            merchant: '',
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${MOCK_TRANSACTION_ID}`, mockTransaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${MOCK_REPORT_ID}`, mockReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${MOCK_TRANSACTION_ID}`, mockViolations);

        // When rendering the transaction item row
        renderTransactionItemRow(mockTransaction);
        await waitForBatchedUpdates();

        // Then the RBR message should be displayed with missing merchant error and violations
        expect(screen.getByText('Missing merchant. Missing category.')).toBeOnTheScreen();
    });

    it('should display RBR message for transaction with missing merchant error', async () => {
        // Given a transaction with a missing merchant error
        const mockReport = {
            ...createRandomReport(1, undefined),
            pendingAction: null,
            type: CONST.REPORT.TYPE.EXPENSE,
        };
        const mockTransaction = createBaseTransaction({
            modifiedMerchant: '',
            merchant: '',
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${MOCK_TRANSACTION_ID}`, mockTransaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${MOCK_REPORT_ID}`, mockReport);

        // When rendering the transaction item row
        renderTransactionItemRow(mockTransaction);
        await waitForBatchedUpdates();

        // Then the RBR message should be displayed with missing merchant error
        expect(screen.getByText('Missing merchant.')).toBeOnTheScreen();
    });

    it('should not display RBR message for transaction with no violations or errors', async () => {
        // Given a transaction with no violations or errors
        const mockTransaction = createBaseTransaction({violations: []});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${MOCK_TRANSACTION_ID}`, mockTransaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${MOCK_TRANSACTION_ID}`, []);

        // When rendering the transaction item row
        renderTransactionItemRow(mockTransaction);
        await waitForBatchedUpdates();

        // Then the RBR message should not be displayed
        expect(screen.queryByTestId('TransactionItemRowRBR')).not.toBeOnTheScreen();
    });

    it('should display RBR message for transaction with report action errors', async () => {
        // Given a transaction with report action errors
        const mockTransaction = createBaseTransaction();
        const mockReportActionIOU = createIOUReportAction();
        const mockReportActionErrors = createErrorReportAction();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${MOCK_TRANSACTION_ID}`, mockTransaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MOCK_TRANSACTION_ID}`, {
            [mockReportActionIOU.reportActionID]: mockReportActionIOU,
            [mockReportActionErrors.reportActionID]: mockReportActionErrors,
        });

        // When rendering the transaction item row
        renderTransactionItemRow(mockTransaction);
        await waitForBatchedUpdates();

        // Then the RBR message should be displayed for report action errors
        expect(screen.getByText('Unexpected error posting the comment. Please try again later.')).toBeOnTheScreen();
    });

    it('should display RBR message for transaction with both violations and errors', async () => {
        // Given a transaction with violations and report action errors
        const mockViolations: TransactionViolations = [
            {
                name: CONST.VIOLATIONS.MISSING_CATEGORY,
                type: CONST.VIOLATION_TYPES.VIOLATION,
            },
        ];
        const mockTransaction = createBaseTransaction({violations: mockViolations});
        const mockReportActionIOU = createIOUReportAction();
        const mockReportActionErrors = createErrorReportAction();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${MOCK_TRANSACTION_ID}`, mockTransaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${MOCK_TRANSACTION_ID}`, mockViolations);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MOCK_TRANSACTION_ID}`, {
            [mockReportActionIOU.reportActionID]: mockReportActionIOU,
            [mockReportActionErrors.reportActionID]: mockReportActionErrors,
        });

        // When rendering the transaction item row
        renderTransactionItemRow(mockTransaction);
        await waitForBatchedUpdates();

        // Then the RBR message should be displayed with both report action errors and violations
        expect(screen.getByText('Unexpected error posting the comment. Please try again later. Missing category.')).toBeOnTheScreen();
    });

    it('should display RBR message for transaction with violations, errors, and missing merchant error', async () => {
        // Given a transaction with violations, errors, and missing merchant error
        const mockViolations: TransactionViolations = [
            {
                name: CONST.VIOLATIONS.MISSING_CATEGORY,
                type: CONST.VIOLATION_TYPES.VIOLATION,
            },
        ];
        const mockReport = {
            ...createRandomReport(1, undefined),
            pendingAction: null,
            type: CONST.REPORT.TYPE.EXPENSE,
        };
        const mockTransaction = createBaseTransaction({
            violations: mockViolations,
            modifiedMerchant: '',
            merchant: '',
        });
        const mockReportActionIOU = createIOUReportAction();
        const mockReportActionErrors = createErrorReportAction();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${MOCK_TRANSACTION_ID}`, mockTransaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${MOCK_REPORT_ID}`, mockReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${MOCK_TRANSACTION_ID}`, mockViolations);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MOCK_TRANSACTION_ID}`, {
            [mockReportActionIOU.reportActionID]: mockReportActionIOU,
            [mockReportActionErrors.reportActionID]: mockReportActionErrors,
        });

        // When rendering the transaction item row
        renderTransactionItemRow(mockTransaction);
        await waitForBatchedUpdates();

        // Then the RBR message should be displayed with transaction errors, missing merchant error, and violations
        expect(screen.getByText('Unexpected error posting the comment. Please try again later. Missing merchant. Missing category.')).toBeOnTheScreen();
    });
});
