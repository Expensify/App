import type {TransactionEditPermissions, TransactionEditPermissionsParams} from '@libs/actions/TransactionInlineEdit';
import {getTransactionEditPermissions} from '@libs/actions/TransactionInlineEdit';
import CONST from '@src/CONST';
import type {Policy, PolicyCategories, PolicyTagLists, Report, ReportAction, ReportNameValuePairs, Transaction} from '@src/types/onyx';

describe('getTransactionEditPermissions', () => {
    // Use unreported transaction by default to bypass most permission checks
    const baseTransaction: Transaction = {
        transactionID: '1',
        reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
        amount: 1000,
        currency: 'USD',
        merchant: 'Test Merchant',
        created: '2024-01-01',
        comment: {
            comment: 'Test comment',
        },
    };

    const baseParentReportAction: ReportAction = {
        reportActionID: '1',
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID: 1,
        created: '2024-01-01',
        message: [],
        originalMessage: {
            IOUTransactionID: '1',
            amount: 1000,
            currency: 'USD',
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        },
    };

    const baseParentReport: Report = {
        reportID: '100',
        ownerAccountID: 1,
        managerID: 1,
        policyID: '1',
        type: CONST.REPORT.TYPE.EXPENSE,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    };

    const basePolicy: Policy = {
        id: '1',
        name: 'Test Policy',
        role: 'admin',
        type: CONST.POLICY.TYPE.TEAM,
        owner: '',
        outputCurrency: 'USD',
        isPolicyExpenseChatEnabled: false,
        areCategoriesEnabled: true,
    };

    const baseParams: TransactionEditPermissionsParams = {
        transaction: baseTransaction,
        parentReportAction: baseParentReportAction,
        parentReport: baseParentReport,
        policy: basePolicy,
    };

    const policyCategories: PolicyCategories = {
        Food: {name: 'Food', enabled: true},
        Travel: {name: 'Travel', enabled: true},
    };

    const singleLevelTags: PolicyTagLists = {
        Tag: {
            name: 'Tag',
            required: false,
            orderWeight: 1,
            tags: {
                Project1: {name: 'Project1', enabled: true},
                Project2: {name: 'Project2', enabled: true},
            },
        },
    };

    const baseUnreportedParams: TransactionEditPermissionsParams = {
        ...baseParams,
        parentReportAction: undefined,
        parentReport: undefined,
        policyCategories,
        policyTags: singleLevelTags,
    };

    const allFalsePermissions: TransactionEditPermissions = {
        canEditDate: false,
        canEditMerchant: false,
        canEditDescription: false,
        canEditCategory: false,
        canEditAmount: false,
        canEditTag: false,
    } as const;

    describe('disabled flag', () => {
        it('should return all false when disabled is true', () => {
            const permissions = getTransactionEditPermissions({
                ...baseParams,
                disabled: true,
            });

            expect(permissions).toEqual(allFalsePermissions);
        });
    });

    describe('missing transaction', () => {
        it('should return all false when transaction is undefined', () => {
            const permissions = getTransactionEditPermissions({
                ...baseParams,
                transaction: undefined,
            });

            expect(permissions).toEqual(allFalsePermissions);
        });
    });

    describe('scanning transactions', () => {
        it('should handle field permissions correctly while transaction is scanning', () => {
            const scanningTransaction: Transaction = {
                ...baseTransaction,
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                amount: 0,
                receipt: {
                    state: CONST.IOU.RECEIPT_STATE.SCANNING,
                },
            };

            const permissions = getTransactionEditPermissions({
                ...baseUnreportedParams,
                transaction: scanningTransaction,
            });

            expect(permissions).toMatchObject({
                canEditCategory: true,
                canEditDate: true,
                canEditDescription: true,
                canEditTag: true,
                // Amount and merchant editing should be disabled for scanning transactions
                canEditAmount: false,
                canEditMerchant: false,
            } satisfies TransactionEditPermissions);
        });
    });

    describe('distance requests', () => {
        it('should handle field permissions correctly for distance requests', () => {
            const distanceTransaction: Transaction = {
                ...baseTransaction,
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    },
                },
            };

            const permissions = getTransactionEditPermissions({
                ...baseUnreportedParams,
                transaction: distanceTransaction,
            });

            expect(permissions).toMatchObject({
                canEditCategory: true,
                canEditDate: true,
                canEditDescription: true,
                canEditTag: true,
                canEditAmount: true,
                // Merchant editing should be disabled for distance requests
                canEditMerchant: false,
            } satisfies TransactionEditPermissions);
        });
    });

    describe('split expenses', () => {
        it('should handle field permissions correctly for split expense children', () => {
            const splitTransaction: Transaction = {
                ...baseTransaction,
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                comment: {
                    originalTransactionID: 'original123',
                    source: CONST.IOU.TYPE.SPLIT,
                },
            };

            const originalTransaction: Transaction = {
                ...baseTransaction,
                transactionID: 'original123',
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                comment: {},
            };

            const permissions = getTransactionEditPermissions({
                ...baseUnreportedParams,
                transaction: splitTransaction,
                originalTransaction,
            });

            expect(permissions).toMatchObject({
                canEditCategory: true,
                canEditDate: true,
                canEditDescription: true,
                canEditTag: true,
                canEditMerchant: true,
                // Amount editing should be disabled for split expense children
                canEditAmount: false,
            } satisfies TransactionEditPermissions);
        });
    });

    describe('category permissions', () => {
        it('should disable category editing when categories are not enabled on policy', () => {
            const policyWithoutCategories: Policy = {
                ...basePolicy,
                areCategoriesEnabled: false,
            };

            const permissions = getTransactionEditPermissions({
                ...baseUnreportedParams,
                policy: policyWithoutCategories,
            });

            expect(permissions.canEditCategory).toBe(false);
        });

        it('should enable category editing when transaction already has a category', () => {
            const transactionWithCategory: Transaction = {
                ...baseTransaction,
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                category: 'Food',
            };

            const permissions = getTransactionEditPermissions({
                ...baseUnreportedParams,
                transaction: transactionWithCategory,
            });

            expect(permissions.canEditCategory).toBe(true);
        });
    });

    describe('tag permissions', () => {
        it('should disable tag editing for multi-level tags', () => {
            const multiLevelTags: PolicyTagLists = {
                Department: {
                    name: 'Department',
                    required: false,
                    orderWeight: 1,
                    tags: {
                        Engineering: {name: 'Engineering', enabled: true},
                    },
                },
                Team: {
                    name: 'Team',
                    required: false,
                    orderWeight: 2,
                    tags: {
                        Frontend: {name: 'Frontend', enabled: true},
                    },
                },
            };

            const permissions = getTransactionEditPermissions({
                ...baseUnreportedParams,
                policyTags: multiLevelTags,
            });

            expect(permissions.canEditTag).toBe(false);
        });

        it('should enable tag editing when transaction already has a tag', () => {
            const transactionWithTag: Transaction = {
                ...baseTransaction,
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                tag: 'Project1',
            };

            const permissions = getTransactionEditPermissions({
                ...baseUnreportedParams,
                transaction: transactionWithTag,
                policyTags: undefined,
            });

            expect(permissions.canEditTag).toBe(true);
        });
    });

    describe('unreported expenses', () => {
        const unreportedTransaction: Transaction = {
            ...baseTransaction,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
        };

        it('should allow editing all fields', () => {
            const permissions = getTransactionEditPermissions({
                ...baseUnreportedParams,
                transaction: unreportedTransaction,
            });

            expect(permissions).toMatchObject({
                canEditAmount: true,
                canEditDate: true,
                canEditDescription: true,
                canEditMerchant: true,
                canEditCategory: true,
                canEditTag: true,
            } satisfies TransactionEditPermissions);
        });

        it('should disable category and tag editing without available options', () => {
            const permissions = getTransactionEditPermissions({
                ...baseUnreportedParams,
                transaction: unreportedTransaction,
                policyCategories: undefined,
                policyTags: undefined,
            });

            expect(permissions).toMatchObject({
                canEditAmount: true,
                canEditDate: true,
                canEditDescription: true,
                canEditMerchant: true,
                canEditCategory: false,
                canEditTag: false,
            } satisfies TransactionEditPermissions);
        });

        it('should respect scanning restrictions', () => {
            const permissions = getTransactionEditPermissions({
                ...baseUnreportedParams,
                transaction: {
                    ...unreportedTransaction,
                    merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                    amount: 0,
                    receipt: {state: CONST.IOU.RECEIPT_STATE.SCANNING},
                },
            });

            expect(permissions).toMatchObject({
                canEditAmount: false,
                canEditMerchant: false,
            } satisfies Partial<TransactionEditPermissions>);
        });

        it('should respect distance request restrictions', () => {
            const permissions = getTransactionEditPermissions({
                ...baseUnreportedParams,
                transaction: {
                    ...unreportedTransaction,
                    comment: {
                        type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                        customUnit: {name: CONST.CUSTOM_UNITS.NAME_DISTANCE},
                    },
                },
            });

            expect(permissions).toMatchObject({
                canEditMerchant: false,
            } satisfies Partial<TransactionEditPermissions>);
        });

        it('should disable category editing when workspace selection is required', () => {
            const permissions = getTransactionEditPermissions({
                ...baseUnreportedParams,
                transaction: unreportedTransaction,
                // No policy context yet since workspace selection is pending
                policy: undefined,
                shouldSelectPolicyForUnreported: true,
            });

            expect(permissions).toMatchObject({
                canEditCategory: false,
            } satisfies Partial<TransactionEditPermissions>);
        });
    });

    describe('archived reports', () => {
        it('should disable all editing when chat report is archived', () => {
            const reportedTransaction: Transaction = {
                ...baseTransaction,
                reportID: '100',
            };

            const chatReportNVP: ReportNameValuePairs = {
                private_isArchived: 'true',
            };

            const permissions = getTransactionEditPermissions({
                ...baseParams,
                transaction: reportedTransaction,
                chatReportNVP,
            });

            expect(permissions).toEqual(allFalsePermissions);
        });
    });
});
