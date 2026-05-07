import type {OnyxCollection} from 'react-native-onyx';
import type reportAttributesModuleDefault from '@userActions/OnyxDerived/configs/reportAttributes';
import {hasPolicyRelevantFieldChanged} from '@userActions/OnyxDerived/configs/reportAttributes';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAttributesDerivedValue} from '@src/types/onyx';

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

    const buildArgs = (overridePolicies?: OnyxCollection<Policy>) =>
        [
            reports, // reports
            null, // preferredLocale
            null, // transactionViolations
            null, // reportActions
            null, // reportNameValuePairs
            null, // transactions
            null, // personalDetails
            null, // session
            overridePolicies ?? policies, // policies
            null, // policyTags
            null, // reportViolations
            null, // reportMetadata
        ] as unknown as Parameters<ReportAttributesConfig['compute']>[0];

    it('triggers full recompute when policies are loaded for the first time', () => {
        const result = config.compute(buildArgs(), {
            currentValue: undefined,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: policies as never},
        });

        expect(result?.reports).toHaveProperty('r1');
        expect(result?.reports).toHaveProperty('r2');
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

        const computeReportName = (jest.requireMock('@libs/ReportNameUtils') as unknown as {computeReportName: jest.Mock}).computeReportName;
        computeReportName.mockReturnValue('New Name');

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
});
