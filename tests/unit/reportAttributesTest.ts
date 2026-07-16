import reportAttributesModuleDefault, {hasPolicyRelevantFieldChanged} from '@userActions/OnyxDerived/configs/reportAttributes';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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
    isOpenReport: jest.fn(() => true),
    isProcessingReport: jest.fn(() => false),
    isPolicyExpenseChat: jest.fn(() => false),
    isPolicyAdmin: jest.fn(() => false),
    hasViolations: jest.fn(() => false),
}));

// Report IDs the mocked getReasonAndReportActionThatHasRedBrickRoad treats as errored.
const mockErroredReportIDs = new Set<string>();

jest.mock('@libs/SidebarUtils', () => ({
    __esModule: true,
    default: {
        getReasonAndReportActionThatHasRedBrickRoad: jest.fn((report: Report) => (mockErroredReportIDs.has(report.reportID) ? {reason: 'hasErrors', reportAction: undefined} : undefined)),
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
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: policies as never},
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
        });

        // Both the room (own invoiceReceiver) and the child (receiver read from its parent room) recompute.
        expect(result?.reports.invoiceRoom?.reportName).not.toBe('Old Room');
        expect(result?.reports.invoiceChild?.reportName).not.toBe('Old Child');
    });

    it('only recomputes reports for the changed policy when a tracked field changes', () => {
        // Seed previousPolicies by doing an initial compute
        config.compute(buildArgs(), {
            currentValue: undefined,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: policies as never},
        });

        const policy1Changed = {...policy1, approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL} as unknown as Policy;
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
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: {[`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1Changed} as never},
        });

        // r1 (policy1 changed) should be recomputed with new name
        expect(result?.reports.r1?.reportName).toBe('New Name');
        // r2 (policy2 unchanged) should keep its value from currentValue
        expect(result?.reports.r2?.reportName).toBe('Old Name 2');
    });

    it('skips recompute when a non-tracked policy field changes', () => {
        // Seed previousPolicies
        config.compute(buildArgs(), {
            currentValue: undefined,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: policies as never},
        });

        const policy1WithNameChange = {...policy1, name: 'New Policy Name'} as unknown as Policy;
        const updatedPolicies: OnyxCollection<Policy> = {
            ...policies,
            [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1WithNameChange,
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
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: {[`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1WithNameChange} as never},
        });

        // No tracked fields changed → return currentValue unchanged
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

describe('reportAttributes compute — error propagation to parent chats', () => {
    // Static import instead of the re-require pattern above: every test here starts with a full
    // compute (seedFullCompute), which rebuilds all of the config's module-level state anyway.
    const config = reportAttributesModuleDefault;

    const chatA: Report = {...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT), reportID: 'chatA', policyID: 'policy1', chatReportID: undefined};
    const chatB: Report = {...createRandomReport(2, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT), reportID: 'chatB', policyID: 'policy1', chatReportID: undefined};
    const childA1: Report = {...createRandomReport(3, undefined), reportID: 'childA1', policyID: 'policy1', chatReportID: 'chatA'};
    const childA2: Report = {...createRandomReport(4, undefined), reportID: 'childA2', policyID: 'policy1', chatReportID: 'chatA'};
    const childB1: Report = {...createRandomReport(5, undefined), reportID: 'childB1', policyID: 'policy1', chatReportID: 'chatB'};

    const baseReports: OnyxCollection<Report> = {
        [`${ONYXKEYS.COLLECTION.REPORT}chatA`]: chatA,
        [`${ONYXKEYS.COLLECTION.REPORT}chatB`]: chatB,
        [`${ONYXKEYS.COLLECTION.REPORT}childA1`]: childA1,
        [`${ONYXKEYS.COLLECTION.REPORT}childA2`]: childA2,
        [`${ONYXKEYS.COLLECTION.REPORT}childB1`]: childB1,
    };

    beforeEach(() => {
        mockErroredReportIDs.clear();
    });

    const buildArgs = (reportsArg: OnyxCollection<Report>): Parameters<ReportAttributesConfig['compute']>[0] => [
        reportsArg,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
    ];

    // A full compute (no currentValue) — seeds the module-level chat → children index too.
    const seedFullCompute = (reportsArg: OnyxCollection<Report>) => config.compute(buildArgs(reportsArg), {currentValue: undefined, sourceValues: undefined});

    const computeReportDelta = (reportsArg: OnyxCollection<Report>, currentValue: ReportAttributesDerivedValue, delta: OnyxCollection<Report>) =>
        config.compute(buildArgs(reportsArg), {
            currentValue,
            sourceValues: {[ONYXKEYS.COLLECTION.REPORT]: delta},
        });

    it('flags the parent chat when a child report has errors', () => {
        mockErroredReportIDs.add('childA1');

        const result = seedFullCompute(baseReports);

        expect(result?.reports.chatA?.brickRoadStatus).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
        expect(result?.reports.chatA?.actionBadge).toBe(CONST.REPORT.ACTION_BADGE.FIX);
        expect(result?.reports.chatB?.brickRoadStatus).toBeUndefined();
    });

    it('keeps the parent flagged when one child clears but a sibling is still errored', () => {
        mockErroredReportIDs.add('childA1');
        mockErroredReportIDs.add('childA2');
        const seeded = seedFullCompute(baseReports);
        expect(seeded?.reports.chatA?.brickRoadStatus).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);

        mockErroredReportIDs.delete('childA1');
        const result = computeReportDelta(baseReports, seeded, {[`${ONYXKEYS.COLLECTION.REPORT}childA1`]: childA1});

        expect(result?.reports.childA1?.brickRoadStatus).toBeUndefined();
        expect(result?.reports.chatA?.brickRoadStatus).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
    });

    it('unflags the parent when the last errored child clears', () => {
        mockErroredReportIDs.add('childA1');
        const seeded = seedFullCompute(baseReports);
        expect(seeded?.reports.chatA?.brickRoadStatus).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);

        mockErroredReportIDs.delete('childA1');
        const result = computeReportDelta(baseReports, seeded, {[`${ONYXKEYS.COLLECTION.REPORT}childA1`]: childA1});

        expect(result?.reports.chatA?.brickRoadStatus).toBeUndefined();
        expect(result?.reports.chatA?.actionBadge).toBeUndefined();
    });

    it('moves the flag when an errored child moves to another chat', () => {
        mockErroredReportIDs.add('childA1');
        const seeded = seedFullCompute(baseReports);
        expect(seeded?.reports.chatA?.brickRoadStatus).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
        expect(seeded?.reports.chatB?.brickRoadStatus).toBeUndefined();

        const movedChild: Report = {...childA1, chatReportID: 'chatB'};
        const movedReports: OnyxCollection<Report> = {...baseReports, [`${ONYXKEYS.COLLECTION.REPORT}childA1`]: movedChild};
        const result = computeReportDelta(movedReports, seeded, {[`${ONYXKEYS.COLLECTION.REPORT}childA1`]: movedChild});

        expect(result?.reports.chatA?.brickRoadStatus).toBeUndefined();
        expect(result?.reports.chatB?.brickRoadStatus).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
    });

    it('unflags the parent when its only errored child is deleted', () => {
        mockErroredReportIDs.add('childA1');
        const seeded = seedFullCompute(baseReports);
        expect(seeded?.reports.chatA?.brickRoadStatus).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);

        const {[`${ONYXKEYS.COLLECTION.REPORT}childA1`]: deletedChild, ...remainingReports} = baseReports;
        const result = computeReportDelta(remainingReports, seeded, {[`${ONYXKEYS.COLLECTION.REPORT}childA1`]: undefined});

        expect(result?.reports.childA1).toBeUndefined();
        expect(result?.reports.chatA?.brickRoadStatus).toBeUndefined();
    });

    it('does not touch unrelated errored chats on a single-report update', () => {
        mockErroredReportIDs.add('childB1');
        const seeded = seedFullCompute(baseReports);
        const chatBBefore = seeded?.reports.chatB;
        expect(chatBBefore?.brickRoadStatus).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);

        const result = computeReportDelta(baseReports, seeded, {[`${ONYXKEYS.COLLECTION.REPORT}childA1`]: childA1});

        // chatB was not part of the update — its entry must be carried over by reference, not restamped.
        expect(result?.reports.chatB).toBe(chatBBefore);
    });
});
