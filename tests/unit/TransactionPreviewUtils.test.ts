import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import {buildOptimisticIOUReport, buildOptimisticIOUReportAction} from '@libs/ReportUtils';
import {
    compareByRBR,
    createTransactionPreviewConditionals,
    getReviewNavigationRoute,
    getTransactionPreviewTextAndTranslationPaths,
    getUniqueActionErrorsForTransaction,
    getViolationTranslatePath,
    transactionHasRBR,
} from '@libs/TransactionPreviewUtils';
import {buildOptimisticTransaction} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions, Transaction, TransactionViolation} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';
import {convertToDisplayString, getCurrencyDecimalsLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const basicProps = {
    dateFnsLocale: undefined,
    iouReport: buildOptimisticIOUReport(123, 234, 1000, '1', 'USD', getCurrencyDecimalsLocal),
    iouReportOwnerLogin: undefined,
    policy: undefined,
    transaction: buildOptimisticTransaction({
        transactionParams: {
            amount: 100,
            currency: 'USD',
            reportID: '1',
            comment: '',
            attendees: [],
            created: '2024-01-01',
            merchant: 'Test Merchant',
        },
    }),
    translate: jest.fn().mockImplementation((key: string) => key),
    action: buildOptimisticIOUReportAction({
        getCurrencyDecimals: getCurrencyDecimalsLocal,
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
    currentUserEmail: '',
    currentUserAccountID: CONST.DEFAULT_NUMBER_ID,
    reportViolations: undefined,
    convertToDisplayString,
};

describe('TransactionPreviewUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });
    beforeEach(() => {
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('getTransactionPreviewTextAndTranslationPaths', () => {
        it('should return an empty RBR message when shouldShowRBR is false and no transaction is given', () => {
            const result = getTransactionPreviewTextAndTranslationPaths({...basicProps, shouldShowRBR: false});
            expect(result.RBRMessage.text).toEqual('');
        });

        it('returns correct hold message when the transaction is on hold', () => {
            const functionArgs = {
                ...basicProps,
                transaction: {...basicProps.transaction, comment: {hold: 'true'}},
                originalTransaction: undefined,
                shouldShowRBR: true,
            };

            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            // The hold is the only reason, so there is nothing for the caller to prepend to it.
            expect(result.shouldShowHoldMessage).toBe(true);
            expect(result.RBRMessage.text).toEqual('');
            // The hold belongs to the RBR row only, never repeated on the supporting line.
            expect(result.previewStatusText).toEqual([]);
        });

        it('keeps the other violation in the RBR message when the transaction is on hold and also has violations', () => {
            const functionArgs = {
                ...basicProps,
                transaction: {...basicProps.transaction, comment: {hold: 'true'}},
                violations: [
                    {name: CONST.VIOLATIONS.HOLD, type: CONST.VIOLATION_TYPES.VIOLATION},
                    {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION},
                ] as TransactionViolation[],
                violationMessage: 'Category missing',
                originalTransaction: undefined,
                shouldShowRBR: true,
            };

            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            // The hold violation is excluded, so the real violation survives for the caller to prepend.
            expect(result.RBRMessage.text).toEqual('Category missing');
            expect(result.shouldShowHoldMessage).toBe(true);
        });

        it('returns correct receipt error message when the transaction has receipt error', () => {
            const functionArgs = {
                ...basicProps,
                transaction: {
                    ...basicProps.transaction,
                    errors: {
                        error1: {
                            error: CONST.IOU.RECEIPT_ERROR,
                            source: 'source.com',
                            filename: 'file_name.png',
                            action: 'replaceReceipt',
                            retryParams: {transactionID: basicProps.transaction.transactionID, source: 'source.com', transactionPolicy: undefined, transactionPolicyTagList: undefined},
                        },
                    },
                },
                originalTransaction: undefined,
                shouldShowRBR: true,
            };

            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            expect(result.RBRMessage.translationPath).toContain('iou.error.receiptFailureMessageShort');
        });

        it('should handle missing iouReport and transaction correctly', () => {
            const functionArgs = {...basicProps, iouReport: undefined, transaction: undefined, originalTransaction: undefined};
            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            expect(result.RBRMessage.text).toEqual('');
            expect(result.previewTypeText).toEqual({translationPath: 'iou.cash'});
            expect(result.displayAmountText.text).toEqual('$0.00');
        });

        it('returns missing field message when appropriate', () => {
            const functionArgs = {
                ...basicProps,
                iouReport: {...basicProps.iouReport, type: CONST.REPORT.TYPE.EXPENSE},
                transaction: {...basicProps.transaction, created: '', amount: 100, merchant: ''},
                originalTransaction: undefined,
                shouldShowRBR: true,
            };
            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            expect(result.RBRMessage.translationPath).toEqual('iou.missingMerchant');
        });

        it('returns missing amount message when amount is missing but merchant is present (expense report with field errors)', () => {
            const functionArgs: Parameters<typeof getTransactionPreviewTextAndTranslationPaths>[0] = {
                ...basicProps,
                iouReport: {...basicProps.iouReport, type: CONST.REPORT.TYPE.IOU},
                transaction: {
                    ...basicProps.transaction,
                    // @ts-expect-error - This scenario deliberately passes a transaction without an amount to exercise the missing-amount branch.
                    amount: undefined,
                    modifiedAmount: undefined,
                    merchant: 'Valid Merchant',
                    created: '2024-01-01',
                },
                violations: [],
                originalTransaction: undefined,
                shouldShowRBR: true,
            };
            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            expect(result.RBRMessage.translationPath).toEqual('iou.missingAmount');
        });

        it('should display cash or card as the preview type', () => {
            const functionArgsWithCardTransaction = {
                ...basicProps,
                transaction: {
                    ...basicProps.transaction,
                    managedCard: true,
                },
                originalTransaction: undefined,
            };
            const cardTransaction = getTransactionPreviewTextAndTranslationPaths(functionArgsWithCardTransaction);
            const cashTransaction = getTransactionPreviewTextAndTranslationPaths({...basicProps});

            expect(cardTransaction.previewTypeText).toEqual({translationPath: 'common.card'});
            expect(cashTransaction.previewTypeText).toEqual({translationPath: 'iou.cash'});
        });

        it('displays appropriate header text if the transaction is bill split', () => {
            const functionArgs = {...basicProps, isBillSplit: true, originalTransaction: undefined};
            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            expect(result.previewTypeText).toEqual({translationPath: 'iou.split'});
        });

        it('displays description when receipt is being scanned', () => {
            const functionArgs = {
                ...basicProps,
                transaction: {...basicProps.transaction, merchant: '(none)', receipt: {state: CONST.IOU.RECEIPT_STATE.SCANNING}},
                originalTransaction: undefined,
                merchant: 'Expense',
            };
            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            expect(result.previewTypeText).toEqual({translationPath: 'common.receipt'});
        });

        it('should apply correct text when transaction is pending and not a bill split', () => {
            const functionArgs = {...basicProps, transaction: {...basicProps.transaction, status: CONST.TRANSACTION.STATUS.PENDING}, originalTransaction: undefined};
            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            // Pending is a transaction status, so it belongs to the supporting line and must not replace the expense type.
            expect(result.previewStatusText).toContainEqual({translationPath: 'iou.pending'});
            expect(result.previewTypeText).toEqual({translationPath: 'iou.cash'});
        });

        it('handles currency and amount display during scanning correctly', () => {
            const functionArgs = {
                ...basicProps,
                transactionDetails: {amount: 300, currency: 'EUR'},
                transaction: {...basicProps.transaction, merchant: '(none)', receipt: {state: CONST.IOU.RECEIPT_STATE.SCANNING}},
                originalTransaction: undefined,
            };
            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            expect(result.displayAmountText.translationPath).toEqual('iou.receiptStatusTitle');
        });

        it('handles currency and amount display correctly for scan split bill manually completed', () => {
            const modifiedAmount = 300;
            const currency = 'EUR';
            const originalTransactionID = '2';
            const functionArgs = {
                ...basicProps,
                transactionDetails: {amount: modifiedAmount / 2, currency},
                transaction: {...basicProps.transaction, amount: modifiedAmount / 2, currency, comment: {originalTransactionID, source: CONST.IOU.TYPE.SPLIT}},
                isBillSplit: true,
                originalTransaction: createMock<Transaction>({
                    reportID: CONST.REPORT.SPLIT_REPORT_ID,
                    transactionID: originalTransactionID,
                    comment: {
                        splits: [
                            {accountID: 1, email: 'aa@gmail.com'},
                            {accountID: 2, email: 'cc@gmail.com'},
                        ],
                    },
                    modifiedAmount,
                    amount: 0,
                    currency,
                }),
            };
            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            expect(result.displayAmountText.text).toEqual(convertAmountToDisplayString(modifiedAmount, currency));
        });

        it('does not show the canceled status, because a cancelled payment is only recorded by its system message', () => {
            const functionArgs = {...basicProps, iouReport: {...basicProps.iouReport, isCancelledIOU: true}, originalTransaction: undefined};
            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            expect(result.previewStatusText).toEqual([]);
        });

        it('does not show the approved status when the report is approved, because it is redundant with the report status badge', () => {
            const functionArgs = {
                ...basicProps,
                iouReport: {
                    ...basicProps.iouReport,
                    type: CONST.REPORT.TYPE.EXPENSE,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                },
                policy: createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                shouldShowRBR: true,
                originalTransaction: undefined,
            };
            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);

            expect(result.previewStatusText).toEqual([]);
        });

        it('should display the correct amount for a bill split transaction', () => {
            const functionArgs = {...basicProps, isBillSplit: true};
            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            expect(result.displayAmountText.text).toEqual('$1.00');
        });

        it('should display the correct amount for a bill split transaction after updating the amount', () => {
            const functionArgs = {...basicProps, isBillSplit: true, transaction: {...basicProps.transaction, modifiedAmount: 50}};
            const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
            expect(result.displayAmountText.text).toEqual('$0.50');
        });

        describe('with policy parameter', () => {
            it('should show DEW error message when policy has dynamic external workflow and submit fails with error message', () => {
                const dewErrorMessage = 'Failed to submit to QuickBooks';
                const functionArgs = {
                    ...basicProps,
                    policy: {
                        ...createRandomPolicy(1),
                        approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
                    },
                    reportActions: {
                        action1: {
                            reportActionID: 'action1',
                            actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                            created: '2024-01-02',
                            message: [{type: 'TEXT', text: dewErrorMessage}],
                            originalMessage: {message: dewErrorMessage},
                            pendingAction: null,
                        },
                    },
                    shouldShowRBR: true,
                    originalTransaction: undefined,
                };
                const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
                expect(result.RBRMessage.text).toEqual(dewErrorMessage);
            });

            it('should show generic DEW error when policy has dynamic external workflow and submit fails without error message', () => {
                const functionArgs = {
                    ...basicProps,
                    policy: {
                        ...createRandomPolicy(1),
                        approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
                    },
                    reportActions: {
                        action1: {
                            reportActionID: 'action1',
                            actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                            created: '2024-01-02',
                            message: [],
                            originalMessage: {},
                            pendingAction: null,
                        },
                    },
                    shouldShowRBR: true,
                    originalTransaction: undefined,
                };
                const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
                expect(result.RBRMessage.translationPath).toEqual('iou.error.other');
            });

            it('should show violation message for notice violations with policy', () => {
                const violationMsg = 'This expense violates policy rules';
                const functionArgs = {
                    ...basicProps,
                    policy: {
                        ...createRandomPolicy(1),
                        type: CONST.POLICY.TYPE.CORPORATE,
                    },
                    iouReport: {
                        ...basicProps.iouReport,
                        type: CONST.REPORT.TYPE.EXPENSE,
                        policyID: '1',
                    },
                    violations: [
                        {
                            name: CONST.VIOLATIONS.CUSTOM_RULES,
                            type: CONST.VIOLATION_TYPES.NOTICE,
                            showInReview: true,
                            data: {
                                message: violationMsg,
                            },
                        },
                    ],
                    violationMessage: violationMsg,
                    shouldShowRBR: true,
                    originalTransaction: undefined,
                };
                const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
                expect(result.RBRMessage.text).toEqual(violationMsg);
            });

            it('should show modified amount violation text for distance request with policy', () => {
                const violationMsg = 'Distance rate was adjusted';
                const functionArgs = {
                    ...basicProps,
                    policy: {
                        ...createRandomPolicy(1),
                        customUnits: {
                            unit1: {
                                customUnitID: 'unit1',
                                name: 'Distance',
                                attributes: {unit: 'mi' as const},
                                rates: {
                                    rate1: {
                                        customUnitRateID: 'rate1',
                                        name: 'Mileage',
                                        rate: 50,
                                    },
                                },
                            },
                        },
                    },
                    transaction: {
                        ...basicProps.transaction,
                        comment: {
                            customUnit: {
                                customUnitRateID: 'rate1',
                            },
                        },
                    },
                    violations: [
                        {
                            name: CONST.VIOLATIONS.MODIFIED_AMOUNT,
                            type: CONST.VIOLATION_TYPES.NOTICE,
                            showInReview: true,
                            data: {
                                message: violationMsg,
                            },
                        },
                    ],
                    violationMessage: violationMsg,
                    shouldShowRBR: true,
                    originalTransaction: undefined,
                };
                const result = getTransactionPreviewTextAndTranslationPaths(functionArgs);
                expect(result.RBRMessage.text).toEqual(violationMsg);
            });
        });
    });

    describe('createTransactionPreviewConditionals', () => {
        const currentUserAccountID = 999;
        beforeAll(() => {
            Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID});
        });
        afterAll(() => {
            Onyx.clear([ONYXKEYS.SESSION]);
        });

        it('should determine RBR visibility according to violation and hold conditions', () => {
            const functionArgs = {
                ...basicProps,
                violations: [{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION, transactionID: 123, showInReview: true}],
            };
            const result = createTransactionPreviewConditionals(functionArgs);
            expect(result.shouldShowRBR).toBeTruthy();
        });

        it('should determine RBR visibility according to whether there is a receipt error', () => {
            const functionArgs = {
                ...basicProps,
                transaction: {
                    ...basicProps.transaction,
                    errors: {
                        error1: {
                            error: CONST.IOU.RECEIPT_ERROR,
                            source: 'source.com',
                            filename: 'file_name.png',
                            action: 'replaceReceipt',
                            retryParams: {transactionID: basicProps.transaction.transactionID, source: 'source.com', transactionPolicy: undefined, transactionPolicyTagList: undefined},
                        },
                    },
                },
            };

            const result = createTransactionPreviewConditionals(functionArgs);
            expect(result.shouldShowRBR).toBeTruthy();
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
                action: {
                    ...basicProps.action,
                    originalMessage: {
                        participantAccountIDs: [999],
                        amount: 100,
                        currency: 'USD',
                        type: CONST.REPORT.ACTIONS.TYPE.IOU,
                    },
                },
                currentUserAccountID,
            };
            const result = createTransactionPreviewConditionals(functionArgs);
            expect(result.shouldShowSplitShare).toBeTruthy();
        });

        it('should show skeleton if transaction data is empty and action is not deleted', () => {
            const functionArgs = {...basicProps, transaction: undefined};
            const result = createTransactionPreviewConditionals(functionArgs);
            expect(result.shouldShowSkeleton).toBeTruthy();
        });

        it('should not show skeleton for an action the backend marked deleted, whose transaction will never arrive', () => {
            // Given a money request action deleted the way the backend reports it — `deleted` timestamps on the
            // message and the original message rather than the `isDeletedParentAction` flag — and no transaction
            const functionArgs = {
                ...basicProps,
                transaction: undefined,
                action: {
                    ...basicProps.action,
                    message: [{type: 'TEXT', text: '', deleted: '2026-07-30 10:31:05.644'}],
                },
            };

            // When the preview conditionals are computed
            const result = createTransactionPreviewConditionals(functionArgs);

            // Then the preview stays out of the loading state instead of waiting for a transaction that is gone
            expect(result.shouldShowSkeleton).toBeFalsy();
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

        it('should show split share only if user is part of the split bill transaction', () => {
            const functionArgs = {
                ...basicProps,
                isBillSplit: true,
                transactionDetails: {amount: 100},
                action: {
                    ...basicProps.action,
                    originalMessage: {
                        participantAccountIDs: [999],
                        amount: 100,
                        currency: 'USD',
                        type: CONST.REPORT.ACTIONS.TYPE.IOU,
                    },
                },
                currentUserAccountID,
            };
            const result = createTransactionPreviewConditionals(functionArgs);
            expect(result.shouldShowSplitShare).toBeTruthy();
        });

        it('should not show split share if user is not a participant', () => {
            const functionArgs = {
                ...basicProps,
                isBillSplit: true,
                transactionDetails: {amount: 100},
            };
            const result = createTransactionPreviewConditionals(functionArgs);
            expect(result.shouldShowSplitShare).toBeFalsy();
        });

        describe('with policy parameter', () => {
            it('should show RBR when policy has DEW and submit fails', () => {
                const functionArgs = {
                    ...basicProps,
                    policy: {
                        ...createRandomPolicy(1),
                        approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
                    },
                    reportActions: {
                        action1: {
                            reportActionID: 'action1',
                            actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                            created: '2024-01-02',
                            message: [{type: 'TEXT', text: 'Failed to submit'}],
                            originalMessage: {message: 'Failed to submit'},
                            pendingAction: null,
                        },
                    },
                };
                const result = createTransactionPreviewConditionals(functionArgs);
                expect(result.shouldShowRBR).toBeTruthy();
            });

            it('should show RBR for violations with paid group policy', () => {
                const functionArgs = {
                    ...basicProps,
                    policy: {
                        ...createRandomPolicy(1),
                        type: CONST.POLICY.TYPE.CORPORATE,
                    },
                    iouReport: {
                        ...basicProps.iouReport,
                        type: CONST.REPORT.TYPE.EXPENSE,
                        policyID: '1',
                    },
                    violations: [
                        {
                            name: CONST.VIOLATIONS.CUSTOM_RULES,
                            type: CONST.VIOLATION_TYPES.VIOLATION,
                            showInReview: true,
                        },
                    ],
                };
                const result = createTransactionPreviewConditionals(functionArgs);
                expect(result.shouldShowRBR).toBeTruthy();
            });
        });
    });

    describe('getViolationTranslatePath', () => {
        const message = 'Message';
        const reviewRequired = {translationPath: 'violations.reviewRequired'};
        const longMessage = 'x'.repeat(CONST.REPORT_VIOLATIONS.RBR_MESSAGE_MAX_CHARACTERS_FOR_PREVIEW + 1);

        const receiptRequiredViolation = {
            name: CONST.VIOLATIONS.RECEIPT_REQUIRED,
            type: CONST.VIOLATION_TYPES.VIOLATION,
            showInReview: true,
            data: {amount: 2500, currency: CONST.CURRENCY.USD},
        };
        const itemizedReceiptRequiredViolation = {
            name: CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED,
            type: CONST.VIOLATION_TYPES.VIOLATION,
            showInReview: true,
            data: {amount: 7500, currency: CONST.CURRENCY.USD},
        };

        const mockViolations = (count: number) =>
            [
                {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true},
                {name: CONST.VIOLATIONS.CUSTOM_RULES, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true},
                {name: CONST.VIOLATIONS.HOLD, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true},
            ].slice(0, count);

        test('returns translationPath when there is at least one violation and transaction is on hold', () => {
            expect(getViolationTranslatePath(mockViolations(1), false, message, true, false)).toEqual(reviewRequired);
        });

        test('returns translationPath if violation message is too long', () => {
            expect(getViolationTranslatePath(mockViolations(1), false, longMessage, false, false)).toEqual(reviewRequired);
        });

        test('returns translationPath when there are multiple violations', () => {
            expect(getViolationTranslatePath(mockViolations(2), false, message, false, false)).toEqual(reviewRequired);
        });

        test('returns translationPath when there is at least one violation and there are field errors', () => {
            expect(getViolationTranslatePath(mockViolations(1), true, message, false, false)).toEqual(reviewRequired);
        });

        test('returns text when there are no violations, no hold, no field errors, and message is short', () => {
            expect(getViolationTranslatePath(mockViolations(0), false, message, false, false)).toEqual({text: message});
        });

        test('returns translationPath when there are no violations but message is too long', () => {
            expect(getViolationTranslatePath(mockViolations(0), false, longMessage, false, false)).toEqual(reviewRequired);
        });

        test('returns text when both receiptRequired and itemizedReceiptRequired exist (filters to 1 violation)', () => {
            const bothReceiptViolations = [itemizedReceiptRequiredViolation, receiptRequiredViolation];
            // Should return text because receiptRequired is filtered out, leaving only 1 violation
            expect(getViolationTranslatePath(bothReceiptViolations, false, message, false, false)).toEqual({text: message});
        });

        test('returns text when only itemizedReceiptRequired exists', () => {
            expect(getViolationTranslatePath([itemizedReceiptRequiredViolation], false, message, false, false)).toEqual({text: message});
        });

        test('returns text when only receiptRequired exists', () => {
            expect(getViolationTranslatePath([receiptRequiredViolation], false, message, false, false)).toEqual({text: message});
        });

        test('returns text for customUnitRateOutOfDateRange when shouldShowOnlyViolations is true', () => {
            const rateDateViolation = {
                name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                type: CONST.VIOLATION_TYPES.WARNING,
                showInReview: true,
                data: {startDate: '2025-01-01', endDate: '2025-12-31'},
            };

            expect(getViolationTranslatePath([rateDateViolation], false, message, false, true)).toEqual({text: message});
        });

        test('filters other warning violations when shouldShowOnlyViolations is true', () => {
            const warnings = [
                {name: CONST.VIOLATIONS.MODIFIED_AMOUNT, type: CONST.VIOLATION_TYPES.WARNING, showInReview: true},
                {name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE, type: CONST.VIOLATION_TYPES.WARNING, showInReview: true},
            ];

            expect(getViolationTranslatePath(warnings, false, message, false, true)).toEqual({text: message});
        });
    });

    describe('getReviewNavigationRoute', () => {
        const threadReportID = 'threadReport123';
        const backTo = 'backRoute';
        const fakeReportID = 'fakeReportID';
        const fakeReport = {
            reportID: fakeReportID,
            policyID: 'fakePolicyID',
            ownerAccountID: 123,
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };

        it('should navigate to confirmation page when all fields match', () => {
            const transaction1 = buildOptimisticTransaction({
                transactionParams: {amount: 100, currency: 'USD', reportID: fakeReportID, comment: '', attendees: [], created: '2024-01-01'},
            });
            const transaction2 = buildOptimisticTransaction({
                transactionParams: {amount: 100, currency: 'USD', reportID: fakeReportID, comment: '', attendees: [], created: '2024-01-01'},
            });

            const route = getReviewNavigationRoute(backTo, threadReportID, transaction1, [transaction2], undefined, undefined, {}, fakeReport);
            expect(route).toContain('backRoute/confirm');
        });

        it('should navigate to merchant review page when merchants differ', () => {
            const transaction1 = {
                ...buildOptimisticTransaction({
                    transactionParams: {amount: 100, currency: 'USD', reportID: fakeReportID, comment: '', attendees: [], created: '2024-01-01'},
                }),
                merchant: 'Merchant A',
            };
            const transaction2 = {
                ...buildOptimisticTransaction({
                    transactionParams: {amount: 100, currency: 'USD', reportID: fakeReportID, comment: '', attendees: [], created: '2024-01-01'},
                }),
                merchant: 'Merchant B',
            };

            const route = getReviewNavigationRoute(backTo, threadReportID, transaction1, [transaction2], undefined, undefined, {}, fakeReport);
            expect(route).toContain('backRoute/merchant');
        });

        it('should navigate to tag review page when tags differ with single-level policyTags', () => {
            const policyTags = {
                tagList1: {
                    name: 'Department',
                    required: false,
                    orderWeight: 0,
                    tags: {
                        Engineering: {name: 'Engineering', enabled: true},
                        Marketing: {name: 'Marketing', enabled: true},
                    },
                },
            };

            const transaction1 = {
                ...buildOptimisticTransaction({
                    transactionParams: {amount: 100, currency: 'USD', reportID: fakeReportID, comment: '', attendees: [], created: '2024-01-01'},
                }),
                tag: 'Engineering',
            };
            const transaction2 = {
                ...buildOptimisticTransaction({
                    transactionParams: {amount: 100, currency: 'USD', reportID: fakeReportID, comment: '', attendees: [], created: '2024-01-01'},
                }),
                tag: 'Marketing',
            };

            const fakePolicy = {...createRandomPolicy(0), id: 'fakePolicyID', areTagsEnabled: true};
            const route = getReviewNavigationRoute(backTo, threadReportID, transaction1, [transaction2], fakePolicy, undefined, policyTags, fakeReport);
            expect(route).toContain('backRoute/transaction-duplicate-tag');
        });

        it('should skip tag review when policyTags filters out disabled tags', () => {
            const policyTags = {
                tagList1: {
                    name: 'Department',
                    required: false,
                    orderWeight: 0,
                    tags: {
                        Engineering: {name: 'Engineering', enabled: true},
                        Marketing: {name: 'Marketing', enabled: false},
                    },
                },
            };

            const transaction1 = {
                ...buildOptimisticTransaction({
                    transactionParams: {amount: 100, currency: 'USD', reportID: fakeReportID, comment: '', attendees: [], created: '2024-01-01'},
                }),
                tag: 'Engineering',
            };
            const transaction2 = {
                ...buildOptimisticTransaction({
                    transactionParams: {amount: 100, currency: 'USD', reportID: fakeReportID, comment: '', attendees: [], created: '2024-01-01'},
                }),
                tag: 'Marketing',
            };

            const fakePolicy = {...createRandomPolicy(0), id: 'fakePolicyID', areTagsEnabled: true};
            const route = getReviewNavigationRoute(backTo, threadReportID, transaction1, [transaction2], fakePolicy, undefined, policyTags, fakeReport);
            // Since Marketing is disabled, only 1 enabled tag available, so tag review is skipped
            expect(route).toContain('backRoute/confirm');
        });
    });

    describe('getUniqueActionErrorsForTransaction', () => {
        test('returns an empty array if there are no actions', () => {
            expect(getUniqueActionErrorsForTransaction({}, undefined)).toEqual([]);
        });

        test('returns unique error messages from report actions', () => {
            const actions = createMock<ReportActions>({
                /* eslint-disable @typescript-eslint/naming-convention */
                1: {errors: {a: 'Error A', b: 'Error B'}},
                2: {errors: {c: 'Error C', a: 'Error A2'}},
                3: {errors: {a: 'Error A', d: 'Error D'}},
                /* eslint-enable @typescript-eslint/naming-convention */
            });

            const expectedErrors = ['Error B', 'Error C', 'Error D'];
            expect(getUniqueActionErrorsForTransaction(actions, undefined).sort()).toEqual(expectedErrors.sort());
        });

        test('returns the latest error message if multiple errors exist under a single action', () => {
            const actions = createMock<ReportActions>({
                /* eslint-disable @typescript-eslint/naming-convention */
                1: {errors: {z: 'Error Z2', a: 'Error A', f: 'Error Z'}},
                /* eslint-enable @typescript-eslint/naming-convention */
            });

            expect(getUniqueActionErrorsForTransaction(actions, undefined)).toEqual(['Error Z2']);
        });

        test('filters out non-string error messages', () => {
            const actions = createMock<ReportActions>({
                /* eslint-disable @typescript-eslint/naming-convention */
                1: {
                    // @ts-expect-error - This deliberately malformed error value tests filtering non-string messages.
                    errors: {a: 404, b: 'Error B'},
                },
                2: {errors: {c: null, d: 'Error D'}},
                /* eslint-enable @typescript-eslint/naming-convention */
            });

            expect(getUniqueActionErrorsForTransaction(actions, undefined)).toEqual(['Error B', 'Error D']);
        });
    });

    describe('transactionHasRBR', () => {
        const rbrEmail = basicProps.currentUserEmail;
        const rbrAccountID = basicProps.currentUserAccountID;
        const rbrReport = basicProps.iouReport;
        const rbrPolicy = basicProps.policy;

        it('should return false for a clean transaction with no violations', () => {
            expect(transactionHasRBR(basicProps.transaction, [], rbrEmail, rbrAccountID, rbrReport, undefined, rbrPolicy)).toBe(false);
        });

        it('should return true for a transaction with violation-type violations', () => {
            const violations = [{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true}];
            expect(transactionHasRBR(basicProps.transaction, violations, rbrEmail, rbrAccountID, rbrReport, undefined, rbrPolicy)).toBe(true);
        });

        it('should return true for a transaction with warning-type violations', () => {
            const violations = [{name: CONST.VIOLATIONS.CUSTOM_RULES, type: CONST.VIOLATION_TYPES.WARNING, showInReview: true}];
            expect(transactionHasRBR(basicProps.transaction, violations, rbrEmail, rbrAccountID, rbrReport, undefined, rbrPolicy)).toBe(true);
        });

        it('should return true for a transaction on hold', () => {
            const heldTransaction = {...basicProps.transaction, comment: {hold: 'true'}};
            expect(transactionHasRBR(heldTransaction, [], rbrEmail, rbrAccountID, rbrReport, undefined, rbrPolicy)).toBe(true);
        });

        it('should return true for a transaction with missing merchant on an expense report', () => {
            const expenseReport = {...basicProps.iouReport, type: CONST.REPORT.TYPE.EXPENSE};
            const transactionMissingMerchant = {...basicProps.transaction, merchant: '', modifiedMerchant: '', created: '2024-01-01'};
            expect(transactionHasRBR(transactionMissingMerchant, [], rbrEmail, rbrAccountID, expenseReport, undefined, rbrPolicy)).toBe(true);
        });

        it('should return true for a transaction with receipt error', () => {
            const transactionWithReceiptError = {
                ...basicProps.transaction,
                errors: {
                    error1: {
                        error: CONST.IOU.RECEIPT_ERROR,
                        source: 'source.com',
                        filename: 'file_name.png',
                        action: 'replaceReceipt',
                        retryParams: {transactionID: basicProps.transaction.transactionID, source: 'source.com', transactionPolicy: undefined},
                    },
                },
            };
            expect(transactionHasRBR(transactionWithReceiptError, [], rbrEmail, rbrAccountID, rbrReport, undefined, rbrPolicy)).toBe(true);
        });

        it('should return false for undefined transaction', () => {
            expect(transactionHasRBR(undefined, [], rbrEmail, rbrAccountID, rbrReport, undefined, rbrPolicy)).toBe(false);
        });

        it('should return false for notice-type violations only', () => {
            const violations = [{name: CONST.VIOLATIONS.CUSTOM_RULES, type: CONST.VIOLATION_TYPES.NOTICE, showInReview: true}];
            expect(transactionHasRBR(basicProps.transaction, violations, rbrEmail, rbrAccountID, rbrReport, undefined, rbrPolicy)).toBe(false);
        });

        it('should return false for dismissed violation-type violations', () => {
            const userEmail = 'user@example.com';
            const violations = [{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true}];
            const transactionWithDismissal = {
                ...basicProps.transaction,
                comment: {
                    ...basicProps.transaction.comment,
                    dismissedViolations: {
                        [CONST.VIOLATIONS.MISSING_CATEGORY]: {[userEmail]: 'dismissed'},
                    },
                },
            };
            expect(transactionHasRBR(transactionWithDismissal, violations, userEmail, rbrAccountID, rbrReport, undefined, rbrPolicy)).toBe(false);
        });

        it('should return false for held transaction on a fully settled report', async () => {
            const settledReport = {
                ...basicProps.iouReport,
                statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${settledReport.reportID}`, settledReport);
            await waitForBatchedUpdates();
            const heldTransaction = {...basicProps.transaction, comment: {hold: 'true'}};
            expect(transactionHasRBR(heldTransaction, [], rbrEmail, rbrAccountID, settledReport, undefined, rbrPolicy)).toBe(false);
        });

        it('should return false for held transaction on a fully approved report', () => {
            const approvedReport = {
                ...basicProps.iouReport,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            };
            const heldTransaction = {...basicProps.transaction, comment: {hold: 'true'}};
            expect(transactionHasRBR(heldTransaction, [], rbrEmail, rbrAccountID, approvedReport, undefined, rbrPolicy)).toBe(false);
        });

        it('should return true for notice-type violations on a paid group policy', async () => {
            const paidGroupPolicy = {
                ...createRandomPolicy(1),
                type: CONST.POLICY.TYPE.CORPORATE,
            };
            const expenseReport = {
                ...basicProps.iouReport,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: paidGroupPolicy.id,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${paidGroupPolicy.id}`, paidGroupPolicy);
            await waitForBatchedUpdates();
            const violations = [{name: CONST.VIOLATIONS.CUSTOM_RULES, type: CONST.VIOLATION_TYPES.NOTICE, showInReview: true}];
            expect(transactionHasRBR(basicProps.transaction, violations, rbrEmail, rbrAccountID, expenseReport, undefined, paidGroupPolicy)).toBe(true);
        });

        it('should return true for a distance request with MODIFIED_AMOUNT violation', () => {
            const distanceTransaction = {
                ...basicProps.transaction,
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {customUnitRateID: 'rate1', name: CONST.CUSTOM_UNITS.NAME_DISTANCE},
                },
            };
            const violations = [{name: CONST.VIOLATIONS.MODIFIED_AMOUNT, type: CONST.VIOLATION_TYPES.NOTICE, showInReview: true}];
            expect(transactionHasRBR(distanceTransaction, violations, rbrEmail, rbrAccountID, rbrReport, undefined, rbrPolicy)).toBe(true);
        });

        it('should return true when there are report action errors for the transaction', () => {
            const reportActionsWithErrors = createMock<ReportActions>({
                action1: {
                    reportActionID: 'action1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    originalMessage: {IOUTransactionID: basicProps.transaction.transactionID, type: CONST.IOU.REPORT_ACTION_TYPE.CREATE},
                    errors: {error1: 'Something went wrong'},
                    created: '2024-01-01',
                    message: [],
                    pendingAction: null,
                },
            });
            expect(transactionHasRBR(basicProps.transaction, [], rbrEmail, rbrAccountID, rbrReport, undefined, rbrPolicy, reportActionsWithErrors)).toBe(true);
        });

        it('should return true when policy has DEW and there is a submit failure', () => {
            const dewPolicy = {
                ...createRandomPolicy(1),
                approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
            };
            const dewReportActions = createMock<ReportActions>({
                action1: {
                    reportActionID: 'action1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                    created: '2024-01-02',
                    message: [{type: 'TEXT', text: 'Failed to submit'}],
                    originalMessage: {message: 'Failed to submit'},
                    pendingAction: null,
                },
            });
            expect(transactionHasRBR(basicProps.transaction, [], rbrEmail, rbrAccountID, rbrReport, undefined, dewPolicy, dewReportActions)).toBe(true);
        });

        it('should return false for a distance request with missing merchant (guarded by hasMissingSmartscanFields)', () => {
            const distanceTransaction = {
                ...basicProps.transaction,
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                merchant: '',
                modifiedMerchant: '',
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {customUnitRateID: 'rate1', name: CONST.CUSTOM_UNITS.NAME_DISTANCE},
                },
            };
            const expenseReport = {...basicProps.iouReport, type: CONST.REPORT.TYPE.EXPENSE};
            expect(transactionHasRBR(distanceTransaction, [], rbrEmail, rbrAccountID, expenseReport, undefined, rbrPolicy)).toBe(false);
        });

        it('should return false for a scanning receipt with missing fields (guarded by hasMissingSmartscanFields)', () => {
            const scanningTransaction = {
                ...basicProps.transaction,
                merchant: '',
                modifiedMerchant: '',
                receipt: {state: CONST.IOU.RECEIPT_STATE.SCANNING},
                created: '2024-01-01',
            };
            const expenseReport = {...basicProps.iouReport, type: CONST.REPORT.TYPE.EXPENSE};
            expect(transactionHasRBR(scanningTransaction, [], rbrEmail, rbrAccountID, expenseReport, undefined, rbrPolicy)).toBe(false);
        });
    });

    describe('compareByRBR', () => {
        const cbrEmail = basicProps.currentUserEmail;
        const cbrAccountID = basicProps.currentUserAccountID;
        const cbrReport = basicProps.iouReport;
        const cbrPolicy = basicProps.policy;

        const cleanTransaction = basicProps.transaction;
        const rbrTransaction = {...basicProps.transaction, transactionID: 'rbr_txn', comment: {hold: 'true'}};

        it('should return 0 when both transactions have RBR', () => {
            const secondRbrTransaction = {...basicProps.transaction, transactionID: 'rbr_txn_2', comment: {hold: 'true'}};
            expect(compareByRBR(rbrTransaction, secondRbrTransaction, undefined, cbrEmail, cbrAccountID, cbrReport, undefined, cbrPolicy)).toBe(0);
        });

        it('should return 0 when neither transaction has RBR', () => {
            const secondCleanTransaction = {...basicProps.transaction, transactionID: 'clean_txn_2'};
            expect(compareByRBR(cleanTransaction, secondCleanTransaction, undefined, cbrEmail, cbrAccountID, cbrReport, undefined, cbrPolicy)).toBe(0);
        });

        it('should return -1 when only the first transaction has RBR', () => {
            expect(compareByRBR(rbrTransaction, cleanTransaction, undefined, cbrEmail, cbrAccountID, cbrReport, undefined, cbrPolicy)).toBe(-1);
        });

        it('should return 1 when only the second transaction has RBR', () => {
            expect(compareByRBR(cleanTransaction, rbrTransaction, undefined, cbrEmail, cbrAccountID, cbrReport, undefined, cbrPolicy)).toBe(1);
        });
    });
});
