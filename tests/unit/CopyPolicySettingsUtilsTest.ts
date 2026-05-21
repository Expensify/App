import {
    areAllTargetsAccountingCompatible,
    areAllTargetsCompatibleForAccountingPart,
    arePoliciesAccountingCompatible,
    getAccountingConnectionIdentity,
    getConnectionCompanyID,
    isCopyPolicySettingsPartEnabledOnSource,
    isTargetCompatibleForAccountingPart,
} from '@libs/CopyPolicySettingsUtils';
import type {CopyPolicySettingsSourceFeatureContext} from '@libs/CopyPolicySettingsUtils';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {ConnectionName} from '@src/types/onyx/Policy';
import createRandomPolicy from '../utils/collections/policies';

function makePolicyWithConnection(connectionName: ConnectionName, connectionPayload: Record<string, unknown>): Policy {
    const base = createRandomPolicy(0, CONST.POLICY.TYPE.CORPORATE);
    return {
        ...base,
        connections: {
            [connectionName]: connectionPayload,
        },
    } as Policy;
}

describe('CopyPolicySettingsUtils', () => {
    describe('getConnectionCompanyID', () => {
        it('returns realmId for QuickBooks Online', () => {
            const policy = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.QBO, {config: {realmId: 'REALM-123'}});
            expect(getConnectionCompanyID(policy, CONST.POLICY.CONNECTIONS.NAME.QBO)).toBe('REALM-123');
        });

        it('returns top-level accountID for NetSuite', () => {
            const policy = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.NETSUITE, {accountID: 'NS-ACME'});
            expect(getConnectionCompanyID(policy, CONST.POLICY.CONNECTIONS.NAME.NETSUITE)).toBe('NS-ACME');
        });

        it('returns credentials.companyID for Sage Intacct', () => {
            const policy = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, {config: {credentials: {companyID: 'INTACCT-1'}}});
            expect(getConnectionCompanyID(policy, CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT)).toBe('INTACCT-1');
        });

        it('returns credentials.companyID for Xero', () => {
            const policy = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.XERO, {config: {credentials: {companyID: 'XERO-1'}}});
            expect(getConnectionCompanyID(policy, CONST.POLICY.CONNECTIONS.NAME.XERO)).toBe('XERO-1');
        });

        it('returns credentials.companyID for QuickBooks Desktop', () => {
            const policy = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.QBD, {config: {credentials: {companyID: 'QBD-1'}}});
            expect(getConnectionCompanyID(policy, CONST.POLICY.CONNECTIONS.NAME.QBD)).toBe('QBD-1');
        });

        it('returns undefined when the connection field is missing', () => {
            const policy = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.QBO, {config: {}});
            expect(getConnectionCompanyID(policy, CONST.POLICY.CONNECTIONS.NAME.QBO)).toBeUndefined();
        });

        it('returns undefined when the policy has no connections at all', () => {
            const policy = createRandomPolicy(0);
            expect(getConnectionCompanyID(policy, CONST.POLICY.CONNECTIONS.NAME.QBO)).toBeUndefined();
        });
    });

    describe('getAccountingConnectionIdentity', () => {
        it('returns null for a policy with no connections', () => {
            const policy = createRandomPolicy(0);
            expect(getAccountingConnectionIdentity(policy)).toBeNull();
        });

        it('returns null for undefined input', () => {
            expect(getAccountingConnectionIdentity(undefined)).toBeNull();
        });

        it('returns the first valid accounting connection identity', () => {
            const policy = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.NETSUITE, {accountID: 'NS-ACME'});
            expect(getAccountingConnectionIdentity(policy)).toEqual({
                connectionName: CONST.POLICY.CONNECTIONS.NAME.NETSUITE,
                companyID: 'NS-ACME',
            });
        });
    });

    describe('arePoliciesAccountingCompatible', () => {
        it('matches the design doc scenarios that should be INCOMPATIBLE', () => {
            const empty = createRandomPolicy(0);
            const empty2 = createRandomPolicy(1);
            const netsuiteAcme = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.NETSUITE, {accountID: 'ACME'});
            const netsuiteExpensivePie = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.NETSUITE, {accountID: 'EXPENSIVE-PIE'});
            const qbo = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.QBO, {config: {realmId: 'REALM-1'}});

            // Source connected to nothing, target connected to NetSuite
            expect(arePoliciesAccountingCompatible(empty, netsuiteAcme)).toBe(false);

            // Source connected to QBO, target connected to nothing
            expect(arePoliciesAccountingCompatible(qbo, empty2)).toBe(false);

            // Source connected to NetSuite Acme Corp, target connected to NetSuite ExpensivePie
            expect(arePoliciesAccountingCompatible(netsuiteAcme, netsuiteExpensivePie)).toBe(false);

            // Different connection names entirely
            expect(arePoliciesAccountingCompatible(qbo, netsuiteAcme)).toBe(false);
        });

        it('returns true when both policies have no accounting connection', () => {
            expect(arePoliciesAccountingCompatible(createRandomPolicy(0), createRandomPolicy(1))).toBe(true);
        });

        it('returns true when both policies are connected to the same account', () => {
            const a = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.NETSUITE, {accountID: 'SAME-ACCOUNT'});
            const b = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.NETSUITE, {accountID: 'SAME-ACCOUNT'});
            expect(arePoliciesAccountingCompatible(a, b)).toBe(true);
        });

        it('treats a missing companyID on either side as incompatible', () => {
            const knownAccount = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.NETSUITE, {accountID: 'KNOWN'});
            const unknownAccount = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.NETSUITE, {});
            expect(arePoliciesAccountingCompatible(knownAccount, unknownAccount)).toBe(false);
            expect(arePoliciesAccountingCompatible(unknownAccount, knownAccount)).toBe(false);
        });

        it('compares QBO realmIds correctly', () => {
            const qbo1 = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.QBO, {config: {realmId: 'R1'}});
            const qbo2 = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.QBO, {config: {realmId: 'R2'}});
            const qbo1Again = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.QBO, {config: {realmId: 'R1'}});

            expect(arePoliciesAccountingCompatible(qbo1, qbo2)).toBe(false);
            expect(arePoliciesAccountingCompatible(qbo1, qbo1Again)).toBe(true);
        });

        it('treats an unresolved target policy as incompatible', () => {
            const empty = createRandomPolicy(0);
            expect(arePoliciesAccountingCompatible(empty, undefined)).toBe(false);
            expect(arePoliciesAccountingCompatible(undefined, undefined)).toBe(false);
        });
    });

    describe('isCopyPolicySettingsPartEnabledOnSource', () => {
        const baseContext: CopyPolicySettingsSourceFeatureContext = {
            policy: createRandomPolicy(0),
            memberCount: 2,
            categoriesCount: 1,
            totalTags: 1,
            reportFieldsCount: 1,
            taxesCount: 1,
            distanceRatesCount: 1,
            perDiemCount: 1,
            connectedIntegrationCount: 1,
            hasWorkflowRules: true,
            hasWorkspaceRules: true,
            hasInvoiceConfiguration: true,
            isCollectPolicy: false,
        };

        it('always shows overview', () => {
            expect(isCopyPolicySettingsPartEnabledOnSource('overview', baseContext)).toBe(true);
        });

        it('shows members only when there is more than one member', () => {
            expect(isCopyPolicySettingsPartEnabledOnSource('members', {...baseContext, memberCount: 1})).toBe(false);
            expect(isCopyPolicySettingsPartEnabledOnSource('members', baseContext)).toBe(true);
        });

        it('shows categories when the source has categories', () => {
            expect(isCopyPolicySettingsPartEnabledOnSource('categories', {...baseContext, categoriesCount: 0})).toBe(false);
            expect(isCopyPolicySettingsPartEnabledOnSource('categories', baseContext)).toBe(true);
        });

        it('shows per diem when rates exist', () => {
            expect(isCopyPolicySettingsPartEnabledOnSource('perDiem', {...baseContext, perDiemCount: 0})).toBe(false);
            expect(isCopyPolicySettingsPartEnabledOnSource('perDiem', baseContext)).toBe(true);
        });

        it('hides travel when the source policy does not have travel enabled', () => {
            expect(isCopyPolicySettingsPartEnabledOnSource('travel', baseContext)).toBe(false);

            const travelPolicy = createRandomPolicy(3);
            travelPolicy.isTravelEnabled = true;
            expect(isCopyPolicySettingsPartEnabledOnSource('travel', {...baseContext, policy: travelPolicy})).toBe(true);
        });

        it('hides distance rates when the feature flag is off even if rates exist', () => {
            expect(isCopyPolicySettingsPartEnabledOnSource('distanceRates', baseContext)).toBe(false);

            const distancePolicy = createRandomPolicy(4);
            distancePolicy.areDistanceRatesEnabled = true;
            expect(isCopyPolicySettingsPartEnabledOnSource('distanceRates', {...baseContext, policy: distancePolicy})).toBe(true);
        });
    });

    describe('isTargetCompatibleForAccountingPart', () => {
        const empty = createRandomPolicy(0);
        const empty2 = createRandomPolicy(1);
        const netsuiteAcme = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.NETSUITE, {accountID: 'ACME'});
        const netsuiteExpensivePie = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.NETSUITE, {accountID: 'EXPENSIVE-PIE'});
        const netsuiteAcmeAgain = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.NETSUITE, {accountID: 'ACME'});
        const qbo = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.QBO, {config: {realmId: 'REALM-1'}});

        it('allows install: source connected, target unconnected', () => {
            expect(isTargetCompatibleForAccountingPart(netsuiteAcme, empty)).toBe(true);
        });

        it('allows both unconnected', () => {
            expect(isTargetCompatibleForAccountingPart(empty, empty2)).toBe(true);
        });

        it('allows same connection on both sides', () => {
            expect(isTargetCompatibleForAccountingPart(netsuiteAcme, netsuiteAcmeAgain)).toBe(true);
        });

        it('rejects swap: target connected to a different account', () => {
            expect(isTargetCompatibleForAccountingPart(netsuiteAcme, netsuiteExpensivePie)).toBe(false);
        });

        it('rejects swap: target connected to a different integration', () => {
            expect(isTargetCompatibleForAccountingPart(netsuiteAcme, qbo)).toBe(false);
        });

        it('rejects wipe: source unconnected, target connected', () => {
            expect(isTargetCompatibleForAccountingPart(empty, netsuiteAcme)).toBe(false);
        });

        it('treats unresolved target as incompatible', () => {
            expect(isTargetCompatibleForAccountingPart(netsuiteAcme, undefined)).toBe(false);
        });
    });

    describe('areAllTargetsCompatibleForAccountingPart', () => {
        it('returns true when every target is unconnected (install on all)', () => {
            const source = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.NETSUITE, {accountID: 'ACME'});
            const t1 = createRandomPolicy(1);
            const t2 = createRandomPolicy(2);
            expect(areAllTargetsCompatibleForAccountingPart(source, [t1, t2])).toBe(true);
        });

        it('returns false when any target is connected to a different account', () => {
            const source = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.NETSUITE, {accountID: 'ACME'});
            const ok = createRandomPolicy(1);
            const bad = makePolicyWithConnection(CONST.POLICY.CONNECTIONS.NAME.NETSUITE, {accountID: 'PIE'});
            expect(areAllTargetsCompatibleForAccountingPart(source, [ok, bad])).toBe(false);
        });
    });

    describe('areAllTargetsAccountingCompatible', () => {
        it('returns false when any target policy is unresolved', () => {
            const empty = createRandomPolicy(0);
            const loaded = createRandomPolicy(1);
            expect(areAllTargetsAccountingCompatible(empty, [loaded, undefined])).toBe(false);
        });

        it('returns true when every loaded target is compatible', () => {
            const empty = createRandomPolicy(0);
            const targetA = createRandomPolicy(1);
            const targetB = createRandomPolicy(2);
            expect(areAllTargetsAccountingCompatible(empty, [targetA, targetB])).toBe(true);
        });
    });
});
