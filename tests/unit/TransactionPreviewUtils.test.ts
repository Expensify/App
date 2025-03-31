import {buildOptimisticIOUReport, buildOptimisticIOUReportAction} from '@libs/ReportUtils';
import {createTransactionPreviewConditionals, getTransactionPreviewTextAndTranslationPaths} from '@libs/TransactionPreviewUtils';
import {buildOptimisticTransaction} from '@libs/TransactionUtils';
import CONST from '@src/CONST';

const basicProps = {
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
    action: buildOptimisticIOUReportAction({
        type: 'create',
        amount: 100,
        currency: 'USD',
        comment: '',
        participants: [],
        transactionID: '1',
        paymentType: undefined,
        iouReportID: '1',
    }),
    violations: [],
    transactionDetails: {},
    isBillSplit: false,
    shouldShowRBR: false,
    isReportAPolicyExpenseChat: false,
    areThereDuplicates: false,
};

describe('TransactionPreviewUtils', () => {
    describe('getTransactionPreviewTextAndTranslationPaths', () => {
        it('should return an empty RBR message when shouldShowRBR is false and no transaction is given', () => {
            const result = getTransactionPreviewTextAndTranslationPaths({...basicProps, shouldShowRBR: false});
            expect(result.RBRMessage.text).toEqual('');
        });

        it('returns correct hold message when the transaction is on hold', () => {
            const functionArgs = {
                ...basicProps,
                transaction: {...basicProps.transaction, comment: {hold: 'true'}},
                shouldShowRBR: true,
            };

            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            expect(result.RBRMessage.translationPath).toContain('iou.expenseWasPutOnHold');
        });

        it('should handle missing iouReport and transaction correctly', () => {
            const functionArgs = {...basicProps, iouReport: undefined, transaction: undefined};
            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            expect(result.RBRMessage.text).toEqual('');
            expect(result.previewHeaderText).toContainEqual({text: ''});
            expect(result.displayAmountText.text).toEqual('$0.00');
        });

        it('returns merchant missing and amount missing message when appropriate', () => {
            const functionArgs = {
                ...basicProps,
                transaction: {...basicProps.transaction, merchant: '', amount: 0},
                shouldShowRBR: true,
            };
            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            expect(result.RBRMessage.translationPath).toEqual('violations.reviewRequired');
        });

        it('should display showCashOrCard in previewHeaderText', () => {
            const functionArgsWithCardTransaction = {
                ...basicProps,
                transaction: {
                    ...basicProps.transaction,
                    managedCard: true,
                },
            };
            const cardTransaction = getTransactionPreviewTextAndTranslationPaths(functionArgsWithCardTransaction);
            const cashTransaction = getTransactionPreviewTextAndTranslationPaths(basicProps);

            expect(cardTransaction.showCashOrCard).toEqual({translationPath: 'iou.card'});
            expect(cashTransaction.showCashOrCard).toEqual({translationPath: 'iou.cash'});

            expect(cardTransaction.previewHeaderText).toEqual(expect.arrayContaining([cardTransaction.showCashOrCard]));
            expect(cashTransaction.previewHeaderText).toEqual(expect.arrayContaining([cashTransaction.showCashOrCard]));
        });

        it('displays appropriate header text if the transaction is bill split', () => {
            const functionArgs = {...basicProps, isBillSplit: true};
            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            expect(result.previewHeaderText).toEqual(expect.arrayContaining([{translationPath: 'iou.split'}]));
        });

        it('displays description when receipt is being scanned', () => {
            const functionArgs = {...basicProps, transaction: {...basicProps.transaction, receipt: {state: CONST.IOU.RECEIPT_STATE.SCANNING}}};
            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            expect(result.previewHeaderText).toEqual(expect.arrayContaining([{translationPath: 'common.receipt'}]));
        });

        it('should apply correct text when transaction is pending and not a bill split', () => {
            const functionArgs = {...basicProps, transaction: {...basicProps.transaction, status: CONST.TRANSACTION.STATUS.PENDING}};
            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            expect(result.previewHeaderText).toEqual(expect.arrayContaining([{translationPath: 'iou.pending'}]));
        });

        it('handles currency and amount display during scanning correctly', () => {
            const functionArgs = {
                ...basicProps,
                transactionDetails: {amount: 300, currency: 'EUR'},
                transaction: {...basicProps.transaction, receipt: {state: CONST.IOU.RECEIPT_STATE.SCANNING}},
            };
            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            expect(result.displayAmountText.translationPath).toEqual('iou.receiptStatusTitle');
        });

        it('shows approved message when the iouReport is canceled', () => {
            const functionArgs = {...basicProps, iouReport: {...basicProps.iouReport, isCancelledIOU: true}};
            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            expect(result.previewHeaderText).toContainEqual({translationPath: 'iou.canceled'});
        });
    });

    describe('createTransactionPreviewConditionals', () => {
        it('should determine RBR visibility according to violation and hold conditions', () => {
            const functionArgs = {
                ...basicProps,
                violations: [{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION, transactionID: 123, showInReview: true}],
            };
            const result = createTransactionPreviewConditionals(functionArgs);
            expect(result.shouldShowRBR).toBeTruthy();
        });

        it("should disable onPress when it's a bill split with empty transaction data", () => {
            const functionArgs = {...basicProps, isBillSplit: true, transaction: undefined};
            const result = createTransactionPreviewConditionals(functionArgs);
            expect(result.shouldDisableOnPress).toBeTruthy();
        });

        it("should not show category if it's not a policy expense chat", () => {
            const functionArgs = {...basicProps, isReportAPolicyExpenseChat: false};
            const result = createTransactionPreviewConditionals(functionArgs);
            expect(result.shouldShowCategory).toBeFalsy();
        });

        it('should show keep button when there are duplicates', () => {
            const functionArgs = {...basicProps, areThereDuplicates: true};
            const result = createTransactionPreviewConditionals(functionArgs);
            expect(result.shouldShowKeepButton).toBeTruthy();
        });

        it('should show split share if amount is positive and bill is split', () => {
            const functionArgs = {
                ...basicProps,
                isBillSplit: true,
                transactionDetails: {
                    amount: 1,
                },
            };
            const result = createTransactionPreviewConditionals(functionArgs);
            expect(result.shouldShowSplitShare).toBeTruthy();
        });

        it('should show skeleton if transaction data is empty and action is not deleted', () => {
            const functionArgs = {...basicProps, transaction: undefined};
            const result = createTransactionPreviewConditionals(functionArgs);
            expect(result.shouldShowSkeleton).toBeTruthy();
        });

        it('should show merchant if merchant data is valid and significant', () => {
            const functionArgs = {...basicProps, transactionDetails: {merchant: 'Valid Merchant'}};
            const result = createTransactionPreviewConditionals(functionArgs);
            expect(result.shouldShowMerchant).toBeTruthy();
        });

        it('should not show description when merchant is displayed', () => {
            const functionArgs = {...basicProps, transactionDetails: {merchant: 'Valid Merchant', comment: 'Valid Comment'}};
            const result = createTransactionPreviewConditionals(functionArgs);
            expect(result.shouldShowDescription).toBeFalsy();
        });

        it("should show tag if it's a policy expense chat and tag is present", () => {
            const functionArgs = {...basicProps, isReportAPolicyExpenseChat: true, transactionDetails: {tag: 'Transport'}};
            const result = createTransactionPreviewConditionals(functionArgs);
            expect(result.shouldShowTag).toBeTruthy();
        });

        it('should correctly show violation message if there are multiple violations', () => {
            const functionArgs = {
                ...basicProps,
                violations: [
                    {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true},
                    {name: CONST.VIOLATIONS.CUSTOM_RULES, type: CONST.VIOLATION_TYPES.WARNING, showInReview: true},
                ],
                transactionDetails: {amount: 200},
            };
            const result = createTransactionPreviewConditionals(functionArgs);
            expect(result.shouldShowRBR).toBeTruthy();
        });

        it('should not disable onPress when bill split but transaction data is full', () => {
            const functionArgs = {...basicProps, isBillSplit: true, transaction: {...basicProps.transaction}};
            const result = createTransactionPreviewConditionals(functionArgs);
            expect(result.shouldDisableOnPress).toBeFalsy();
        });

        it('should ensure RBR is not shown when no violation and no hold', () => {
            const functionArgs = {...basicProps, isTransactionOnHold: false};
            const result = createTransactionPreviewConditionals(functionArgs);
            expect(result.shouldShowRBR).toBeFalsy();
        });

        it('should show description if no merchant is presented and is not scanning', () => {
            const functionArgs = {...basicProps, transactionDetails: {comment: 'A valid comment', merchant: ''}};
            const result = createTransactionPreviewConditionals(functionArgs);
            expect(result.shouldShowDescription).toBeTruthy();
        });
    });
});
