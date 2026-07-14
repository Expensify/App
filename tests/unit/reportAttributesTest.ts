import type reportAttributesModuleDefault from '@userActions/OnyxDerived/configs/reportAttributes';
import {policyRelevantSignature} from '@userActions/OnyxDerived/configs/reportAttributes';

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

describe('policyRelevantSignature', () => {
    describe('null / undefined edge cases', () => {
        it('returns null for missing policies', () => {
            expect(policyRelevantSignature(null)).toBeNull();
            expect(policyRelevantSignature(undefined)).toBeNull();
        });
    });

    describe('identical content', () => {
        it('produces the same signature for a shallow copy', () => {
            expect(policyRelevantSignature({...basePolicy})).toBe(policyRelevantSignature(basePolicy));
        });

        it('produces the same signature regardless of key insertion order', () => {
            const reordered = Object.fromEntries(Object.entries(basePolicy).reverse()) as unknown as Policy;
            expect(policyRelevantSignature(reordered)).toBe(policyRelevantSignature(basePolicy));
        });

        it('ignores Onyx write-bookkeeping keys', () => {
            const withWriteNoise = {...basePolicy, pendingAction: 'update', pendingFields: {name: 'update'}, errors: {a: 'err'}, errorFields: {name: {a: 'err'}}} as unknown as Policy;
            expect(policyRelevantSignature(withWriteNoise)).toBe(policyRelevantSignature(basePolicy));
        });
    });

    describe('content changes', () => {
        const changes: Array<[string, Partial<Policy>]> = [
            ['type', {type: CONST.POLICY.TYPE.TEAM}],
            ['approvalMode', {approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL}],
            ['reimbursementChoice', {reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO}],
            ['autoReimbursementLimit', {autoReimbursementLimit: 2000}],
            ['role', {role: CONST.POLICY.ROLE.USER}],
            ['autoReimbursement.limit', {autoReimbursement: {limit: 999}}],
            ['autoReimbursement removed', {autoReimbursement: undefined}],
            ['name', {name: 'Renamed Workspace'}],
            ['employeeList', {employeeList: {['a@b.com' as string]: {submitsTo: 'c@d.com'}}}],
        ];
        it.each(changes)('changes the signature when %s changes', (_label, change) => {
            const updated = {...basePolicy, ...change} as unknown as Policy;
            expect(policyRelevantSignature(updated)).not.toBe(policyRelevantSignature(basePolicy));
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

    // policyRelevantSignature returns null only for a missing policy, so tests can rely on a string.
    const signatureOf = (policy: Policy): string => policyRelevantSignature(policy) ?? '';

    beforeEach(() => {
        jest.resetModules();

        config = (require('@userActions/OnyxDerived/configs/reportAttributes') as {default: ReportAttributesConfig}).default;
    });

    const buildArgs = (
        overridePolicies?: OnyxCollection<Policy>,
        overrideReports?: OnyxCollection<Report>,
        transactionsUpdate?: OnyxCollection<Transaction> | null,
        conciergeReportID?: string,
    ) =>
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
            conciergeReportID ?? null, // conciergeReportID
            null, // introSelected
        ] as unknown as Parameters<ReportAttributesConfig['compute']>[0];

    it('computes every report on a cold start (no currentValue) when policies load', () => {
        const result = config.compute(buildArgs(), {
            currentValue: undefined,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: policies as never},
        });

        expect(result?.reports).toHaveProperty('r1');
        expect(result?.reports).toHaveProperty('r2');
    });

    it('recomputes reports of delivered policies when the stored value has no signature baseline', () => {
        // Reproduces the first policy delivery on a value with no baseline (written by an older app
        // version, or computed in-session before policies loaded): we cannot tell whether the stored
        // attributes match these policies, so the delivered policies' reports recompute — exactly like
        // the pre-signature code did on its first in-session delivery — and the full baseline is recorded.
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

        // r1/r2 reference the delivered policies → recomputed (default mock name).
        expect(result?.reports.r1?.reportName).toBe('Test Report');
        expect(result?.reports.r2?.reportName).toBe('Test Report');
        // r3 references a policy that was not delivered → keeps its existing value.
        expect(result?.reports.r3?.reportName).toBe('Old Name 3');
        expect(result?.policySignatures).toEqual({
            [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policyRelevantSignature(policy1),
            [`${ONYXKEYS.COLLECTION.POLICY}policy2`]: policyRelevantSignature(policy2),
        });
    });

    it('seeds policy signatures without recomputing on a pass that did not deliver policies', () => {
        // Disk-hydrated policies and a disk-restored value are consistent, so a non-policy pass just
        // records the baseline; only the report from this pass's own update recomputes.
        const existingValue: ReportAttributesDerivedValue = {
            reports: {
                r1: {reportName: 'Old Name 1', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                r2: {reportName: 'Old Name 2', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
            },
            locale: null,
        };

        const result = config.compute(buildArgs(), {
            currentValue: existingValue,
            sourceValues: {[ONYXKEYS.COLLECTION.REPORT]: {[`${ONYXKEYS.COLLECTION.REPORT}r1`]: report1}},
        });

        expect(result?.reports.r1?.reportName).toBe('Test Report');
        expect(result?.reports.r2?.reportName).toBe('Old Name 2');
        expect(result?.policySignatures).toEqual({
            [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policyRelevantSignature(policy1),
            [`${ONYXKEYS.COLLECTION.POLICY}policy2`]: policyRelevantSignature(policy2),
        });
    });

    it('scopes a policy delivery to reports whose stored signature differs when currentValue is already populated', () => {
        // Reproduces the ReconnectApp-after-restart case: attributes and signatures were persisted, then
        // ~1k policies land and some actually changed. Only reports whose policy signature differs should
        // recompute — not every report.
        const report3: Report = {...createRandomReport(12, undefined), reportID: 'r3', policyID: 'policyOther', chatReportID: undefined};
        const reportsWithUnrelated: OnyxCollection<Report> = {
            ...reports,
            [`${ONYXKEYS.COLLECTION.REPORT}r3`]: report3,
        };

        const stalePolicy1: Policy = {...policy1, approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL};
        const existingValue: ReportAttributesDerivedValue = {
            reports: {
                r1: {reportName: 'Old Name 1', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                r2: {reportName: 'Old Name 2', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                r3: {reportName: 'Old Name 3', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
            },
            locale: null,
            policySignatures: {
                [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: signatureOf(stalePolicy1),
                [`${ONYXKEYS.COLLECTION.POLICY}policy2`]: signatureOf(policy2),
            },
        };

        const result = config.compute(buildArgs(policies, reportsWithUnrelated), {
            currentValue: existingValue,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: policies},
        });

        // r1's policy signature differs from the stored one → recomputed (default mock name).
        expect(result?.reports.r1?.reportName).toBe('Test Report');
        // r2's policy matches its stored signature → keeps its existing value.
        expect(result?.reports.r2?.reportName).toBe('Old Name 2');
        // r3 references a policy that did not load → keeps its existing value (not recomputed).
        expect(result?.reports.r3?.reportName).toBe('Old Name 3');
        // The changed policy's signature is refreshed in the stored baseline.
        expect(result?.policySignatures?.[`${ONYXKEYS.COLLECTION.POLICY}policy1`]).toBe(policyRelevantSignature(policy1));
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

        // The stored baseline knows only the sender policy, as if it arrived in an earlier batch.
        const existingValue: ReportAttributesDerivedValue = {
            reports: {
                invoiceRoom: {reportName: 'Old Room', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                invoiceChild: {reportName: 'Old Child', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
            },
            locale: null,
            policySignatures: {
                [`${ONYXKEYS.COLLECTION.POLICY}senderPolicy`]: signatureOf(senderPolicy),
            },
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
            policySignatures: {
                [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: signatureOf(policy1),
                [`${ONYXKEYS.COLLECTION.POLICY}policy2`]: signatureOf(policy2),
            },
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

    it('skips recompute when only Onyx write-bookkeeping keys change on a policy', () => {
        const policy1WithWriteNoise = {...policy1, pendingFields: {generalSettings: 'update'}, errorFields: {generalSettings: {a: 'err'}}} as unknown as Policy;
        const updatedPolicies: OnyxCollection<Policy> = {
            ...policies,
            [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1WithWriteNoise,
        };

        const existingValue: ReportAttributesDerivedValue = {
            reports: {
                r1: {reportName: 'Existing r1', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                r2: {reportName: 'Existing r2', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
            },
            locale: null,
            policySignatures: {
                [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: signatureOf(policy1),
                [`${ONYXKEYS.COLLECTION.POLICY}policy2`]: signatureOf(policy2),
            },
            conciergeReportID: null,
            isTrackIntentUser: false,
        };

        const result = config.compute(buildArgs(updatedPolicies), {
            currentValue: existingValue,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: {[`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1WithWriteNoise} as never},
        });

        // No content change → return currentValue unchanged
        expect(result).toEqual(existingValue);
    });

    it('recomputes reports of a policy whose name changes', () => {
        const policy1Renamed = {...policy1, name: 'Renamed Workspace'} as unknown as Policy;
        const updatedPolicies: OnyxCollection<Policy> = {
            ...policies,
            [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1Renamed,
        };

        const existingValue: ReportAttributesDerivedValue = {
            reports: {
                r1: {reportName: 'Old Name 1', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                r2: {reportName: 'Old Name 2', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
            },
            locale: null,
            policySignatures: {
                [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: signatureOf(policy1),
                [`${ONYXKEYS.COLLECTION.POLICY}policy2`]: signatureOf(policy2),
            },
        };

        const result = config.compute(buildArgs(updatedPolicies), {
            currentValue: existingValue,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: {[`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1Renamed} as never},
        });

        // Report names embed the workspace name, so a rename recomputes that policy's reports.
        expect(result?.reports.r1?.reportName).toBe('Test Report');
        expect(result?.reports.r2?.reportName).toBe('Old Name 2');
        expect(result?.policySignatures?.[`${ONYXKEYS.COLLECTION.POLICY}policy1`]).toBe(signatureOf(policy1Renamed));
    });

    it('keeps the concierge baseline on passes that did not recompute everything', () => {
        const existingValue: ReportAttributesDerivedValue = {
            reports: {
                r1: {reportName: 'Old Name 1', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                r2: {reportName: 'Old Name 2', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
            },
            locale: null,
            policySignatures: {
                [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: signatureOf(policy1),
                [`${ONYXKEYS.COLLECTION.POLICY}policy2`]: signatureOf(policy2),
            },
            conciergeReportID: 'conciergeOld',
            isTrackIntentUser: false,
        };

        // An incremental pass while the current conciergeReportID already drifted (it changed while
        // computes were deferred): the baseline must NOT advance, or the change would be absorbed.
        const incrementalResult = config.compute(buildArgs(policies, undefined, null, 'conciergeNew'), {
            currentValue: existingValue,
            sourceValues: {[ONYXKEYS.COLLECTION.REPORT]: {[`${ONYXKEYS.COLLECTION.REPORT}r1`]: report1}},
        });
        expect(incrementalResult?.conciergeReportID).toBe('conciergeOld');
        expect(incrementalResult?.reports.r2?.reportName).toBe('Old Name 2');

        // The next delivery of the key compares against the preserved baseline → full recompute + advance.
        const deliveryResult = config.compute(buildArgs(policies, undefined, null, 'conciergeNew'), {
            currentValue: incrementalResult,
            sourceValues: {[ONYXKEYS.CONCIERGE_REPORT_ID]: 'conciergeNew' as never},
        });
        expect(deliveryResult?.conciergeReportID).toBe('conciergeNew');
        expect(deliveryResult?.reports.r2?.reportName).toBe('Test Report');
    });

    it('does not persist advanced policy signatures when the reports collection is unavailable', () => {
        const policy1Changed = {...policy1, approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL} as unknown as Policy;
        const updatedPolicies: OnyxCollection<Policy> = {
            ...policies,
            [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1Changed,
        };
        const existingValue: ReportAttributesDerivedValue = {
            reports: {
                r1: {reportName: 'Old Name 1', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
            },
            locale: null,
            policySignatures: {
                [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: signatureOf(policy1),
                [`${ONYXKEYS.COLLECTION.POLICY}policy2`]: signatureOf(policy2),
            },
        };

        const argsWithoutReports = [
            undefined, // reports
            null, // preferredLocale
            null, // transactionViolations
            null, // reportActions
            null, // reportNameValuePairs
            null, // transactions
            null, // personalDetails
            null, // session
            updatedPolicies, // policies
            null, // policyTags
            null, // conciergeReportID
            null, // introSelected
        ] as unknown as Parameters<ReportAttributesConfig['compute']>[0];

        const result = config.compute(argsWithoutReports, {
            currentValue: existingValue,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: {[`${ONYXKEYS.COLLECTION.POLICY}policy1`]: policy1Changed} as never},
        });

        // The scoped recompute could not run, so the old baseline must survive — the next delivery
        // re-diffs against it and retries the recompute.
        expect(result?.policySignatures?.[`${ONYXKEYS.COLLECTION.POLICY}policy1`]).toBe(signatureOf(policy1));
    });

    it('snapshots the policy baseline after a full scan even without a policy trigger', () => {
        const result = config.compute(buildArgs(), {
            currentValue: undefined,
            sourceValues: {[ONYXKEYS.COLLECTION.REPORT]: {[`${ONYXKEYS.COLLECTION.REPORT}r1`]: report1}},
        });

        expect(result?.reports.r1?.reportName).toBe('Test Report');
        expect(result?.policySignatures).toEqual({
            [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: signatureOf(policy1),
            [`${ONYXKEYS.COLLECTION.POLICY}policy2`]: signatureOf(policy2),
        });
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
