import {hasSynchronizationErrorMessage, isConnectionInProgress, isConnectionUnverified} from '@libs/actions/connections';
import {getDisplayNameForWorkspace} from '@libs/actions/Policy/Policy';
import {getConnectedHRProvider} from '@libs/HRUtils';
import isTeachersUnitePolicyID from '@libs/isTeachersUnitePolicyID';
import {
    canSendInvoice,
    getActiveAdminWorkspaces,
    getActivePoliciesWithExpenseChat,
    getOwnedPaidPolicies,
    getPolicyIDFromDomainName,
    getPolicyRole,
    hasPolicyWithXeroConnection,
    // eslint-disable-next-line no-restricted-imports -- isPaidGroupPolicy is intentional: copy-settings targets are billing/paid-only (Collect/Control), so free group plans like Submit must be excluded (see createCopySettingsEligibleTargetsSelector).
    isPaidGroupPolicy,
    isPendingDeletePolicy,
    isPerDiemEligiblePolicy,
    isPolicyAdmin,
    isArchivedPolicy,
    isTimeTrackingEnabled,
    shouldShowPolicy,
} from '@libs/PolicyUtils';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyConnectionSyncProgress, PolicyReportField} from '@src/types/onyx';
import type {PolicyConnectionName, PolicyDetailsForNonMembers} from '@src/types/onyx/Policy';
import ObjectUtils from '@src/types/utils/ObjectUtils';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import escapeRegExp from 'lodash/escapeRegExp';

type ReusablePolicyConnectionName =
    | typeof CONST.POLICY.CONNECTIONS.NAME.NETSUITE
    | typeof CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT
    | typeof CONST.POLICY.CONNECTIONS.NAME.QBD
    | typeof CONST.POLICY.CONNECTIONS.NAME.CERTINIA
    | typeof CONST.POLICY.CONNECTIONS.NAME.RILLET
    | typeof CONST.POLICY.CONNECTIONS.NAME.DUALENTRY;

const ownerPoliciesSelector = (policies: OnyxCollection<Policy>, currentUserAccountID: number) => getOwnedPaidPolicies(policies, currentUserAccountID);

type OwnedPaidPoliciesCounts = {
    /** Number of paid policies owned by the user */
    total: number;

    /** Number of owned paid policies that are not pending deletion */
    active: number;
};

/**
 * Creates a selector returning only the counts of owned paid policies, so subscribers don't re-render
 * when anything else on the policy collection changes.
 */
const createOwnedPaidPoliciesCountsSelector =
    (currentUserAccountID: number | undefined) =>
    (policies: OnyxCollection<Policy>): OwnedPaidPoliciesCounts => {
        const ownedPaidPolicies = getOwnedPaidPolicies(policies, currentUserAccountID);
        return {
            total: ownedPaidPolicies.length,
            active: ownedPaidPolicies.filter((policy) => !isPendingDeletePolicy(policy)).length,
        };
    };

/**
 * Creates a selector returning only the IDs of policies eligible as copy-settings targets, so
 * subscribers don't re-render when anything else on the policy collection changes. Targets are
 * limited to paid group workspaces (Collect/Control) the user administers - copy-settings carries
 * paid features, and Collect targets are upgraded to Control in-flow, so Submit/Personal workspaces
 * are never valid targets.
 */
const createCopySettingsEligibleTargetsSelector =
    (currentUserLogin: string | undefined) =>
    (policies: OnyxCollection<Policy>): string[] =>
        Object.values(policies ?? {})
            .filter((policy): policy is Policy => !!policy && isPaidGroupPolicy(policy) && isPolicyAdmin(policy, currentUserLogin) && !isPendingDeletePolicy(policy))
            .map((policy) => policy.id);

type WorkspaceListPolicy = Pick<Policy, 'id' | 'name' | 'type' | 'role' | 'ownerAccountID' | 'avatarURL' | 'pendingAction' | 'errors'> & {
    /** Whether the policy is optimistically pending deletion */
    isPendingDelete: boolean;

    /** Whether the policy has been archived */
    isArchived: boolean;

    /** Whether the current user has a pending request to join the policy */
    isJoinRequestPending: boolean;

    /** Projection of policyDetailsForNonMembers for join-request-pending policies */
    nonMemberDetails?: Pick<PolicyDetailsForNonMembers, 'name' | 'type' | 'ownerAccountID' | 'ownerEmail' | 'avatar'> & {
        policyID: string;

        /** Default avatar URL for the owner, derived here so the page doesn't re-hash the email on every render */
        ownerDefaultAvatar?: string;
    };
};

/**
 * Creates a selector returning a light, flat projection of the policies shown on the workspaces list,
 * so the page doesn't re-render when deep, frequently mutated policy fields change (isLoading* flags,
 * employeeList, customUnits, connections, etc.).
 */
const createWorkspaceListPoliciesSelector =
    (currentUserLogin: string | undefined, showArchived = false) =>
    (policies: OnyxCollection<Policy>): WorkspaceListPolicy[] => {
        const result: WorkspaceListPolicy[] = [];
        for (const policy of Object.values(policies ?? {})) {
            if (!policy || !shouldShowPolicy(policy, true, currentUserLogin, showArchived)) {
                continue;
            }

            const isArchived = isArchivedPolicy(policy);
            const isJoinRequestPending = !!policy.isJoinRequestPending && !!policy.policyDetailsForNonMembers;
            let nonMemberDetails: WorkspaceListPolicy['nonMemberDetails'];
            if (isJoinRequestPending) {
                const nonMemberEntry = Object.entries(policy.policyDetailsForNonMembers ?? {}).at(0);
                if (nonMemberEntry) {
                    const [nonMemberPolicyID, details] = nonMemberEntry;
                    nonMemberDetails = {
                        policyID: nonMemberPolicyID,
                        name: details.name,
                        type: details.type,
                        ownerAccountID: details.ownerAccountID,
                        ownerEmail: details.ownerEmail,
                        ownerDefaultAvatar:
                            details.ownerAccountID && details.ownerEmail ? getDefaultAvatarURL({accountID: details.ownerAccountID, accountEmail: details.ownerEmail}) : undefined,
                        avatar: details.avatar,
                    };
                }
            }

            result.push({
                id: policy.id,
                name: policy.name,
                type: policy.type,
                role: getPolicyRole(policy, currentUserLogin) as ValueOf<typeof CONST.POLICY.ROLE>,
                ownerAccountID: policy.ownerAccountID,
                avatarURL: policy.avatarURL,
                pendingAction: policy.pendingAction,
                errors: policy.errors,
                isPendingDelete: isPendingDeletePolicy(policy),
                isArchived,
                isJoinRequestPending,
                nonMemberDetails,
            });
        }
        return result;
    };

const activeAdminPoliciesSelector = (policies: OnyxCollection<Policy>, currentUserAccountLogin: string) => getActiveAdminWorkspaces(policies, currentUserAccountLogin);

type BrokenPolicyConnection = {
    /** The policy ID associated with this connection */
    policyID: string;

    /** The policy name associated with this connection */
    policyName: string;

    /** The connection name that has an error */
    connectionName: PolicyConnectionName;

    /** Human-readable integration name (e.g. "QuickBooks Online", "Gusto", "BambooHR"). */
    integrationName: string;
};

/** Only what the Time sensitive widgets read, so the section never deep-compares whole policies */
type TimeSensitiveAdminPolicy = Pick<Policy, 'id' | 'name' | 'achAccount' | 'policyAccountID'>;

type TimeSensitiveAdminPolicies = {
    policies: TimeSensitiveAdminPolicy[];
    brokenConnections: BrokenPolicyConnection[];
};

// derive the broken-connection verdict here: the sync-progress check needs the policy's `connections`
const createTimeSensitiveAdminPoliciesSelector =
    (currentUserLogin: string | undefined, connectionSyncProgress: OnyxCollection<PolicyConnectionSyncProgress>) =>
    (policies: OnyxCollection<Policy>): TimeSensitiveAdminPolicies => {
        const result: TimeSensitiveAdminPolicies = {policies: [], brokenConnections: []};

        for (const policy of getActiveAdminWorkspaces(policies, currentUserLogin)) {
            result.policies.push({
                id: policy.id,
                name: policy.name,
                achAccount: policy.achAccount,
                policyAccountID: policy.policyAccountID,
            });

            const policyConnections = policy.connections;
            if (!policyConnections) {
                continue;
            }

            // Check if there's a sync in progress for this policy using the proper check that handles JOB_DONE and timeout
            const syncProgress = connectionSyncProgress?.[`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy.id}`];
            const isSyncInProgress = isConnectionInProgress(syncProgress, policy);

            for (const [connectionName] of ObjectUtils.typedEntries(policyConnections)) {
                if (!hasSynchronizationErrorMessage(policy, connectionName, isSyncInProgress)) {
                    continue;
                }
                const integrationName =
                    connectionName === CONST.POLICY.CONNECTIONS.NAME.MERGE_HR
                        ? (getConnectedHRProvider(policy)?.displayName ?? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName])
                        : CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName];
                result.brokenConnections.push({
                    policyID: policy.id,
                    policyName: policy.name,
                    connectionName,
                    integrationName,
                });
            }
        }

        return result;
    };

// boolean out, so subscribers don't deep-compare a policy array on every policy_ write
const createHasAdminPolicyWithXeroConnectionSelector =
    (currentUserLogin: string | undefined) =>
    (policies: OnyxCollection<Policy>): boolean =>
        hasPolicyWithXeroConnection(getActiveAdminWorkspaces(policies, currentUserLogin));

const hasActiveAdminPoliciesSelector = (policies: OnyxCollection<Policy>, currentUserAccountLogin: string) => getActiveAdminWorkspaces(policies, currentUserAccountLogin).length > 0;

/**
 * Creates a selector returning only whether the user has any active workspace they can submit expenses to
 * (paid Collect/Control workspaces, plus free Submit (submit2026) workspaces),
 * so subscribers don't re-render when anything else on the policy collection changes.
 */
const createHasWorkspaceToSubmitToSelector =
    (currentUserLogin: string | undefined) =>
    (policies: OnyxCollection<Policy>): boolean =>
        getActivePoliciesWithExpenseChat(policies, currentUserLogin).length > 0;

/**
 * Creates a selector that aggregates all non-formula policy report fields from all policies,
 * sorted alphabetically by field key using the provided locale compare function
 */
const createAllPolicyReportFieldsSelector = (policies: OnyxCollection<Policy>, localeCompare: (a: string, b: string) => number) => {
    const allPolicyReportFields = Object.values(policies ?? {}).reduce<Record<string, PolicyReportField>>((acc, policy) => {
        Object.assign(acc, policy?.fieldList ?? {});
        return acc;
    }, {});

    const nonFormulaReportFields = Object.entries(allPolicyReportFields)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, value]) => value.type !== CONST.POLICY.DEFAULT_FIELD_LIST_TYPE)
        .sort(([aKey], [bKey]) => localeCompare(aKey, bKey));

    return Object.fromEntries(nonFormulaReportFields);
};

const createPoliciesForDomainCardsSelector = (domainNames: string[]) => {
    const policyIDs = new Set(domainNames.map(getPolicyIDFromDomainName).filter((policyID): policyID is string => !!policyID));

    return (policies: OnyxCollection<Policy>) => {
        if (policyIDs.size === 0) {
            return {};
        }

        return Object.entries(policies ?? {}).reduce<NonNullable<OnyxCollection<Policy>>>((acc, [key, policy]) => {
            if (policy?.id && policyIDs.has(policy.id.toUpperCase())) {
                acc[key] = policy;
            }
            return acc;
        }, {});
    };
};

const policyTimeTrackingSelector = (policy: OnyxEntry<Policy>) =>
    policy && {
        outputCurrency: policy.outputCurrency,
        pendingFields: {
            timeTrackingDefaultRate: policy.pendingFields?.timeTrackingDefaultRate,
        },
        units: policy.units,
    };

type PolicySelector = Pick<Policy, 'type' | 'role' | 'pendingAction' | 'avatarURL' | 'name' | 'id' | 'areInvoicesEnabled'>;

const policyMapper = (policy: OnyxEntry<Policy>): PolicySelector | undefined => {
    if (!policy) {
        return undefined;
    }
    return {
        type: policy.type,
        role: policy.role,
        id: policy.id,
        pendingAction: policy.pendingAction,
        avatarURL: policy.avatarURL,
        name: policy.name,
        areInvoicesEnabled: policy.areInvoicesEnabled,
    };
};

type IOURequestStartPolicies = {
    hasPerDiemPolicy: boolean;
    hasMultiplePerDiemPolicies: boolean;
    firstPerDiemPolicyID: string | undefined;
    hasTimePolicy: boolean;
    hasMultipleTimePolicies: boolean;
    firstTimePolicyID: string | undefined;

    /** false unless the invoice flow asked for it */
    canSendInvoiceFromAnyWorkspace: boolean;
};

// Fixed-size output: same shape on 5 workspaces or 5000, so no employeeList/customUnits deepEqual and no growing ID list
const createIOURequestStartPoliciesSelector =
    (currentUserLogin: string | undefined, isInvoice: boolean) =>
    (policies: OnyxCollection<Policy>): IOURequestStartPolicies => {
        let perDiemCount = 0;
        let timeCount = 0;
        let firstPerDiemPolicyID: string | undefined;
        let firstTimePolicyID: string | undefined;

        for (const policy of getActivePoliciesWithExpenseChat(policies, currentUserLogin)) {
            if (perDiemCount < 2 && isPerDiemEligiblePolicy(policy)) {
                firstPerDiemPolicyID ??= policy.id;
                perDiemCount++;
            }
            if (timeCount < 2 && isTimeTrackingEnabled(policy)) {
                firstTimePolicyID ??= policy.id;
                timeCount++;
            }
            // counts cap at 2, nothing downstream needs the real total
            if (perDiemCount >= 2 && timeCount >= 2) {
                break;
            }
        }

        return {
            hasPerDiemPolicy: perDiemCount > 0,
            hasMultiplePerDiemPolicies: perDiemCount > 1,
            firstPerDiemPolicyID,
            hasTimePolicy: timeCount > 0,
            hasMultipleTimePolicies: timeCount > 1,
            firstTimePolicyID,
            canSendInvoiceFromAnyWorkspace: isInvoice && canSendInvoice(policies, currentUserLogin),
        };
    };

type FilteredPoliciesInfo = {
    /** Number of policies that should be shown to the user (short-circuited at 2) */
    filteredPoliciesCount: number;

    /** ID of the first policy that should be shown to the user */
    firstPolicyID: string | undefined;
};

const createFilteredPoliciesInfoSelector =
    (email: string | undefined) =>
    (policies: OnyxCollection<Policy>): FilteredPoliciesInfo => {
        let filteredPoliciesCount = 0;
        let firstPolicyID: string | undefined;
        for (const policy of Object.values(policies ?? {})) {
            if (!policy || !shouldShowPolicy(policy, false, email) || isTeachersUnitePolicyID(policy.id)) {
                continue;
            }
            if (filteredPoliciesCount === 0) {
                firstPolicyID = policy.id;
            }
            filteredPoliciesCount++;
            if (filteredPoliciesCount > 1) {
                break;
            }
        }
        return {filteredPoliciesCount, firstPolicyID};
    };

const hasOnlyPersonalPoliciesSelector = (policies: OnyxCollection<Policy>): boolean => {
    return !Object.values(policies ?? {}).some((policy) => policy && policy.type !== CONST.POLICY.TYPE.PERSONAL && policy.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
};

/**
 * Returns the name of a workspace the member belongs to that calculates commuter exclusions from the member's
 * home address, so the private home address row can name the workspace relying on it.
 */
const homeAndOfficeCommuterExclusionPolicyNameSelector = (policies: OnyxCollection<Policy>): string | undefined =>
    Object.values(policies ?? {}).find(
        (policy) => policy?.commuterExclusions?.method === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE && policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
    )?.name;

function isAdminPolicyConnectedTo(policy: OnyxEntry<Policy>, connectionName: ReusablePolicyConnectionName): policy is Policy {
    return !!policy && policy.role === CONST.POLICY.ROLE.ADMIN && !!policy.connections?.[connectionName];
}

const adminPoliciesConnectedToSageIntacctSelector = (policies: OnyxCollection<Policy>) =>
    Object.values(policies ?? {}).filter<Policy>((policy): policy is Policy => isAdminPolicyConnectedTo(policy, CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT));

const adminPoliciesConnectedToCertiniaSelector = (policies: OnyxCollection<Policy>) =>
    Object.values(policies ?? {}).filter<Policy>((policy): policy is Policy => isAdminPolicyConnectedTo(policy, CONST.POLICY.CONNECTIONS.NAME.CERTINIA));

const adminPoliciesConnectedToNetSuiteSelector = (policies: OnyxCollection<Policy>) =>
    Object.values(policies ?? {}).filter<Policy>((policy): policy is Policy => isAdminPolicyConnectedTo(policy, CONST.POLICY.CONNECTIONS.NAME.NETSUITE));

const adminPoliciesConnectedToQBDSelector = (policies: OnyxCollection<Policy>) =>
    Object.values(policies ?? {}).filter<Policy>((policy): policy is Policy => isAdminPolicyConnectedTo(policy, CONST.POLICY.CONNECTIONS.NAME.QBD));

const adminPoliciesConnectedToRilletSelector = (policies: OnyxCollection<Policy>) =>
    Object.values(policies ?? {}).filter<Policy>((policy): policy is Policy => isAdminPolicyConnectedTo(policy, CONST.POLICY.CONNECTIONS.NAME.RILLET));

const adminPoliciesConnectedToDualEntrySelector = (policies: OnyxCollection<Policy>) =>
    Object.values(policies ?? {}).filter<Policy>((policy): policy is Policy => isAdminPolicyConnectedTo(policy, CONST.POLICY.CONNECTIONS.NAME.DUALENTRY));

const reusableConnectionAdminSelectors: Record<ReusablePolicyConnectionName, (policies: OnyxCollection<Policy>) => Policy[]> = {
    [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: adminPoliciesConnectedToNetSuiteSelector,
    [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: adminPoliciesConnectedToSageIntacctSelector,
    [CONST.POLICY.CONNECTIONS.NAME.QBD]: adminPoliciesConnectedToQBDSelector,
    [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: adminPoliciesConnectedToCertiniaSelector,
    [CONST.POLICY.CONNECTIONS.NAME.RILLET]: adminPoliciesConnectedToRilletSelector,
    [CONST.POLICY.CONNECTIONS.NAME.DUALENTRY]: adminPoliciesConnectedToDualEntrySelector,
};

function isReusablePolicyConnection(policy: Policy, connectionName: ReusablePolicyConnectionName, currentPolicyID?: string) {
    if (policy.id === currentPolicyID) {
        return false;
    }

    return !isConnectionUnverified(policy, connectionName) && !hasSynchronizationErrorMessage(policy, connectionName, false);
}

function getReusablePoliciesConnectedTo(policies: OnyxCollection<Policy>, connectionName: ReusablePolicyConnectionName, currentPolicyID?: string) {
    return reusableConnectionAdminSelectors[connectionName](policies).filter((policy) => isReusablePolicyConnection(policy, connectionName, currentPolicyID));
}

const reusablePoliciesConnectedToSelector = (policies: OnyxCollection<Policy>, connectionName: ReusablePolicyConnectionName, currentPolicyID?: string) =>
    getReusablePoliciesConnectedTo(policies, connectionName, currentPolicyID);

const hasReusablePoliciesConnectedToSelector = (policies: OnyxCollection<Policy>, connectionName: ReusablePolicyConnectionName, currentPolicyID?: string) =>
    Object.values(policies ?? {}).some((policy) => isAdminPolicyConnectedTo(policy, connectionName) && isReusablePolicyConnection(policy, connectionName, currentPolicyID));

// Locales are loaded on demand. Instead of getting each workspace translation using `translate`, we hardcoded it here.
// en|es|fr|it|ja|nl|pl|pt-BR|zh-hans
// cspell:disable-next-line
const WORKSPACE_TRANSLATIONS = 'Workspace|Espacio de trabajo|Espace de travail|Spazio di lavoro|ワークスペース|Werkruimte|Przestrzeń robocza|Espaço de trabalho|工作区';

function lastWorkspaceNumberSelector(policies: OnyxCollection<Policy>, email: string): number | undefined {
    const emailParts = email.split('@');
    if (emailParts.length !== 2) {
        return undefined;
    }

    const displayNameForWorkspace = getDisplayNameForWorkspace(email);
    // find default named workspaces and increment the last number
    const escapedName = escapeRegExp(displayNameForWorkspace);

    const domain = emailParts.at(1) ?? '';
    const isSMSDomain = `@${domain}` === CONST.SMS.DOMAIN;
    const workspaceRegex = isSMSDomain ? new RegExp(`^${escapedName}\\s*(\\d+)?$`, 'i') : new RegExp(`^(?=.*${escapedName})(?:.*(?:${WORKSPACE_TRANSLATIONS})\\s*(\\d+)?)`, 'i');

    const workspaceNumbers = Object.values(policies ?? {})
        .map((policy) => workspaceRegex.exec(policy?.name ?? ''))
        .filter(Boolean) // Remove null matches
        .map((match) => Number(match?.[1] ?? '0'));
    const lastWorkspaceNumber = workspaceNumbers.length > 0 ? Math.max(...workspaceNumbers) : undefined;

    return lastWorkspaceNumber;
}

const policyNameSelector = (policy: OnyxEntry<Policy>) => policy?.name;

const policyTypeSelector = (policy: OnyxEntry<Policy>) => policy?.type;

const policyRoleSelector = (policy: OnyxEntry<Policy>) => policy?.role;

const areInvoicesEnabledSelector = (policy: OnyxEntry<Policy>) => policy?.areInvoicesEnabled;

const policyACHAccountNumberSelector = (policy: OnyxEntry<Policy>) => policy?.achAccount?.accountNumber;

function isAdminForPolicyByIDSelector(policyID?: string) {
    return (policies: OnyxCollection<Policy> | null): boolean => {
        if (!policyID) {
            return true;
        }
        const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
        return !!policy && policy.role === CONST.POLICY.ROLE.ADMIN;
    };
}

const createAdminPoliciesSelector =
    (currentPolicyID: string | undefined = undefined) =>
    (policies: OnyxCollection<Policy>) => {
        return Object.entries(policies ?? {}).reduce<Record<string, Pick<Policy, 'name' | 'id' | 'avatarURL' | 'created'>>>((acc, [key, policy]) => {
            if (!policy?.id || !policy?.name) {
                return acc;
            }
            const isCurrentPolicy = policy.id === currentPolicyID;
            if (!isCurrentPolicy && (policy.type === CONST.POLICY.TYPE.PERSONAL || policy.role !== CONST.POLICY.ROLE.ADMIN)) {
                return acc;
            }
            acc[key] = {
                id: policy.id,
                name: policy.name,
                avatarURL: policy.avatarURL,
                created: policy.created,
            };
            return acc;
        }, {});
    };

export type {PolicySelector, TimeSensitiveAdminPolicy};
export {
    createAllPolicyReportFieldsSelector,
    ownerPoliciesSelector,
    createOwnedPaidPoliciesCountsSelector,
    createCopySettingsEligibleTargetsSelector,
    createFilteredPoliciesInfoSelector,
    createWorkspaceListPoliciesSelector,
    activeAdminPoliciesSelector,
    hasActiveAdminPoliciesSelector,
    createHasAdminPolicyWithXeroConnectionSelector,
    createTimeSensitiveAdminPoliciesSelector,
    createHasWorkspaceToSubmitToSelector,
    createPoliciesForDomainCardsSelector,
    policyTimeTrackingSelector,
    createIOURequestStartPoliciesSelector,
    policyMapper,
    adminPoliciesConnectedToQBDSelector,
    reusablePoliciesConnectedToSelector,
    hasReusablePoliciesConnectedToSelector,
    lastWorkspaceNumberSelector,
    hasOnlyPersonalPoliciesSelector,
    homeAndOfficeCommuterExclusionPolicyNameSelector,
    policyNameSelector,
    policyRoleSelector,
    policyTypeSelector,
    areInvoicesEnabledSelector,
    policyACHAccountNumberSelector,
    createAdminPoliciesSelector,
    isAdminForPolicyByIDSelector,
};
export type {ReusablePolicyConnectionName};
