import {buildOptimisticIOUReport, buildOptimisticIOUReportAction} from '@libs/ReportUtils';
import {createTransactionPreviewConditionals, createTransactionPreviewText} from '@libs/TransactionPreviewUtils';
import {buildOptimisticTransaction} from '@libs/TransactionUtils';
import CONST from '@src/CONST';

const basicInput = {
    iouReport: buildOptimisticIOUReport(123, 234, 1000, '1', 'USD'),
    transaction: buildOptimisticTransaction({
        transactionParams: {
            amount: 100,
            currency: 'USD',
            reportID: '1',
            comment: '',
            attendees: [],
            created: '2024-01-01',
        },
    }),
    translate: jest.fn().mockImplementation((key: string) => key),
    action: buildOptimisticIOUReportAction('create', 100, 'USD', '', [], '1', undefined, '1'),
    violations: [],
    transactions: {},
    isBillSplit: false,
    shouldShowRBR: false,
    isReportAPolicyExpenseChat: false,
    areThereDuplicates: false,
};

describe('TransactionPreviewUtils', () => {
    describe('createTransactionPreviewText', () => {
        it('should return an empty RBR message when shouldShowRBR is false and no transaction is given', () => {
            const result = createTransactionPreviewText({...basicInput, shouldShowRBR: false});
            expect(result.RBRmessage).toEqual('');
        });

        it('returns correct hold message when the transaction is on hold', () => {
            const testInput = {
                ...basicInput,
                transaction: {...basicInput.transaction, comment: {hold: 'true'}},
                shouldShowRBR: true,
            };

            const result = createTransactionPreviewText(testInput);
            expect(result.RBRmessage).toContain('violations.hold');
        });
    });

    describe('createTransactionPreviewConditionals', () => {
        it('should determine RBR visibility according to violation and hold conditions', () => {
            const input = {
                ...basicInput,
                violations: [{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION, transactionID: 123, showInReview: true}],
            };
            const result = createTransactionPreviewConditionals(input);
            expect(result.shouldShowRBR).toBeTruthy();
        });

        it("should disable onPress when it's a bill split with empty transaction data", () => {
            const input = {...basicInput, isBillSplit: true, transaction: undefined};
            const result = createTransactionPreviewConditionals(input);
            expect(result.shouldDisableOnPress).toBeTruthy();
        });

        it("should not show category if it's not a policy expense chat", () => {
            const input = {...basicInput, isReportAPolicyExpenseChat: false};
            const result = createTransactionPreviewConditionals(input);
            expect(result.shouldShowCategory).toBeFalsy();
        });

        it('should show keep button when there are duplicates', () => {
            const input = {...basicInput, areThereDuplicates: true};
            const result = createTransactionPreviewConditionals(input);
            expect(result.shouldShowKeepButton).toBeTruthy();
        });
    });
});
