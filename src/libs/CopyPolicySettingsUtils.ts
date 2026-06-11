import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Policy} from '@src/types/onyx';
import type {ConnectionName} from '@src/types/onyx/Policy';
import {isAuthenticationError} from './actions/connections';
import type {Part} from './actions/Policy/CopyPolicySettings';
import {isTimeTrackingEnabled} from './PolicyUtils';

type FeatureRow = {
    part: Part;
    labelKey: TranslationPaths;
};

const FEATURE_ROWS = [
    {part: 'overview', labelKey: 'workspace.common.profile'},
    {part: 'members', labelKey: 'workspace.common.members'},
    {part: 'reports', labelKey: 'workspace.common.reports'},
    {part: 'accounting', labelKey: 'workspace.common.accounting'},
    {part: 'categories', labelKey: 'workspace.common.categories'},
    {part: 'tags', labelKey: 'workspace.common.tags'},
    {part: 'taxes', labelKey: 'workspace.common.taxes'},
    {part: 'workflows', labelKey: 'workspace.common.workflows'},
    {part: 'rules', labelKey: 'workspace.common.rules'},
    {part: 'codingRules', labelKey: 'workspace.duplicateWorkspace.merchantRules'},
    {part: 'distanceRates', labelKey: 'workspace.common.distanceRates'},
    {part: 'perDiem', labelKey: 'workspace.common.perDiem'},
    {part: 'invoices', labelKey: 'workspace.common.invoices'},
    {part: 'travel', labelKey: 'workspace.common.travel'},
    {part: 'timeTracking', labelKey: 'workspace.moreFeatures.timeTracking.title'},
] as const satisfies readonly FeatureRow[];

type CopyPolicySettingsSourceFeatureContext = {
    policy: Policy | undefined;
    memberCount: number;
    categoriesCount: number;
    totalTags: number;
    reportFieldsCount: number;
    taxesCount: number;
    distanceRatesCount: number;
    perDiemCount: number;
    connectedIntegrationCount: number;
    hasWorkflowRules: boolean;
    hasWorkspaceRules: boolean;
    codingRulesCount: number;
    hasInvoiceConfiguration: boolean;
    isCollectPolicy: boolean;
};

/**
 * Identifier for the external account a policy's accounting connection points to. `companyID`
 * is stored in different paths on each integration's connection JSON, so we read each one out
 * to a single shape we can compare across policies.
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
 * Returns true when source and target share the same accounting connection (or both have
 * none). Categories/Tags/Reports/Taxes IDs are only valid against the
 * target's existing connection, so the connections must already match.
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
 * Copying accounting settings is allowed when the target is unconnected or already matches the source.
 * Swap (target connected to a different account) and wipe (source unconnected, target connected) are rejected.
 */
function isTargetCompatibleForAccountingPart(source: Policy | undefined, target: Policy | undefined): boolean {
    if (!target) {
        return false;
    }

    const targetIdentity = getAccountingConnectionIdentity(target);
    if (!targetIdentity || !targetIdentity.companyID) {
        return true;
    }

    const sourceIdentity = getAccountingConnectionIdentity(source);
    if (!sourceIdentity || !sourceIdentity.companyID) {
        return false;
    }
    if (sourceIdentity.connectionName !== targetIdentity.connectionName) {
        return false;
    }
    return sourceIdentity.companyID === targetIdentity.companyID;
}

/**
 * Returns true when every target shares the same accounting connection as the source (or all
 * are unconnected). Used to gate Categories/Tags/Reports/Taxes when "accounting" is not also
 * being copied.
 */
function areAllTargetsAccountingCompatible(source: Policy | undefined, targets: ReadonlyArray<Policy | undefined>): boolean {
    return targets.every((target) => arePoliciesAccountingCompatible(source, target));
}

/**
 * Returns true when every target accepts the source's accounting connection (install or
 * already matching). Used to gate the "accounting" feature row.
 */
function areAllTargetsCompatibleForAccountingPart(source: Policy | undefined, targets: ReadonlyArray<Policy | undefined>): boolean {
    return targets.every((target) => isTargetCompatibleForAccountingPart(source, target));
}

/**
 * Whether a copy-settings part should appear on the Select Features step for the source policy.
 * Matches WorkspaceDuplicateSelectFeaturesForm visibility rules.
 */
function isCopyPolicySettingsPartEnabledOnSource(part: Part, context: CopyPolicySettingsSourceFeatureContext): boolean {
    const {policy} = context;

    switch (part) {
        case 'overview':
            return true;
        case 'members':
            return context.memberCount > 1;
        case 'reports':
            return context.reportFieldsCount > 0;
        case 'accounting':
            return context.connectedIntegrationCount > 0;
        case 'categories':
            return context.categoriesCount > 0;
        case 'tags':
            return context.totalTags > 0;
        case 'taxes':
            return context.taxesCount > 0;
        case 'workflows':
            return context.hasWorkflowRules;
        case 'rules':
            return context.hasWorkspaceRules && !context.isCollectPolicy;
        case 'codingRules':
            return context.codingRulesCount > 0 && !context.isCollectPolicy;
        case 'distanceRates':
            return context.distanceRatesCount > 0 && !!policy?.areDistanceRatesEnabled;
        case 'perDiem':
            return context.perDiemCount > 0;
        case 'invoices':
            return !!policy?.areInvoicesEnabled && context.hasInvoiceConfiguration;
        case 'travel':
            return !!policy?.isTravelEnabled;
        case 'timeTracking':
            return isTimeTrackingEnabled(policy);
        default:
            return false;
    }
}

/** Subtitle for the time tracking row; rate is shown without currency because targets may use a different output currency. */
function getTimeTrackingCopySettingsDescription(policy: Policy | undefined, translate: LocalizedTranslate): string {
    const hourlyRate = policy?.units?.time?.rate;
    if (hourlyRate !== undefined) {
        return `${translate('common.enabled')}, ${translate('workspace.moreFeatures.timeTracking.defaultHourlyRate')}: ${hourlyRate}`;
    }
    return translate('common.enabled');
}

export {
    getConnectionCompanyID,
    getAccountingConnectionIdentity,
    arePoliciesAccountingCompatible,
    areAllTargetsAccountingCompatible,
    isTargetCompatibleForAccountingPart,
    areAllTargetsCompatibleForAccountingPart,
    isCopyPolicySettingsPartEnabledOnSource,
    getTimeTrackingCopySettingsDescription,
    FEATURE_ROWS,
};
export type {CopyPolicySettingsSourceFeatureContext};
