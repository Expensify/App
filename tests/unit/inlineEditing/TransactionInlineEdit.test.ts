import type {TransactionEditPermissions, TransactionEditPermissionsParams, TransactionInlineEditParams} from '@libs/actions/TransactionInlineEdit';
import {
    editTransactionAmountInline,
    editTransactionCategoryInline,
    editTransactionDateInline,
    editTransactionDescriptionInline,
    editTransactionMerchantInline,
    editTransactionTagInline,
    getTransactionEditPermissions,
} from '@libs/actions/TransactionInlineEdit';

import {
    updateMoneyRequestAmountAndCurrency,
    updateMoneyRequestCategory,
    updateMoneyRequestDate,
    updateMoneyRequestDescription,
    updateMoneyRequestMerchant,
    updateMoneyRequestTag,
} from '@userActions/IOU/UpdateMoneyRequest';
import {createTransactionThreadReport} from '@userActions/Report';
import type * as ReportActions from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, PolicyTagLists, Report, ReportAction, ReportNameValuePairs, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

// The delegate boundary is the assertion point: editTransaction*Inline only builds params and calls through.
jest.mock('@userActions/IOU/UpdateMoneyRequest', () => ({
    updateMoneyRequestDate: jest.fn(),
    updateMoneyRequestMerchant: jest.fn(),
    updateMoneyRequestDescription: jest.fn(),
    updateMoneyRequestCategory: jest.fn(),
    updateMoneyRequestAmountAndCurrency: jest.fn(),
    updateMoneyRequestTag: jest.fn(),
}));

jest.mock('@userActions/Report', () => ({
    ...jest.requireActual<typeof ReportActions>('@userActions/Report'),
    createTransactionThreadReport: jest.fn(),
}));

const mockCreateTransactionThreadReport = jest.mocked(createTransactionThreadReport);

describe('TransactionInlineEdit', () => {
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
            areCategoriesEnabled: true,
        };

        const baseParams: TransactionEditPermissionsParams = {
            transaction: baseTransaction,
            parentReportAction: baseParentReportAction,
            parentReport: baseParentReport,
            policy: basePolicy,
            parentReportActions: undefined,
            rules: undefined,
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
                    iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
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

        describe('per diem requests', () => {
            it('should disable amount and merchant for per diem requests', () => {
                const perDiemTransaction: Transaction = {
                    ...baseTransaction,
                    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                    iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
                    comment: {
                        type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                        customUnit: {
                            name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                        },
                    },
                };

                const permissions = getTransactionEditPermissions({
                    ...baseUnreportedParams,
                    transaction: perDiemTransaction,
                });

                expect(permissions).toMatchObject({
                    canEditCategory: true,
                    canEditDate: true,
                    canEditDescription: true,
                    canEditTag: true,
                    // Amount and merchant are derived from the rate and cannot be edited
                    canEditAmount: false,
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

            it('should enable category editing when the category is missing and the policy categories have not loaded yet', () => {
                // Lazy-loaded accounts have no policyCategories in Onyx on a fresh sign-in. Without this the cell
                // deadlocks: the edit icon stays hidden, so the picker never mounts and never backfills the list.
                const permissions = getTransactionEditPermissions({
                    ...baseUnreportedParams,
                    policyCategories: undefined,
                });

                expect(permissions.canEditCategory).toBe(true);
            });

            it('should disable category editing when the category is missing and the loaded policy categories are empty', () => {
                const permissions = getTransactionEditPermissions({
                    ...baseUnreportedParams,
                    policyCategories: {},
                });

                expect(permissions.canEditCategory).toBe(false);
            });

            it('should disable category editing when categories are not enabled on policy and the policy categories have not loaded yet', () => {
                const policyWithoutCategories: Policy = {
                    ...basePolicy,
                    areCategoriesEnabled: false,
                };

                const permissions = getTransactionEditPermissions({
                    ...baseUnreportedParams,
                    policy: policyWithoutCategories,
                    policyCategories: undefined,
                });

                expect(permissions.canEditCategory).toBe(false);
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

            it('should enable tag editing when the tag is missing and the policy tags have not loaded yet', () => {
                // Same deadlock as categories. With the collection absent the edit icon stays hidden, so TagPicker
                // never mounts and never backfills the list.
                const permissions = getTransactionEditPermissions({
                    ...baseUnreportedParams,
                    policy: {...basePolicy, areTagsEnabled: true},
                    policyTags: undefined,
                });

                expect(permissions.canEditTag).toBe(true);
            });

            it('should disable tag editing when the tag is missing and the loaded policy tags are empty', () => {
                const permissions = getTransactionEditPermissions({
                    ...baseUnreportedParams,
                    policy: {...basePolicy, areTagsEnabled: true},
                    policyTags: {},
                });

                expect(permissions.canEditTag).toBe(false);
            });

            it('should disable tag editing when tags are not enabled on policy and the policy tags have not loaded yet', () => {
                const permissions = getTransactionEditPermissions({
                    ...baseUnreportedParams,
                    policy: {...basePolicy, areTagsEnabled: false},
                    policyTags: undefined,
                });

                expect(permissions.canEditTag).toBe(false);
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

            // An empty collection rather than an absent one is what "no available options" means here. An absent
            // collection only tells us the lazy-loaded account hasn't fetched it yet, so the cell stays editable.
            it('should disable category and tag editing without available options', () => {
                const permissions = getTransactionEditPermissions({
                    ...baseUnreportedParams,
                    transaction: unreportedTransaction,
                    policyCategories: {},
                    policyTags: {},
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
                        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
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

            it('should respect per diem request restrictions', () => {
                const permissions = getTransactionEditPermissions({
                    ...baseUnreportedParams,
                    transaction: {
                        ...unreportedTransaction,
                        iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
                        comment: {
                            type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                            customUnit: {name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL},
                        },
                    },
                });

                expect(permissions).toMatchObject({
                    canEditAmount: false,
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

        describe('parentReportActions', () => {
            const submitterAccountID = 7;
            const submitterEmail = 'inline-edit-submitter@test.com';
            const approverAccountID = 8;
            const approverEmail = 'inline-edit-approver@test.com';
            const forwardedPolicyID = 'inline-edit-forwarded-policy';
            const forwardedReportID = 'inline-edit-forwarded-report';
            const forwardedTransactionID = 'inline-edit-forwarded-transaction';

            // A corporate policy where the submitter reports to the approver, so once the report is forwarded past the approver the submitter can no longer edit
            const corporatePolicy: Policy = {
                ...basePolicy,
                id: forwardedPolicyID,
                role: CONST.POLICY.ROLE.USER,
                type: CONST.POLICY.TYPE.CORPORATE,
                employeeList: {
                    [submitterEmail]: {
                        email: submitterEmail,
                        role: CONST.POLICY.ROLE.USER,
                        submitsTo: approverEmail,
                    },
                },
            };
            const submittedReport: Report = {
                reportID: forwardedReportID,
                policyID: forwardedPolicyID,
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: submitterAccountID,
                managerID: approverAccountID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };
            const reportedTransaction: Transaction = {
                ...baseTransaction,
                transactionID: forwardedTransactionID,
                reportID: forwardedReportID,
            };
            const iouAction: ReportAction = {
                ...baseParentReportAction,
                reportActionID: '900',
                reportID: forwardedReportID,
                // An empty message array reads as a deleted action, which would fail canEditMoneyRequest before the forwarded check
                message: [{type: CONST.REPORT.MESSAGE.TYPE.TEXT, text: ''}],
                actorAccountID: submitterAccountID,
                originalMessage: {
                    IOUTransactionID: forwardedTransactionID,
                    amount: 1000,
                    currency: 'USD',
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };
            const submittedAction: ReportAction = {
                reportActionID: '901',
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                created: '2026-05-01 10:00:00',
                message: [],
                originalMessage: {amount: 1000, currency: 'USD'},
            };
            const forwardedAction: ReportAction = {
                reportActionID: '902',
                actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
                created: '2026-05-01 11:00:00',
                message: [],
                originalMessage: {amount: 1000, currency: 'USD'},
            };
            const forwardedCheckParams: TransactionEditPermissionsParams = {
                ...baseParams,
                transaction: reportedTransaction,
                parentReport: submittedReport,
                parentReportAction: iouAction,
                policy: corporatePolicy,
            };

            beforeAll(async () => {
                // canEditMoneyRequest resolves the submitter and the approver route from the session, personal details and policy
                Onyx.init({keys: ONYXKEYS});
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {email: submitterEmail, accountID: submitterAccountID},
                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                        [submitterAccountID]: {accountID: submitterAccountID, login: submitterEmail},
                        [approverAccountID]: {accountID: approverAccountID, login: approverEmail},
                    },
                });
                await waitForBatchedUpdates();
            });

            it('should keep the transaction editable when the passed parentReportActions show no forward since the last submit', () => {
                const permissions = getTransactionEditPermissions({
                    ...forwardedCheckParams,
                    parentReportActions: {[submittedAction.reportActionID]: submittedAction},
                });

                expect(permissions.canEditDescription).toBe(true);
            });

            it('should disable all editing when the passed parentReportActions show the report was forwarded after the last submit', () => {
                const permissions = getTransactionEditPermissions({
                    ...forwardedCheckParams,
                    parentReportActions: {
                        [submittedAction.reportActionID]: submittedAction,
                        [forwardedAction.reportActionID]: forwardedAction,
                    },
                });

                expect(permissions).toEqual(allFalsePermissions);
            });
        });
    });

    describe('editTransaction*Inline', () => {
        const TRANSACTION_ID = '7777777777777777777';
        const SELF_DM_REPORT_ID = '4242424242';

        /** An unreported expense as the Search table renders it, i.e. straight out of the search snapshot. */
        const snapshotTransaction: Transaction = {
            transactionID: TRANSACTION_ID,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            amount: -10000,
            currency: 'USD',
            merchant: 'Coffee',
            created: '2026-08-12',
            comment: {},
        };

        const selfDMReport: Report = {
            reportID: SELF_DM_REPORT_ID,
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
            type: CONST.REPORT.TYPE.CHAT,
        };

        function buildParams(): TransactionInlineEditParams {
            return {
                isVendorMatchingBetaEnabled: false,
                hash: 123456,
                isOffline: false,
                transactionID: TRANSACTION_ID,
                transaction: snapshotTransaction,
                parentReport: selfDMReport,
                parentReportAction: undefined,
                transactionThreadReport: undefined,
                policy: undefined,
                policyCategories: {},
                policyTags: undefined,
                reportPolicyTags: undefined,
                policyRecentlyUsedCategories: undefined,
                policyRecentlyUsedTags: undefined,
                conciergeChat: undefined,
                isSelfTourViewed: true,
                hasCompletedGuidedSetupFlow: true,
                personalDetailsList: undefined,
                delegateAccountID: undefined,
                isTrackIntentUser: false,
                getCurrencyDecimals: () => 2,
                getCurrencySymbol: () => '$',
                transactions: {[`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`]: snapshotTransaction},
                transactionViolations: {},
                isASAPSubmitBetaEnabled: false,
                introSelected: undefined,
                currentUserAccountID: CONST.DEFAULT_NUMBER_ID,
                currentUserEmail: '',
                rules: undefined,
            };
        }

        beforeEach(() => jest.clearAllMocks());

        // Onyx is never initialized here, so the module-level transaction cache is empty. That is exactly
        // the state of a Search row the user has not opened: it exists only in the search snapshot.
        it.each([
            ['date', () => editTransactionDateInline(buildParams(), '2026-01-15', undefined), () => updateMoneyRequestDate, {value: '2026-01-15'}],
            ['merchant', () => editTransactionMerchantInline(buildParams(), 'Cafe'), () => updateMoneyRequestMerchant, {value: 'Cafe'}],
            ['description', () => editTransactionDescriptionInline(buildParams(), 'Lunch'), () => updateMoneyRequestDescription, {comment: 'Lunch'}],
            ['category', () => editTransactionCategoryInline(buildParams(), 'Benefits'), () => updateMoneyRequestCategory, {category: 'Benefits'}],
            ['amount', () => editTransactionAmountInline(buildParams(), 500), () => updateMoneyRequestAmountAndCurrency, {amount: 500}],
            ['tag', () => editTransactionTagInline(buildParams(), 'Project1'), () => updateMoneyRequestTag, {tag: 'Project1'}],
        ])('forwards the caller transaction when editing %s', (_field, edit, getDelegate, expectedChange) => {
            edit();

            expect(getDelegate()).toHaveBeenCalledWith(expect.objectContaining({transactionID: TRANSACTION_ID, transaction: snapshotTransaction, ...expectedChange}));
        });

        it('clears the merchant instead of discarding the edit', () => {
            // Given an unreported expense, where an empty merchant is a real clear rather than a required-field failure
            // When the merchant is cleared
            const rejection = editTransactionMerchantInline(buildParams(), '');

            // Then the edit is saved as the partial merchant, so there is no error to toast
            expect(rejection).toBeUndefined();
            expect(updateMoneyRequestMerchant).toHaveBeenCalledWith(expect.objectContaining({value: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT}));
        });

        it('rejects an empty merchant on an expense report without saving', () => {
            // Given a reported expense, where clearing the merchant is not allowed the way it is for an unreported expense
            const expenseReport: Report = {reportID: 'expense-report-1', type: CONST.REPORT.TYPE.EXPENSE};
            const reportedTransaction: Transaction = {...snapshotTransaction, reportID: expenseReport.reportID};
            const parentReportAction = {
                reportActionID: '999',
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                created: '2026-08-12',
            } as ReportAction;

            // When the merchant is cleared to whitespace
            const rejection = editTransactionMerchantInline({...buildParams(), parentReport: expenseReport, transaction: reportedTransaction, parentReportAction}, '   ');

            // Then the edit is dropped before any write, including the transaction thread that building params would create
            expect(rejection).toEqual(['common.error.fieldRequired']);
            expect(updateMoneyRequestMerchant).not.toHaveBeenCalled();
            expect(mockCreateTransactionThreadReport).not.toHaveBeenCalled();
        });

        it('rejects a placeholder merchant without saving', () => {
            // Given the seeded "(none)" placeholder, which is not a merchant the user actually entered
            // When that placeholder is saved from the table
            const rejection = editTransactionMerchantInline(buildParams(), CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT);

            // Then the edit is dropped, because saving the placeholder would look like a successful clear
            expect(rejection).toEqual(['iou.error.invalidMerchant']);
            expect(updateMoneyRequestMerchant).not.toHaveBeenCalled();
        });

        it('rejects a merchant past the byte limit without saving', () => {
            // Given a merchant longer than the form allows, measured in bytes the same way the merchant step does
            const tooLongMerchant = 'a'.repeat(CONST.MERCHANT_NAME_MAX_BYTES + 1);

            // When that merchant is saved from the table
            const rejection = editTransactionMerchantInline(buildParams(), tooLongMerchant);

            // Then the edit is dropped so the cell can revert instead of storing a value the form would refuse
            expect(rejection).toEqual(['common.error.characterLimitExceedCounter', tooLongMerchant.length, CONST.MERCHANT_NAME_MAX_BYTES]);
            expect(updateMoneyRequestMerchant).not.toHaveBeenCalled();
        });

        it('rejects a merchant that contains an HTML tag without saving', () => {
            // Given a merchant the form would reject for HTML, which inline edit never sees because it skips FormProvider
            // When that merchant is saved from the table
            const rejection = editTransactionMerchantInline(buildParams(), '<script>x</script>');

            // Then the edit is dropped with the same invalid character failure the form shows
            expect(rejection).toEqual(['common.error.invalidCharacter']);
            expect(updateMoneyRequestMerchant).not.toHaveBeenCalled();
        });

        it('rejects a zero amount on an invoice without saving', () => {
            // Given an invoice, where a zero amount is invalid even though an unreported expense can store one
            const invoiceReport: Report = {reportID: 'invoice-report-1', type: CONST.REPORT.TYPE.INVOICE};

            // When the amount is set to zero
            const rejection = editTransactionAmountInline({...buildParams(), parentReport: invoiceReport}, 0);

            // Then the edit is dropped so the previous amount stays in place
            expect(rejection).toEqual(['iou.error.invalidAmount']);
            expect(updateMoneyRequestAmountAndCurrency).not.toHaveBeenCalled();
        });

        it('rejects a description past the character limit without saving', () => {
            // Given a description longer than the description step allows
            const tooLongDescription = 'a'.repeat(CONST.DESCRIPTION_LIMIT + 1);

            // When that description is saved from the table
            const rejection = editTransactionDescriptionInline(buildParams(), tooLongDescription);

            // Then the edit is dropped so the cell reverts instead of storing text the description step would refuse
            expect(rejection).toEqual(['common.error.characterLimitExceedCounter', tooLongDescription.length, CONST.DESCRIPTION_LIMIT]);
            expect(updateMoneyRequestDescription).not.toHaveBeenCalled();
        });

        it('rejects a description that contains an HTML tag without saving', () => {
            // Given a description that is also past the length limit, so both failures apply at once
            const taggedDescription = `<b>${'a'.repeat(CONST.DESCRIPTION_LIMIT)}</b>`;

            // When that description is saved from the table
            const rejection = editTransactionDescriptionInline(buildParams(), taggedDescription);

            // Then HTML wins, matching FormProvider, which replaces the length error when a tag is present
            expect(rejection).toEqual(['common.error.invalidCharacter']);
            expect(updateMoneyRequestDescription).not.toHaveBeenCalled();
        });

        describe('transaction thread creation', () => {
            const CONCIERGE_CHAT: Report = {reportID: 'concierge-inline-edit-1'};
            const CREATED_THREAD: Report = {reportID: 'inline-edit-thread-1'};

            /** An IOU action with no childReportID, so no transaction thread can be resolved from it. */
            const iouParentReportAction = {
                reportActionID: '999',
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                created: '2026-08-12',
            } as ReportAction;

            it('creates the missing transaction thread with the conciergeChat threaded through', () => {
                mockCreateTransactionThreadReport.mockReturnValue(CREATED_THREAD);

                // A parent IOU action but no transaction thread anywhere: the edit must create the thread first.
                editTransactionMerchantInline({...buildParams(), parentReportAction: iouParentReportAction, conciergeChat: CONCIERGE_CHAT}, 'Cafe');

                // The threaded conciergeChat reaches createTransactionThreadReport instead of the deprecated module-level lookup...
                expect(mockCreateTransactionThreadReport).toHaveBeenCalledWith(
                    expect.objectContaining({conciergeChat: CONCIERGE_CHAT, iouReportAction: iouParentReportAction, transaction: snapshotTransaction}),
                );
                // ...and the created thread is what the edit call receives.
                expect(updateMoneyRequestMerchant).toHaveBeenCalledWith(expect.objectContaining({transactionThreadReport: CREATED_THREAD}));
            });

            it('reuses an existing transaction thread without creating a new one', () => {
                const existingThread: Report = {reportID: 'existing-thread-1'};

                editTransactionMerchantInline({...buildParams(), parentReportAction: iouParentReportAction, transactionThreadReport: existingThread}, 'Cafe');

                expect(mockCreateTransactionThreadReport).not.toHaveBeenCalled();
                expect(updateMoneyRequestMerchant).toHaveBeenCalledWith(expect.objectContaining({transactionThreadReport: existingThread}));
            });

            it('does not create a thread when there is no parent report action to anchor it', () => {
                editTransactionMerchantInline({...buildParams(), conciergeChat: CONCIERGE_CHAT}, 'Cafe');

                expect(mockCreateTransactionThreadReport).not.toHaveBeenCalled();
                expect(updateMoneyRequestMerchant).toHaveBeenCalledWith(expect.objectContaining({transactionThreadReport: undefined}));
            });
        });
    });
});
