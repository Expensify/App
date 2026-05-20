import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {ConnectionName} from '@src/types/onyx/Policy';
import {isAuthenticationError} from './actions/connections';

/**
 * Identifier for the external account a policy's accounting connection points to. `companyID`
 * is stored in different paths on each integration's connection JSON, so we read each one out
 * to a single shape we can compare across policies.
 *
 * Mirrors `Policy::getConnectionCompanyID` in Auth/auth/lib/Policy.cpp.
 */
type AccountingConnectionIdentity = {
    connectionName: ConnectionName;
    companyID: string | undefined;
};

/**
 * Reads the external companyID from a credentials block. Some App types don't yet model the
 * `credentials.companyID` field on every connection, so we narrow it inline rather than
 * widening the global types.
 */
function readCredentialsCompanyID(config: unknown): string | undefined {
    if (!config || typeof config !== 'object') {
        return undefined;
    }
    const credentials = (config as {credentials?: unknown}).credentials;
    if (!credentials || typeof credentials !== 'object') {
        return undefined;
    }
    const companyID = (credentials as {companyID?: unknown}).companyID;
    return typeof companyID === 'string' && companyID.length > 0 ? companyID : undefined;
}

/**
 * Returns the external companyID for the given accounting connection on a policy, or
 * undefined when the connection isn't set up / the identifier is missing.
 */
function getConnectionCompanyID(policy: Policy | undefined, connectionName: ConnectionName): string | undefined {
    const connections = policy?.connections;
    if (!connections) {
        return undefined;
    }

    switch (connectionName) {
        case CONST.POLICY.CONNECTIONS.NAME.QBO: {
            const realmId = connections[CONST.POLICY.CONNECTIONS.NAME.QBO]?.config?.realmId;
            return realmId || undefined;
        }
        case CONST.POLICY.CONNECTIONS.NAME.NETSUITE: {
            const netsuiteAccountID = connections[CONST.POLICY.CONNECTIONS.NAME.NETSUITE]?.accountID;
            return netsuiteAccountID || undefined;
        }
        case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
            return readCredentialsCompanyID(connections[CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]?.config);
        case CONST.POLICY.CONNECTIONS.NAME.XERO:
            return readCredentialsCompanyID(connections[CONST.POLICY.CONNECTIONS.NAME.XERO]?.config);
        case CONST.POLICY.CONNECTIONS.NAME.QBD:
            return readCredentialsCompanyID(connections[CONST.POLICY.CONNECTIONS.NAME.QBD]?.config);
        case CONST.POLICY.CONNECTIONS.NAME.CERTINIA:
            return readCredentialsCompanyID(connections[CONST.POLICY.CONNECTIONS.NAME.CERTINIA]?.config);
        default:
            return undefined;
    }
}

/**
 * Returns the identity of the first valid accounting connection on a policy, or `null` when
 * the policy has no accounting connection set up (or all connections are unauthenticated).
 */
function getAccountingConnectionIdentity(policy: Policy | undefined): AccountingConnectionIdentity | null {
    if (!policy?.connections) {
        return null;
    }
    for (const connectionName of CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES) {
        if (!policy.connections[connectionName] || isAuthenticationError(policy, connectionName)) {
            continue;
        }
        return {connectionName, companyID: getConnectionCompanyID(policy, connectionName)};
    }
    return null;
}

/**
 * Two policies are accounting-compatible when:
 *  - both have no accounting connection, OR
 *  - both have the same connection name AND a non-empty matching companyID.
 *
 * Anything else (different connections, one side missing, unknown/empty companyID on either
 * side) is treated as incompatible — Categories/Tags/Reports/Taxes can't be safely copied
 * across mismatched external accounts.
 */
function arePoliciesAccountingCompatible(source: Policy | undefined, target: Policy | undefined): boolean {
    if (!target) {
        return false;
    }

    const sourceIdentity = getAccountingConnectionIdentity(source);
    const targetIdentity = getAccountingConnectionIdentity(target);

    if (!sourceIdentity && !targetIdentity) {
        return true;
    }
    if (!sourceIdentity || !targetIdentity) {
        return false;
    }
    if (sourceIdentity.connectionName !== targetIdentity.connectionName) {
        return false;
    }
    if (!sourceIdentity.companyID || !targetIdentity.companyID) {
        return false;
    }
    return sourceIdentity.companyID === targetIdentity.companyID;
}

/**
 * Returns true when every target policy is accounting-compatible with the source. If any
 * target is incompatible, accounting-dependent parts (Categories, Tags, Reports, Taxes) must
 * be shown as disabled in the Select Features step.
 */
function areAllTargetsAccountingCompatible(source: Policy | undefined, targets: ReadonlyArray<Policy | undefined>): boolean {
    return targets.every((target) => arePoliciesAccountingCompatible(source, target));
}

export {getConnectionCompanyID, getAccountingConnectionIdentity, arePoliciesAccountingCompatible, areAllTargetsAccountingCompatible};
export type {AccountingConnectionIdentity};
