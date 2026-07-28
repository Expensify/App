import type reportAttributesModuleDefault from '@userActions/OnyxDerived/configs/reportAttributes';
import {hasPolicyRelevantFieldChanged} from '@userActions/OnyxDerived/configs/reportAttributes';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxKey} from '@src/ONYXKEYS';
import type {Policy, Report, ReportAttributesDerivedValue, Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';

type ReportAttributesConfig = typeof reportAttributesModuleDefault;

jest.mock('@libs/ReportUtils', () => ({
    generateReportAttributes: jest.fn(() => ({
        hasAnyViolations: false,
        requiresAttention: false,
        reportErrors: {},
        oneTransactionThreadReportID: undefined,
        actionBadge: undefined,
        actionTargetReportActionID: undefined,
    })),
    generateIsEmptyReport: jest.fn(() => false),
    hasVisibleReportFieldViolations: jest.fn(() => false),
    isArchivedReport: jest.fn(() => false),
    isValidReport: jest.fn(() => true),
    parseReportRouteParams: jest.fn(() => ({reportID: ''})),
}));

jest.mock('@libs/SidebarUtils', () => ({
    __esModule: true,
    default: {
        getReasonAndReportActionThatHasRedBrickRoad: jest.fn(() => undefined),
    },
}));

jest.mock('@libs/ReportNameUtils', () => ({
    computeReportName: jest.fn(() => 'Test Report'),
}));

const basePolicy: Policy = {
    id: 'policy1',
    name: 'Test Policy',
    type: CONST.POLICY.TYPE.CORPORATE,
    outputCurrency: CONST.CURRENCY.USD,
    role: CONST.POLICY.ROLE.ADMIN,
    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
    autoReimbursementLimit: 1000,
    autoReimbursement: {limit: 500},
} as unknown as Policy;

describe('hasPolicyRelevantFieldChanged', () => {
    describe('null / undefined edge cases', () => {
        it('returns false when both are null', () => {
            expect(hasPolicyRelevantFieldChanged(null, null)).toBe(false);
        });

        it('returns false when both are undefined', () => {
            expect(hasPolicyRelevantFieldChanged(undefined, undefined)).toBe(false);
        });

        it('returns false when both are null/undefined mix', () => {
            expect(hasPolicyRelevantFieldChanged(null, undefined)).toBe(false);
            expect(hasPolicyRelevantFieldChanged(undefined, null)).toBe(false);
        });

        it('returns true when prev is null and next has a policy', () => {
            expect(hasPolicyRelevantFieldChanged(null, basePolicy)).toBe(true);
        });

        it('returns true when next is null and prev had a policy', () => {
            expect(hasPolicyRelevantFieldChanged(basePolicy, null)).toBe(true);
        });
    });

    describe('identical policies', () => {
        it('returns false when all tracked fields are the same', () => {
            const copy = {...basePolicy};
            expect(hasPolicyRelevantFieldChanged(basePolicy, copy)).toBe(false);
        });

        it('returns false when only a non-tracked field changes', () => {
            const updated = {...basePolicy, name: 'Updated Name'} as unknown as Policy;
            expect(hasPolicyRelevantFieldChanged(basePolicy, updated)).toBe(false);
        });
    });

    describe('tracked field changes', () => {
        it('returns true when type changes', () => {
            const updated = {...basePolicy, type: CONST.POLICY.TYPE.TEAM} as unknown as Policy;
            expect(hasPolicyRelevantFieldChanged(basePolicy, updated)).toBe(true);
        });

        it('returns true when approvalMode changes', () => {
            const updated = {...basePolicy, approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL} as unknown as Policy;
            expect(hasPolicyRelevantFieldChanged(basePolicy, updated)).toBe(true);
        });

        it('returns true when reimbursementChoice changes', () => {
            const updated = {...basePolicy, reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO} as unknown as Policy;
            expect(hasPolicyRelevantFieldChanged(basePolicy, updated)).toBe(true);
        });

        it('returns true when autoReimbursementLimit changes', () => {
            const updated = {...basePolicy, autoReimbursementLimit: 2000} as unknown as Policy;
            expect(hasPolicyRelevantFieldChanged(basePolicy, updated)).toBe(true);
        });

        it('returns true when role changes', () => {
            const updated = {...basePolicy, role: CONST.POLICY.ROLE.USER} as unknown as Policy;
            expect(hasPolicyRelevantFieldChanged(basePolicy, updated)).toBe(true);
        });

        it('returns true when autoReimbursement.limit changes', () => {
            const updated = {...basePolicy, autoReimbursement: {limit: 999}} as unknown as Policy;
            expect(hasPolicyRelevantFieldChanged(basePolicy, updated)).toBe(true);
        });

        it('returns true when autoReimbursement goes from defined to undefined', () => {
            const updated = {...basePolicy, autoReimbursement: undefined} as unknown as Policy;
            expect(hasPolicyRelevantFieldChanged(basePolicy, updated)).toBe(true);
        });

        it('returns true when autoReimbursement goes from undefined to defined', () => {
            const withoutAutoReimburse = {...basePolicy, autoReimbursement: undefined} as unknown as Policy;
            expect(hasPolicyRelevantFieldChanged(withoutAutoReimburse, basePolicy)).toBe(true);
        });
    });
});

describe('reportAttributes compute — policy change code flow', () => {
    let config: ReportAttributesConfig;

    const report1 = {
        reportID: 'r1',
        policyID: 'policy1',
        chatReportID: undefined,
        participants: {},
    } as unknown as Report;

    const report2 = {
        reportID: 'r2',
        policyID: 'policy2',
        chatReportID: undefined,
        participants: {},
    } as unknown as Report;

    const reports: OnyxCollection<Report> = {
        [`${ONYXKEYS.COLLECTION.REPORT}r1`]: report1,
        [`${ONYXKEYS.COLLECTION.REPORT}r2`]: report2,
    };

    const policy1 = {...basePolicy, id: 'policy1'} as unknown as Policy;
    const policy2 = {...basePolicy, id: 'policy2'} as unknown as Policy;

    const policies: OnyxCollection<Policy> = {
        [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1,
        [`${ONYXKEYS.COLLECTION.POLICY}policy2`]: policy2,
    };

    beforeEach(() => {
        jest.resetModules();

        config = (require('@userActions/OnyxDerived/configs/reportAttributes') as {default: ReportAttributesConfig}).default;
    });

    const buildArgs = (overridePolicies?: OnyxCollection<Policy>, overrideReports?: OnyxCollection<Report>, transactionsUpdate?: OnyxCollection<Transaction> | null) =>
        [
            overrideReports ?? reports, // reports
            null, // preferredLocale
            null, // transactionViolations
            null, // reportActions
            null, // reportNameValuePairs
            transactionsUpdate ?? null, // transactions
            null, // personalDetails
            null, // session
            overridePolicies ?? policies, // policies
            null, // policyTags
            null, // reportViolations
            null, // reportMetadata
        ] as unknown as Parameters<ReportAttributesConfig['compute']>[0];

    it('computes every report on a cold start (no currentValue) when policies load', () => {
        const result = config.compute(buildArgs(), {
            currentValue: undefined,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: policies},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY]),
        });

        expect(result?.reports).toHaveProperty('r1');
        expect(result?.reports).toHaveProperty('r2');
    });

    it('scopes the first policy load to reports referencing the loaded policies when currentValue is already populated', () => {
        // Reproduces the ReconnectApp-after-open case: attributes were already computed, then ~1k policies
        // land. Only reports whose policy actually arrived should recompute — not every report.
        const report3: Report = {...createRandomReport(12, undefined), reportID: 'r3', policyID: 'policyOther', chatReportID: undefined};
        const reportsWithUnrelated: OnyxCollection<Report> = {
            ...reports,
            [`${ONYXKEYS.COLLECTION.REPORT}r3`]: report3,
        };

        const existingValue: ReportAttributesDerivedValue = {
            reports: {
                r1: {reportName: 'Old Name 1', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                r2: {reportName: 'Old Name 2', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                r3: {reportName: 'Old Name 3', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
            },
            locale: null,
        };

        const result = config.compute(buildArgs(policies, reportsWithUnrelated), {
            currentValue: existingValue,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: policies},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY]),
        });

        // r1/r2 reference the loaded policies → recomputed (default mock name).
        expect(result?.reports.r1?.reportName).toBe('Test Report');
        expect(result?.reports.r2?.reportName).toBe('Test Report');
        // r3 references a policy that did not load → keeps its existing value (not recomputed).
        expect(result?.reports.r3?.reportName).toBe('Old Name 3');
    });

    it('recomputes a child invoice report when only its receiver workspace policy loads', () => {
        // A B2B invoice keeps the receiver policy on the invoice room, not on the child invoice report
        // (whose own policyID is the sender). computeReportName reads the receiver policy off the room, so
        // when the receiver policy arrives in its own batch the child report must recompute too — otherwise
        // its name stays stale from when it was computed without the receiver policy present.
        const senderPolicy: Policy = {...basePolicy, id: 'senderPolicy'};
        const receiverPolicy: Policy = {...basePolicy, id: 'receiverPolicy'};

        const invoiceRoom: Report = {
            ...createRandomReport(30, CONST.REPORT.CHAT_TYPE.INVOICE),
            reportID: 'invoiceRoom',
            policyID: 'senderPolicy',
            chatReportID: undefined,
            invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, policyID: 'receiverPolicy'},
        };
        const invoiceChild: Report = {...createRandomReport(31, undefined), reportID: 'invoiceChild', policyID: 'senderPolicy', chatReportID: 'invoiceRoom'};
        const invoiceReports: OnyxCollection<Report> = {
            [`${ONYXKEYS.COLLECTION.REPORT}invoiceRoom`]: invoiceRoom,
            [`${ONYXKEYS.COLLECTION.REPORT}invoiceChild`]: invoiceChild,
        };

        // Seed previousPolicies with just the sender policy, as if it arrived in an earlier batch.
        config.compute(buildArgs({[`${ONYXKEYS.COLLECTION.POLICY}senderPolicy`]: senderPolicy}, invoiceReports), {
            currentValue: undefined,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: {[`${ONYXKEYS.COLLECTION.POLICY}senderPolicy`]: senderPolicy}},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY]),
        });

        const existingValue: ReportAttributesDerivedValue = {
            reports: {
                invoiceRoom: {reportName: 'Old Room', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                invoiceChild: {reportName: 'Old Child', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
            },
            locale: null,
        };

        // The receiver policy now arrives in its own batch.
        const bothPolicies: OnyxCollection<Policy> = {
            [`${ONYXKEYS.COLLECTION.POLICY}senderPolicy`]: senderPolicy,
            [`${ONYXKEYS.COLLECTION.POLICY}receiverPolicy`]: receiverPolicy,
        };
        const result = config.compute(buildArgs(bothPolicies, invoiceReports), {
            currentValue: existingValue,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: {[`${ONYXKEYS.COLLECTION.POLICY}receiverPolicy`]: receiverPolicy}},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY]),
        });

        // Both the room (own invoiceReceiver) and the child (receiver read from its parent room) recompute.
        expect(result?.reports.invoiceRoom?.reportName).not.toBe('Old Room');
        expect(result?.reports.invoiceChild?.reportName).not.toBe('Old Child');
    });

    it('keeps report names cached when only a policy badge field changes (no name recompute)', () => {
        // Seed previousPolicies by doing an initial compute
        config.compute(buildArgs(), {
            currentValue: undefined,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: policies},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY]),
        });

        // reimbursementChoice is a badge-relevant field that no report name reads.
        const policy1Changed = {...policy1, reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO} as unknown as Policy;
        const updatedPolicies: OnyxCollection<Policy> = {
            ...policies,
            [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1Changed,
        };

        const existingValue: ReportAttributesDerivedValue = {
            reports: {
                r1: {reportName: 'Old Name 1', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                r2: {reportName: 'Old Name 2', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
            },
            locale: null,
        };

        const computeReportNameMock = (jest.requireMock('@libs/ReportNameUtils') as unknown as {computeReportName: jest.Mock}).computeReportName;
        computeReportNameMock.mockClear();

        const result = config.compute(buildArgs(updatedPolicies), {
            currentValue: existingValue,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: {[`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1Changed}},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY]),
        });

        // A badge-only change never affects the name, so computeReportName is skipped entirely...
        expect(computeReportNameMock).not.toHaveBeenCalled();
        // ...and r1 keeps its cached name (its badge attributes are still recomputed).
        expect(result?.reports.r1?.reportName).toBe('Old Name 1');
        // r2 (policy2 unchanged) keeps its value from currentValue.
        expect(result?.reports.r2?.reportName).toBe('Old Name 2');
    });

    it('recomputes the name when a policy name changes', () => {
        // Seed previousPolicies by doing an initial compute
        config.compute(buildArgs(), {
            currentValue: undefined,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: policies},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY]),
        });

        // Both a badge field and the name change — the report name must be recomputed.
        const policy1Changed = {...policy1, reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO, name: 'Renamed Policy'} as unknown as Policy;
        const updatedPolicies: OnyxCollection<Policy> = {
            ...policies,
            [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1Changed,
        };

        const existingValue: ReportAttributesDerivedValue = {
            reports: {
                r1: {reportName: 'Old Name 1', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                r2: {reportName: 'Old Name 2', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
            },
            locale: null,
        };

        const computeReportNameMock = (jest.requireMock('@libs/ReportNameUtils') as unknown as {computeReportName: jest.Mock}).computeReportName;
        computeReportNameMock.mockReturnValue('New Name');

        const result = config.compute(buildArgs(updatedPolicies), {
            currentValue: existingValue,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: {[`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1Changed}},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY]),
        });

        // r1's policy name changed → name recomputed.
        expect(result?.reports.r1?.reportName).toBe('New Name');
        // r2 (policy2 unchanged) keeps its value from currentValue.
        expect(result?.reports.r2?.reportName).toBe('Old Name 2');
    });

    // approvalMode/role feed only thread names, so only threads forgo the badge-only skip when they change.
    it.each([
        ['approvalMode', {approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL}],
        ['role', {role: CONST.POLICY.ROLE.USER}],
    ])('recomputes only thread names when a thread-name-affecting policy field changes (%s)', (_field, policyPatch) => {
        const thread: Report = {
            ...createRandomReport(40, undefined),
            reportID: 'thread1',
            policyID: 'policy1',
            parentReportID: 'r1',
            parentReportActionID: 'action1',
            chatReportID: undefined,
            participants: {},
        };
        const reportsWithThread: OnyxCollection<Report> = {...reports, [`${ONYXKEYS.COLLECTION.REPORT}thread1`]: thread};

        // Seed previousPolicies by doing an initial compute
        config.compute(buildArgs(undefined, reportsWithThread), {
            currentValue: undefined,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: policies},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY]),
        });

        const policy1Changed: Policy = {...policy1, ...policyPatch};
        const updatedPolicies: OnyxCollection<Policy> = {
            ...policies,
            [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1Changed,
        };

        const existingValue: ReportAttributesDerivedValue = {
            reports: {
                r1: {reportName: 'Old Name 1', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                r2: {reportName: 'Old Name 2', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                thread1: {reportName: 'Old Thread Name', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
            },
            locale: null,
        };

        const result = config.compute(buildArgs(updatedPolicies, reportsWithThread), {
            currentValue: existingValue,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: {[`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1Changed}},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY]),
        });

        // The thread's name reads the changed field → recomputed.
        expect(result?.reports.thread1?.reportName).toBe('Test Report');
        // A plain report on the same policy keeps the badge-only skip.
        expect(result?.reports.r1?.reportName).toBe('Old Name 1');
        // r2 (policy2 unchanged) keeps its value from currentValue.
        expect(result?.reports.r2?.reportName).toBe('Old Name 2');
    });

    // fieldList emptiness feeds only the "New Report" fallback, so a mass flush delivering fieldList for
    // every policy (the first OpenSearchPage) recomputes only empty-named money-request reports.
    it('recomputes only empty-named money-request report names when fieldList emptiness changes', () => {
        const emptyNameExpense: Report = {
            ...createRandomReport(41, undefined),
            reportID: 'exp1',
            policyID: 'policy1',
            type: CONST.REPORT.TYPE.EXPENSE,
            reportName: '',
            chatReportID: undefined,
            participants: {},
        };
        const reportsWithExpense: OnyxCollection<Report> = {...reports, [`${ONYXKEYS.COLLECTION.REPORT}exp1`]: emptyNameExpense};

        // Seed previousPolicies by doing an initial compute (basePolicy has no fieldList → empty).
        config.compute(buildArgs(undefined, reportsWithExpense), {
            currentValue: undefined,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: policies},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY]),
        });

        // fieldList arrives → emptiness flips. Not a badge field, so this alone must still be detected.
        const policy1Changed = {...policy1, fieldList: {textTitle: {name: 'title'}}} as unknown as Policy;
        const updatedPolicies: OnyxCollection<Policy> = {
            ...policies,
            [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1Changed,
        };

        const existingValue: ReportAttributesDerivedValue = {
            reports: {
                r1: {reportName: 'Old Name 1', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                r2: {reportName: 'Old Name 2', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                exp1: {reportName: 'New Report', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
            },
            locale: null,
        };

        const result = config.compute(buildArgs(updatedPolicies, reportsWithExpense), {
            currentValue: existingValue,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: {[`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1Changed}},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY]),
        });

        // The empty-named expense report reads fieldList emptiness → recomputed.
        expect(result?.reports.exp1?.reportName).toBe('Test Report');
        // A plain report on the same policy keeps its cached name — the mass-flush hot path stays fast.
        expect(result?.reports.r1?.reportName).toBe('Old Name 1');
        // r2 (policy2 unchanged) keeps its value from currentValue.
        expect(result?.reports.r2?.reportName).toBe('Old Name 2');
    });

    it('recomputes invoice names when only a receiver policy badge field changes', () => {
        // Invoice room names read the receiver policy (isPolicyAdmin in getInvoicesChatName), so a
        // receiver-policy match must never reuse the cached name — even for a badge-only change.
        const senderPolicy: Policy = {...basePolicy, id: 'senderPolicy'};
        const receiverPolicy: Policy = {...basePolicy, id: 'receiverPolicy'};

        const invoiceRoom: Report = {
            ...createRandomReport(30, CONST.REPORT.CHAT_TYPE.INVOICE),
            reportID: 'invoiceRoom',
            policyID: 'senderPolicy',
            chatReportID: undefined,
            invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, policyID: 'receiverPolicy'},
        };
        const invoiceReports: OnyxCollection<Report> = {
            [`${ONYXKEYS.COLLECTION.REPORT}invoiceRoom`]: invoiceRoom,
        };
        const bothPolicies: OnyxCollection<Policy> = {
            [`${ONYXKEYS.COLLECTION.POLICY}senderPolicy`]: senderPolicy,
            [`${ONYXKEYS.COLLECTION.POLICY}receiverPolicy`]: receiverPolicy,
        };

        // Seed previousPolicies with both policies.
        config.compute(buildArgs(bothPolicies, invoiceReports), {
            currentValue: undefined,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: bothPolicies},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY]),
        });

        const existingValue: ReportAttributesDerivedValue = {
            reports: {
                invoiceRoom: {reportName: 'Old Room', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
            },
            locale: null,
        };

        // Receiver policy reimbursementChoice changes — a tracked badge field that no name reads.
        const receiverPolicyChanged: Policy = {...receiverPolicy, reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO};
        const result = config.compute(buildArgs({...bothPolicies, [`${ONYXKEYS.COLLECTION.POLICY}receiverPolicy`]: receiverPolicyChanged}, invoiceReports), {
            currentValue: existingValue,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: {[`${ONYXKEYS.COLLECTION.POLICY}receiverPolicy`]: receiverPolicyChanged}},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY]),
        });

        // Receiver-policy matches never skip the name recompute.
        expect(result?.reports.invoiceRoom?.reportName).not.toBe('Old Room');
    });

    it('recomputes the name when a badge-only policy change coalesces with a transaction update on the same report', () => {
        // Seed previousPolicies.
        config.compute(buildArgs(), {
            currentValue: undefined,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: policies},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY]),
        });

        const policy1Changed = {...policy1, reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO} as unknown as Policy;
        const updatedPolicies: OnyxCollection<Policy> = {
            ...policies,
            [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1Changed,
        };
        const transactionsUpdate: OnyxCollection<Transaction> = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION}tx1`]: {...createRandomTransaction(1), transactionID: 'tx1', reportID: 'r1'},
        };

        const existingValue: ReportAttributesDerivedValue = {
            reports: {
                r1: {reportName: 'Old Name 1', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                r2: {reportName: 'Old Name 2', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
            },
            locale: null,
        };

        // One coalesced flush: policy1 badge change + a transaction update whose report is also r1.
        const result = config.compute(buildArgs(updatedPolicies, undefined, transactionsUpdate), {
            currentValue: existingValue,
            sourceValues: {
                [ONYXKEYS.COLLECTION.POLICY]: {[`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1Changed},
                [ONYXKEYS.COLLECTION.TRANSACTION]: transactionsUpdate,
            },
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY, ONYXKEYS.COLLECTION.TRANSACTION]),
        });

        // Transactions feed the name, so the badge-only skip must not apply to r1.
        expect(result?.reports.r1?.reportName).toBe('Test Report');
        // r2 is untouched.
        expect(result?.reports.r2?.reportName).toBe('Old Name 2');
    });

    it('skips recompute when a non-tracked policy field changes', () => {
        // Seed previousPolicies
        config.compute(buildArgs(), {
            currentValue: undefined,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: policies},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY]),
        });

        const policy1WithUntrackedChange = {...policy1, description: 'New description'} as unknown as Policy;
        const updatedPolicies: OnyxCollection<Policy> = {
            ...policies,
            [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1WithUntrackedChange,
        };

        const existingValue: ReportAttributesDerivedValue = {
            reports: {
                r1: {reportName: 'Existing r1', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                r2: {reportName: 'Existing r2', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
            },
            locale: null,
        };

        const result = config.compute(buildArgs(updatedPolicies), {
            currentValue: existingValue,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: {[`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1WithUntrackedChange} as never},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY]),
        });

        // No tracked fields changed → return currentValue unchanged
        expect(result).toEqual(existingValue);
    });

    it('seeds the policy baseline on a non-policy compute so a reference-only policy re-merge is not recomputed', () => {
        // Reproduces OpenSearchPage: policies were restored from disk (never triggering a POLICY compute), then a
        // mergeCollection re-sends them with fresh object references. getCollectionDelta is reference-based, so the
        // delta lists every policy — but nothing actually changed, so no report should recompute.
        const existingValue: ReportAttributesDerivedValue = {
            reports: {
                r1: {reportName: 'Existing r1', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                r2: {reportName: 'Existing r2', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
            },
            locale: null,
        };

        // A non-POLICY compute (e.g. reports loading) seeds previousPolicies from the disk-restored policies.
        config.compute(buildArgs(), {
            currentValue: existingValue,
            sourceValues: {[ONYXKEYS.COLLECTION.REPORT]: reports},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.REPORT]),
        });

        // The same policies come back with fresh references (identical values).
        const samePoliciesNewRefs: OnyxCollection<Policy> = {
            [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: {...policy1},
            [`${ONYXKEYS.COLLECTION.POLICY}policy2`]: {...policy2},
        };

        const result = config.compute(buildArgs(samePoliciesNewRefs), {
            currentValue: existingValue,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: samePoliciesNewRefs},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY]),
        });

        // No relevant field changed → currentValue returned unchanged, no report-name recompute.
        expect(result).toEqual(existingValue);
    });

    it('recomputes the parent workspace chat when a transaction on its expense report changes', () => {
        const expenseReport: Report = {...createRandomReport(10, undefined), reportID: 'expense1', policyID: 'policy3', chatReportID: 'chat1'};
        const chatReport: Report = {...createRandomReport(11, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT), reportID: 'chat1', policyID: 'policy3', chatReportID: undefined};
        const reportsWithChat: OnyxCollection<Report> = {
            ...reports,
            [`${ONYXKEYS.COLLECTION.REPORT}expense1`]: expenseReport,
            [`${ONYXKEYS.COLLECTION.REPORT}chat1`]: chatReport,
        };

        // Seed both entries with sentinel names; the mocked computeReportName returns 'Test Report' on any recompute.
        const existingValue: ReportAttributesDerivedValue = {
            reports: {
                expense1: {reportName: 'Old expense name', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                chat1: {reportName: 'Old chat name', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
            },
            locale: null,
        };

        const transactionsUpdate: OnyxCollection<Transaction> = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION}tx1`]: {...createRandomTransaction(1), transactionID: 'tx1', reportID: 'expense1'},
        };

        const args = buildArgs(undefined, reportsWithChat, transactionsUpdate);
        const result = config.compute(args, {
            currentValue: existingValue,
            sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: transactionsUpdate},
        });

        // The expense report is recomputed, and its parent workspace chat (where the to-do/GBR render) is too,
        // so both pick up the recomputed name instead of keeping their stale seeded value.
        expect(result?.reports.expense1?.reportName).toBe('Test Report');
        expect(result?.reports.chat1?.reportName).toBe('Test Report');
    });
});
