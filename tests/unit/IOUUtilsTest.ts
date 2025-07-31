import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import {ValueOf} from 'type-fest';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {IOURequestType} from '@libs/actions/IOU';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import * as IOUUtils from '@src/libs/IOUUtils';
import * as ReportUtils from '@src/libs/ReportUtils';
import * as TransactionUtils from '@src/libs/TransactionUtils';
import {hasAnyTransactionWithoutRTERViolation} from '@src/libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyEmployeeList, PolicyReportField, Report, ReportAction, TaxRatesWithDefault, Transaction, TransactionViolations} from '@src/types/onyx';
import {Accountant, Attendee, Participant} from '@src/types/onyx/IOU';
import {ErrorFields, Errors, OnyxValueWithOfflineFeedback, PendingAction, PendingFields} from '@src/types/onyx/OnyxCommon';
import {ACHAccount, ApprovalRule, Attributes, CompanyAddress, Connections, CustomUnit, ExpenseRule, MccGroup, PolicyDetailsForNonMembers, ProhibitedExpenses} from '@src/types/onyx/Policy';
import {InvoiceReceiver, Note, Participants, RoomVisibility, WriteCapability} from '@src/types/onyx/Report';
import type {Comment, Receipt, ReceiptErrors, Routes, SplitShares, TransactionCollectionDataSet, TransactionCustomUnit, WaypointCollection} from '@src/types/onyx/Transaction';
import {WorkspaceTravelSettings} from '@src/types/onyx/TravelSettings';
import {TripData} from '@src/types/onyx/TripData';
import createRandomPolicy from '../utils/collections/policies';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import currencyList from './currencyList.json';

const testDate = DateUtils.getDBTime();
const currentUserAccountID = 5;

function initCurrencyList() {
    Onyx.init({
        keys: ONYXKEYS,
        initialKeyStates: {
            [ONYXKEYS.CURRENCY_LIST]: currencyList,
        },
    });
    return waitForBatchedUpdates();
}

describe('IOUUtils', () => {
    describe('isIOUReportPendingCurrencyConversion', () => {
        beforeAll(() => {
            Onyx.init({
                keys: ONYXKEYS,
            });
        });

        test('Submitting an expense offline in a different currency will show the pending conversion message', () => {
            const iouReport = ReportUtils.buildOptimisticIOUReport(1, 2, 100, '1', 'USD');
            const usdPendingTransaction = TransactionUtils.buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });
            const aedPendingTransaction = TransactionUtils.buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'AED',
                    reportID: iouReport.reportID,
                },
            });
            const MergeQueries: TransactionCollectionDataSet = {};
            MergeQueries[`${ONYXKEYS.COLLECTION.TRANSACTION}${usdPendingTransaction.transactionID}`] = usdPendingTransaction;
            MergeQueries[`${ONYXKEYS.COLLECTION.TRANSACTION}${aedPendingTransaction.transactionID}`] = aedPendingTransaction;

            return Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, MergeQueries).then(() => {
                // We submitted an expense offline in a different currency, we don't know the total of the iouReport until we're back online
                expect(IOUUtils.isIOUReportPendingCurrencyConversion(iouReport)).toBe(true);
            });
        });

        test('Submitting an expense online in a different currency will not show the pending conversion message', () => {
            const iouReport = ReportUtils.buildOptimisticIOUReport(2, 3, 100, '1', 'USD');
            const usdPendingTransaction = TransactionUtils.buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });
            const aedPendingTransaction = TransactionUtils.buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'AED',
                    reportID: iouReport.reportID,
                },
            });

            const MergeQueries: TransactionCollectionDataSet = {};
            MergeQueries[`${ONYXKEYS.COLLECTION.TRANSACTION}${usdPendingTransaction.transactionID}`] = {
                ...usdPendingTransaction,
                pendingAction: null,
            };
            MergeQueries[`${ONYXKEYS.COLLECTION.TRANSACTION}${aedPendingTransaction.transactionID}`] = {
                ...aedPendingTransaction,
                pendingAction: null,
            };

            return Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, MergeQueries).then(() => {
                // We submitted an expense online in a different currency, we know the iouReport total and there's no need to show the pending conversion message
                expect(IOUUtils.isIOUReportPendingCurrencyConversion(iouReport)).toBe(false);
            });
        });
    });

    describe('calculateAmount', () => {
        beforeAll(() => initCurrencyList());

        test('103 JPY split among 3 participants including the default user should be [35, 34, 34]', () => {
            const participantsAccountIDs = [100, 101];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 10300, 'JPY', true)).toBe(3500);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 10300, 'JPY')).toBe(3400);
        });

        test('103 USD split among 3 participants including the default user should be [34.34, 34.33, 34.33]', () => {
            const participantsAccountIDs = [100, 101];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 10300, 'USD', true)).toBe(3434);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 10300, 'USD')).toBe(3433);
        });

        test('10 AFN split among 4 participants including the default user should be [1, 3, 3, 3]', () => {
            const participantsAccountIDs = [100, 101, 102];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1000, 'AFN', true)).toBe(100);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1000, 'AFN')).toBe(300);
        });

        test('10.12 USD split among 4 participants including the default user should be [2.53, 2.53, 2.53, 2.53]', () => {
            const participantsAccountIDs = [100, 101, 102];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1012, 'USD', true)).toBe(253);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1012, 'USD')).toBe(253);
        });

        test('10.12 USD split among 3 participants including the default user should be [3.38, 3.37, 3.37]', () => {
            const participantsAccountIDs = [100, 102];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1012, 'USD', true)).toBe(338);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1012, 'USD')).toBe(337);
        });

        test('0.02 USD split among 4 participants including the default user should be [-0.01, 0.01, 0.01, 0.01]', () => {
            const participantsAccountIDs = [100, 101, 102];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 2, 'USD', true)).toBe(-1);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 2, 'USD')).toBe(1);
        });

        test('1 RSD split among 3 participants including the default user should be [0.34, 0.33, 0.33]', () => {
            // RSD is a special case that we forced to have 2 decimals
            const participantsAccountIDs = [100, 101];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 100, 'RSD', true)).toBe(34);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 100, 'RSD')).toBe(33);
        });

        test('1 BHD split among 3 participants including the default user should be [0.34, 0.33, 0.33]', () => {
            // BHD has 3 decimal places, but it still produces parts with only 2 decimal places because of a backend limitation
            const participantsAccountIDs = [100, 101];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 100, 'BHD', true)).toBe(34);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 100, 'BHD')).toBe(33);
        });
    });

    describe('insertTagIntoTransactionTagsString', () => {
        test('Inserting a tag into tag string should update the tag', () => {
            expect(IOUUtils.insertTagIntoTransactionTagsString(':NY:Texas', 'California', 2)).toBe(':NY:California');
        });

        test('Inserting a tag into an index with no tags should update the tag', () => {
            expect(IOUUtils.insertTagIntoTransactionTagsString('::California', 'NY', 1)).toBe(':NY:California');
        });

        test('Inserting a tag with colon in name into tag string should keep the colon in tag', () => {
            expect(IOUUtils.insertTagIntoTransactionTagsString('East:NY:California', 'City \\: \\:', 1)).toBe('East:City \\: \\::California');
        });

        test('Remove a tag from tagString', () => {
            expect(IOUUtils.insertTagIntoTransactionTagsString('East:City \\: \\::California', '', 1)).toBe('East::California');
        });
    });
});

describe('isValidMoneyRequestType', () => {
    test('Return true for valid iou type', () => {
        Object.values(CONST.IOU.TYPE).forEach((iouType) => {
            expect(IOUUtils.isValidMoneyRequestType(iouType)).toBe(true);
        });
    });

    test('Return false for invalid iou type', () => {
        expect(IOUUtils.isValidMoneyRequestType('money')).toBe(false);
    });
});

describe('hasRTERWithoutViolation', () => {
    test('Return true if there is at least one rter without violation in transactionViolations with given transactionIDs.', async () => {
        const transactionIDWithViolation = 1;
        const transactionIDWithoutViolation = 2;
        const currentReportId = '';
        const transactionWithViolation: Transaction = {
            ...createRandomTransaction(transactionIDWithViolation),
            category: '',
            tag: '',
            created: testDate,
            reportID: currentReportId,
        };
        const transactionWithoutViolation: Transaction = {
            ...createRandomTransaction(transactionIDWithoutViolation),
            category: '',
            tag: '',
            created: testDate,
            reportID: currentReportId,
        };
        const transactionViolations = `transactionViolations_${transactionIDWithViolation}`;
        const violations: OnyxCollection<TransactionViolations> = {
            [transactionViolations]: [
                {
                    type: 'warning',
                    name: 'rter',
                    data: {
                        tooltip: "Personal Cards: Fix your card from Account Settings. Corporate Cards: ask your Expensify admin to fix your company's card connection.",
                        rterType: 'brokenCardConnection',
                    },
                    showInReview: true,
                },
            ],
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDWithViolation}`, transactionWithViolation);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDWithoutViolation}`, transactionWithoutViolation);
        expect(hasAnyTransactionWithoutRTERViolation([transactionWithoutViolation, transactionWithViolation], violations)).toBe(true);
    });

    test('Return false if there is no rter without violation in all transactionViolations with given transactionIDs.', async () => {
        const transactionIDWithViolation = 1;
        const currentReportId = '';
        const transactionWithViolation: Transaction = {
            ...createRandomTransaction(transactionIDWithViolation),
            category: '',
            tag: '',
            created: testDate,
            reportID: currentReportId,
        };
        const transactionViolations = `transactionViolations_${transactionIDWithViolation}`;
        const violations: OnyxCollection<TransactionViolations> = {
            [transactionViolations]: [
                {
                    type: 'warning',
                    name: 'rter',
                    data: {
                        tooltip: "Personal Cards: Fix your card from Account Settings. Corporate Cards: ask your Expensify admin to fix your company's card connection.",
                        rterType: 'brokenCardConnection',
                    },
                    showInReview: true,
                },
            ],
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDWithViolation}`, transactionWithViolation);
        expect(hasAnyTransactionWithoutRTERViolation([transactionWithViolation], violations)).toBe(false);
    });
});

describe('canSubmitReportInSearch', () => {
    test('Return true if report can be submitted', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID});
        const fakePolicy: Policy = {
            ...createRandomPolicy(6),
            ownerAccountID: currentUserAccountID,
            areRulesEnabled: true,
            preventSelfApproval: false,
            autoReportingFrequency: 'immediate',
            harvesting: {
                enabled: false,
            },
        };
        const expenseReport: Report = {
            ...createRandomReport(6),
            type: CONST.REPORT.TYPE.EXPENSE,
            managerID: currentUserAccountID,
            ownerAccountID: currentUserAccountID,
            policyID: fakePolicy.id,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };

        const transactionIDWithViolation = 1;
        const transactionIDWithoutViolation = 2;
        const transactionWithViolation: Transaction = {
            ...createRandomTransaction(transactionIDWithViolation),
            category: '',
            tag: '',
            created: testDate,
            reportID: expenseReport?.reportID,
        };
        const transactionWithoutViolation: Transaction = {
            ...createRandomTransaction(transactionIDWithoutViolation),
            category: '',
            tag: '',
            created: testDate,
            reportID: expenseReport?.reportID,
        };
        const transactionViolations = `transactionViolations_${transactionIDWithViolation}`;
        const violations: OnyxCollection<TransactionViolations> = {
            [transactionViolations]: [
                {
                    type: 'warning',
                    name: 'rter',
                    data: {
                        tooltip: "Personal Cards: Fix your card from Account Settings. Corporate Cards: ask your Expensify admin to fix your company's card connection.",
                        rterType: 'brokenCardConnection',
                    },
                    showInReview: true,
                },
            ],
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDWithViolation}`, transactionWithViolation);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDWithoutViolation}`, transactionWithoutViolation);
        expect(canSubmitReportInSearch(expenseReport, fakePolicy, [transactionWithViolation, transactionWithoutViolation], violations, false)).toBe(true);
    });

    test('Return true if report can be submitted after being reopened', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID});
        const fakePolicy: Policy = {
            ...createRandomPolicy(6),
            ownerAccountID: currentUserAccountID,
            areRulesEnabled: true,
            preventSelfApproval: false,
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: false,
            },
        };
        const expenseReport: Report = {
            ...createRandomReport(6),
            type: CONST.REPORT.TYPE.EXPENSE,
            managerID: currentUserAccountID,
            ownerAccountID: currentUserAccountID,
            policyID: fakePolicy.id,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`, {
            [expenseReport.reportID]: {
                actionName: CONST.REPORT.ACTIONS.TYPE.REOPENED,
            },
        });

        const transactionIDWithViolation = 1;
        const transactionIDWithoutViolation = 2;
        const transactionWithViolation: Transaction = {
            ...createRandomTransaction(transactionIDWithViolation),
            category: '',
            tag: '',
            created: testDate,
            reportID: expenseReport?.reportID,
        };
        const transactionWithoutViolation: Transaction = {
            ...createRandomTransaction(transactionIDWithoutViolation),
            category: '',
            tag: '',
            created: testDate,
            reportID: expenseReport?.reportID,
        };
        const transactionViolations = `transactionViolations_${transactionIDWithViolation}`;
        const violations: OnyxCollection<TransactionViolations> = {
            [transactionViolations]: [
                {
                    type: 'warning',
                    name: 'rter',
                    data: {
                        tooltip: "Personal Cards: Fix your card from Account Settings. Corporate Cards: ask your Expensify admin to fix your company's card connection.",
                        rterType: 'brokenCardConnection',
                    },
                    showInReview: true,
                },
            ],
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDWithViolation}`, transactionWithViolation);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDWithoutViolation}`, transactionWithoutViolation);
        expect(canSubmitReportInSearch(expenseReport, fakePolicy, [transactionWithViolation, transactionWithoutViolation], violations, false)).toBe(true);
    });

    test('Return false if report can not be submitted', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID});
        const fakePolicy: Policy = {
            ...createRandomPolicy(6),
            ownerAccountID: currentUserAccountID,
            areRulesEnabled: true,
            preventSelfApproval: false,
        };
        const expenseReport: Report = {
            ...createRandomReport(6),
            type: CONST.REPORT.TYPE.EXPENSE,
            managerID: currentUserAccountID,
            ownerAccountID: currentUserAccountID,
            policyID: fakePolicy.id,
        };

        expect(canSubmitReportInSearch(expenseReport, fakePolicy, [], {}, false)).toBe(false);
    });

    it('returns false if the report is archived', async () => {
        const policy: Policy = {
            ...createRandomPolicy(7),
            ownerAccountID: currentUserAccountID,
            areRulesEnabled: true,
            preventSelfApproval: false,
        };
        const report: Report = {
            ...createRandomReport(7),
            type: CONST.REPORT.TYPE.EXPENSE,
            managerID: currentUserAccountID,
            ownerAccountID: currentUserAccountID,
            policyID: policy.id,
        };

        // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`, {
            private_isArchived: new Date().toString(),
        });

        // Simulate how components call canModifyTask() by using the hook useReportIsArchived() to see if the report is archived
        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));
        expect(canSubmitReportInSearch(report, policy, [], {}, isReportArchived.current)).toBe(false);
    });
});

describe('Check valid amount for IOU/Expense request', () => {
    test('IOU amount should be positive', () => {
        const iouReport = ReportUtils.buildOptimisticIOUReport(1, 2, 100, '1', 'USD');
        const iouTransaction = TransactionUtils.buildOptimisticTransaction({
            transactionParams: {
                amount: 100,
                currency: 'USD',
                reportID: iouReport.reportID,
            },
        });
        const iouAmount = TransactionUtils.getAmount(iouTransaction, false, false);
        expect(iouAmount).toBeGreaterThan(0);
    });

    test('Expense amount should be negative', () => {
        const expenseReport = ReportUtils.buildOptimisticExpenseReport('212', '123', 100, 122, 'USD');
        const expenseTransaction = TransactionUtils.buildOptimisticTransaction({
            transactionParams: {
                amount: 100,
                currency: 'USD',
                reportID: expenseReport.reportID,
            },
        });
        const expenseAmount = TransactionUtils.getAmount(expenseTransaction, true, false);
        expect(expenseAmount).toBeLessThan(0);
    });

    test('Unreported expense amount should retain negative sign', () => {
        const unreportedTransaction = TransactionUtils.buildOptimisticTransaction({
            transactionParams: {
                amount: 100,
                currency: 'USD',
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            },
        });
        const unreportedAmount = TransactionUtils.getAmount(unreportedTransaction, true, false);
        expect(unreportedAmount).toBeLessThan(0);
    });
});
function canSubmitReportInSearch(
    expenseReport: {
        avatarUrl?: string;
        chatType?: ValueOf<typeof CONST.REPORT.CHAT_TYPE>;
        hasOutstandingChildRequest?: boolean;
        hasOutstandingChildTask?: boolean;
        isOwnPolicyExpenseChat?: boolean;
        isPinned?: boolean;
        lastMessageText?: string;
        lastVisibleActionCreated?: string;
        lastReadTime?: string;
        lastReadSequenceNumber?: number;
        lastMentionedTime?: string | null;
        policyAvatar?: string | null;
        policyName?: string | null;
        oldPolicyName?: string;
        hasParentAccess?: boolean;
        description?: string;
        isDeletedParentAction?: boolean;
        policyID?: string;
        reportName?: string;
        reportID: string;
        chatReportID?: string;
        stateNum?: ValueOf<typeof CONST.REPORT.STATE_NUM>;
        statusNum?: ValueOf<typeof CONST.REPORT.STATUS_NUM>;
        writeCapability?: WriteCapability;
        type?: string;
        visibility?: RoomVisibility;
        invoiceReceiver?: InvoiceReceiver;
        parentReportID?: string;
        parentReportActionID?: string;
        managerID?: number;
        lastVisibleActionLastModified?: string;
        lastMessageHtml?: string;
        lastActorAccountID?: number;
        lastActionType?: ValueOf<typeof CONST.REPORT.ACTIONS.TYPE>;
        ownerAccountID?: number;
        participants?: Participants;
        total?: number;
        unheldTotal?: number;
        unheldNonReimbursableTotal?: number;
        currency?: string;
        errorFields?: ErrorFields;
        errors?: Errors;
        isWaitingOnBankAccount?: boolean;
        isCancelledIOU?: boolean;
        iouReportID?: string;
        preexistingReportID?: string;
        nonReimbursableTotal?: number;
        privateNotes?: Record<number, Note>;
        fieldList?: Record<string, PolicyReportField>;
        permissions?: Array<ValueOf<typeof CONST.REPORT.PERMISSIONS>>;
        tripData?: {startDate?: string; endDate?: string; tripID: string; payload?: TripData};
        welcomeMessage?: string;
    } & {
        pendingAction?: PendingAction;
        pendingFields?:
            | PendingFields<
                  | 'errorFields'
                  | 'errors'
                  | 'addWorkspaceRoom'
                  | 'type'
                  | 'ownerAccountID'
                  | 'description'
                  | 'fieldList'
                  | 'avatar'
                  | 'createChat'
                  | 'partial'
                  | 'reimbursed'
                  | 'preview'
                  | 'createReport'
                  | 'avatarUrl'
                  | 'chatType'
                  | 'hasOutstandingChildRequest'
                  | 'hasOutstandingChildTask'
                  | 'isOwnPolicyExpenseChat'
                  | 'isPinned'
                  | 'lastMessageText'
                  | 'lastVisibleActionCreated'
                  | 'lastReadTime'
                  | 'lastReadSequenceNumber'
                  | 'lastMentionedTime'
                  | 'policyAvatar'
                  | 'policyName'
                  | 'oldPolicyName'
                  | 'hasParentAccess'
                  | 'isDeletedParentAction'
                  | 'policyID'
                  | 'reportName'
                  | 'reportID'
                  | 'chatReportID'
                  | 'stateNum'
                  | 'statusNum'
                  | 'writeCapability'
                  | 'visibility'
                  | 'invoiceReceiver'
                  | 'parentReportID'
                  | 'parentReportActionID'
                  | 'managerID'
                  | 'lastVisibleActionLastModified'
                  | 'lastMessageHtml'
                  | 'lastActorAccountID'
                  | 'lastActionType'
                  | 'participants'
                  | 'total'
                  | 'unheldTotal'
                  | 'unheldNonReimbursableTotal'
                  | 'currency'
                  | 'isWaitingOnBankAccount'
                  | 'isCancelledIOU'
                  | 'iouReportID'
                  | 'preexistingReportID'
                  | 'nonReimbursableTotal'
                  | 'privateNotes'
                  | 'permissions'
                  | 'tripData'
                  | 'welcomeMessage'
              >
            | undefined;
    },
    fakePolicy: {
        id: string;
        name: string;
        role: ValueOf<typeof CONST.POLICY.ROLE>;
        type: ValueOf<typeof CONST.POLICY.TYPE>;
        owner: string;
        ownerAccountID?: number;
        outputCurrency: string;
        address?: CompanyAddress;
        avatarURL?: string;
        errorFields?: ErrorFields;
        errors?: Errors;
        isFromFullPolicy?: boolean;
        lastModified?: string;
        customUnits?: Record<string, CustomUnit>;
        isPolicyExpenseChatEnabled: boolean;
        autoReporting?: boolean;
        autoReportingFrequency?: Exclude<ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>, typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL>;
        harvesting?: {enabled: boolean; jobID?: number};
        preventSelfApproval?: boolean;
        autoReportingOffset?: number | ValueOf<{readonly LAST_BUSINESS_DAY_OF_MONTH: 'lastBusinessDayOfMonth'; readonly LAST_DAY_OF_MONTH: 'lastDayOfMonth'}>;
        employeeList?: PolicyEmployeeList;
        reimbursementChoice?: ValueOf<typeof CONST.POLICY.REIMBURSEMENT_CHOICES>;
        reimburser?: string;
        exporter?: string;
        autoReimbursement?: OnyxValueWithOfflineFeedback<{limit?: number}, 'limit'>;
        autoReimbursementLimit?: number;
        shouldShowAutoApprovalOptions?: boolean;
        autoApproval?: OnyxValueWithOfflineFeedback<{limit?: number; auditRate?: number}, 'limit' | 'auditRate'>;
        makeMeAdmin?: boolean;
        originalFileName?: string;
        alertMessage?: string;
        primaryLoginsInvited?: Record<string, string>;
        isPolicyUpdating?: boolean;
        approver?: string;
        approvalMode?: ValueOf<typeof CONST.POLICY.APPROVAL_MODE>;
        defaultBillable?: boolean;
        description?: string;
        disabledFields?: {defaultBillable?: boolean; reimbursable?: boolean};
        requiresTag?: boolean;
        requiresCategory?: boolean;
        hasMultipleTagLists?: boolean;
        isTaxTrackingEnabled?: boolean;
        invoice?: {
            companyName?: string;
            companyWebsite?: string;
            bankAccount?: {stripeConnectAccountBalance?: number; stripeConnectAccountID?: string; transferBankAccountID?: number};
            markUp?: number;
        } & {pendingAction?: PendingAction; pendingFields?: PendingFields<'companyName' | 'bankAccount' | 'companyWebsite' | 'markUp'> | undefined};
        tax?: {trackingEnabled: boolean};
        taxRates?: TaxRatesWithDefault;
        rules?: {approvalRules?: ApprovalRule[]; expenseRules?: ExpenseRule[]};
        customRules?: string;
        chatReportIDAdmins?: number;
        chatReportIDAnnounce?: number;
        connections?: Connections;
        fieldList?: Record<string, OnyxValueWithOfflineFeedback<PolicyReportField, 'defaultValue' | 'deletable'>>;
        areCategoriesEnabled?: boolean;
        areTagsEnabled?: boolean;
        areAccountingEnabled?: boolean;
        areDistanceRatesEnabled?: boolean;
        arePerDiemRatesEnabled?: boolean;
        areExpensifyCardsEnabled?: boolean;
        areWorkflowsEnabled?: boolean;
        areRulesEnabled?: boolean;
        areReportFieldsEnabled?: boolean;
        areConnectionsEnabled?: boolean;
        areInvoicesEnabled?: boolean;
        areCompanyCardsEnabled?: boolean;
        achAccount?: ACHAccount;
        eReceipts?: boolean;
        prohibitedExpenses?: ProhibitedExpenses;
        isLoading?: boolean;
        isLoadingWorkspaceReimbursement?: boolean;
        isChangeOwnerSuccessful?: boolean;
        isChangeOwnerFailed?: boolean;
        travelSettings?: WorkspaceTravelSettings;
        isPendingUpgrade?: boolean;
        isPendingDowngrade?: boolean;
        maxExpenseAge?: number;
        maxExpenseAmount?: number;
        maxExpenseAmountNoReceipt?: number;
        glCodes?: boolean;
        shouldShowAutoReimbursementLimitOption?: boolean;
        mccGroup?: Record<string, MccGroup>;
        workspaceAccountID?: number;
        assignedGuide?: {email: string};
        canDowngrade?: boolean;
        isAttendeeTrackingEnabled?: boolean;
    } & Partial<{isJoinRequestPending: boolean; policyDetailsForNonMembers: Record<string, OnyxValueWithOfflineFeedback<PolicyDetailsForNonMembers>>}> & {
            pendingAction?: PendingAction;
            pendingFields?:
                | PendingFields<
                      | 'isLoading'
                      | 'errorFields'
                      | 'errors'
                      | 'addWorkspaceRoom'
                      | keyof ACHAccount
                      | keyof Attributes
                      | keyof {isJoinRequestPending: boolean; policyDetailsForNonMembers: Record<string, OnyxValueWithOfflineFeedback<PolicyDetailsForNonMembers>>}
                      | 'id'
                      | 'name'
                      | 'role'
                      | 'type'
                      | 'owner'
                      | 'ownerAccountID'
                      | 'outputCurrency'
                      | 'address'
                      | 'avatarURL'
                      | 'isFromFullPolicy'
                      | 'lastModified'
                      | 'customUnits'
                      | 'isPolicyExpenseChatEnabled'
                      | 'autoReporting'
                      | 'autoReportingFrequency'
                      | 'harvesting'
                      | 'preventSelfApproval'
                      | 'autoReportingOffset'
                      | 'employeeList'
                      | 'reimbursementChoice'
                      | 'exporter'
                      | 'autoReimbursement'
                      | 'autoReimbursementLimit'
                      | 'shouldShowAutoApprovalOptions'
                      | 'autoApproval'
                      | 'makeMeAdmin'
                      | 'originalFileName'
                      | 'alertMessage'
                      | 'primaryLoginsInvited'
                      | 'isPolicyUpdating'
                      | 'approver'
                      | 'approvalMode'
                      | 'defaultBillable'
                      | 'description'
                      | 'disabledFields'
                      | 'requiresTag'
                      | 'requiresCategory'
                      | 'hasMultipleTagLists'
                      | 'isTaxTrackingEnabled'
                      | 'invoice'
                      | 'tax'
                      | 'taxRates'
                      | 'rules'
                      | 'customRules'
                      | 'chatReportIDAdmins'
                      | 'chatReportIDAnnounce'
                      | 'connections'
                      | 'fieldList'
                      | 'areCategoriesEnabled'
                      | 'areTagsEnabled'
                      | 'areAccountingEnabled'
                      | 'areDistanceRatesEnabled'
                      | 'arePerDiemRatesEnabled'
                      | 'areExpensifyCardsEnabled'
                      | 'areWorkflowsEnabled'
                      | 'areRulesEnabled'
                      | 'areReportFieldsEnabled'
                      | 'areConnectionsEnabled'
                      | 'areInvoicesEnabled'
                      | 'areCompanyCardsEnabled'
                      | 'achAccount'
                      | 'eReceipts'
                      | 'prohibitedExpenses'
                      | 'isLoadingWorkspaceReimbursement'
                      | 'isChangeOwnerSuccessful'
                      | 'isChangeOwnerFailed'
                      | 'travelSettings'
                      | 'isPendingUpgrade'
                      | 'isPendingDowngrade'
                      | 'maxExpenseAge'
                      | 'maxExpenseAmount'
                      | 'maxExpenseAmountNoReceipt'
                      | 'glCodes'
                      | 'shouldShowAutoReimbursementLimitOption'
                      | 'mccGroup'
                      | 'workspaceAccountID'
                      | 'assignedGuide'
                      | 'canDowngrade'
                      | 'isAttendeeTrackingEnabled'
                  >
                | undefined;
        },
    arg2: ({
        amount: number;
        accountant?: Accountant;
        taxAmount?: number;
        taxCode?: string;
        billable?: boolean;
        category?: string;
        comment?: Comment;
        created: string;
        currency: string;
        errors?: Errors | ReceiptErrors;
        errorFields?: ErrorFields;
        filename?: string;
        iouRequestType?: IOURequestType;
        merchant: string;
        modifiedAmount?: number;
        modifiedAttendees?: Attendee[];
        modifiedCreated?: string;
        modifiedCurrency?: string;
        modifiedMerchant?: string;
        modifiedWaypoints?: WaypointCollection;
        participantsAutoAssigned?: boolean;
        participants?: Participant[];
        receipt?: Receipt;
        reportID: string | undefined;
        routes?: Routes;
        transactionID: string;
        tag?: string;
        isFromGlobalCreate?: boolean;
        taxRate?: string | undefined;
        parentTransactionID?: string;
        reimbursable?: boolean;
        cardID?: number;
        status?: ValueOf<typeof CONST.TRANSACTION.STATUS>;
        hasEReceipt?: boolean;
        mccGroup?: ValueOf<typeof CONST.MCC_GROUPS>;
        modifiedMCCGroup?: ValueOf<typeof CONST.MCC_GROUPS>;
        originalAmount?: number;
        originalCurrency?: string;
        isLoading?: boolean;
        splitShares?: SplitShares;
        splitPayerAccountIDs?: number[];
        shouldShowOriginalAmount?: boolean;
        actionableWhisperReportActionID?: string;
        linkedTrackedExpenseReportAction?: ReportAction;
        linkedTrackedExpenseReportID?: string;
        bank?: string;
        cardName?: string;
        cardNumber?: string;
        managedCard?: boolean;
        posted?: string;
        inserted?: string;
    } & {
        pendingAction?: PendingAction;
        pendingFields?:
            | PendingFields<
                  | 'errorFields'
                  | 'errors'
                  | 'mccGroup'
                  | 'reportID'
                  | 'participants'
                  | 'currency'
                  | 'created'
                  | 'receipt'
                  | 'billable'
                  | 'merchant'
                  | 'category'
                  | 'tag'
                  | 'amount'
                  | 'reimbursable'
                  | 'accountant'
                  | 'taxRate'
                  | 'taxAmount'
                  | 'iouRequestType'
                  | 'modifiedAmount'
                  | 'taxCode'
                  | 'status'
                  | 'cardID'
                  | 'posted'
                  | keyof Comment
                  | keyof TransactionCustomUnit
                  | 'filename'
                  | 'modifiedAttendees'
                  | 'modifiedCreated'
                  | 'modifiedCurrency'
                  | 'modifiedMerchant'
                  | 'modifiedWaypoints'
                  | 'participantsAutoAssigned'
                  | 'routes'
                  | 'transactionID'
                  | 'isFromGlobalCreate'
                  | 'parentTransactionID'
                  | 'hasEReceipt'
                  | 'modifiedMCCGroup'
                  | 'originalAmount'
                  | 'originalCurrency'
                  | 'splitShares'
                  | 'splitPayerAccountIDs'
                  | 'shouldShowOriginalAmount'
                  | 'actionableWhisperReportActionID'
                  | 'linkedTrackedExpenseReportAction'
                  | 'linkedTrackedExpenseReportID'
                  | 'bank'
                  | 'cardName'
                  | 'cardNumber'
                  | 'managedCard'
                  | 'inserted'
              >
            | undefined;
    })[],
    violations: Record<string, TransactionViolations | undefined>,
    arg4: boolean,
): any {
    throw new Error('Function not implemented.');
}
