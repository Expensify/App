import escapeRegExp from 'lodash/escapeRegExp';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {hasSynchronizationErrorMessage, isConnectionUnverified} from '@libs/actions/connections';
import {getDisplayNameForWorkspace} from '@libs/actions/Policy/Policy';
import {getActiveAdminWorkspaces, getActivePoliciesWithExpenseChat, getOwnedPaidPolicies, isPaidGroupPolicy, isPendingDeletePolicy, isPolicyAdmin, shouldShowPolicy} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyReportField} from '@src/types/onyx';
import type {PolicyDetailsForNonMembers} from '@src/types/onyx/Policy';

type ReusablePolicyConnectionName =
    | typeof CONST.POLICY.CONNECTIONS.NAME.NETSUITE
    | typeof CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT
    | typeof CONST.POLICY.CONNECTIONS.NAME.QBD
    | typeof CONST.POLICY.CONNECTIONS.NAME.CERTINIA;

const activePolicySelector = (policy: OnyxEntry<Policy>) => (policy?.type !== CONST.POLICY.TYPE.PERSONAL ? policy : undefined);

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

type CopySettingsEligibleTargets = {
    /** IDs of non-personal policies administered by the user that can be copy-settings targets */
    adminNonPersonal: string[];

    /** Subset of adminNonPersonal limited to corporate (Control) policies */
    corporateOnly: string[];
};

/**
 * Creates a selector returning only the policy IDs eligible as copy-settings targets,
 * so subscribers don't re-render when anything else on the policy collection changes.
 */
const createCopySettingsEligibleTargetsSelector =
    (currentUserLogin: string | undefined) =>
    (policies: OnyxCollection<Policy>): CopySettingsEligibleTargets => {
        const adminNonPersonal: string[] = [];
        const corporateOnly: string[] = [];
        for (const policy of Object.values(policies ?? {})) {
            if (!policy || policy.type === CONST.POLICY.TYPE.PERSONAL || !isPolicyAdmin(policy, currentUserLogin) || isPendingDeletePolicy(policy)) {
                continue;
            }
            adminNonPersonal.push(policy.id);
            if (policy.type === CONST.POLICY.TYPE.CORPORATE) {
                corporateOnly.push(policy.id);
            }
        }
        return {adminNonPersonal, corporateOnly};
    };

type WorkspaceListPolicy = Pick<Policy, 'id' | 'name' | 'type' | 'role' | 'ownerAccountID' | 'avatarURL' | 'pendingAction' | 'errors'> & {
    /** Whether the policy is optimistically pending deletion */
    isPendingDelete: boolean;

    /** Whether the current user has a pending request to join the policy */
    isJoinRequestPending: boolean;

    /** Projection of policyDetailsForNonMembers for join-request-pending policies */
    nonMemberDetails?: Pick<PolicyDetailsForNonMembers, 'name' | 'type' | 'ownerAccountID' | 'avatar'> & {policyID: string};
};

/**
 * Creates a selector returning a light, flat projection of the policies shown on the workspaces list,
 * so the page doesn't re-render when deep, frequently mutated policy fields change (isLoading* flags,
 * employeeList, customUnits, connections, etc.).
 */
const createWorkspaceListPoliciesSelector =
    (currentUserLogin: string | undefined) =>
    (policies: OnyxCollection<Policy>): WorkspaceListPolicy[] => {
        const result: WorkspaceListPolicy[] = [];
        for (const policy of Object.values(policies ?? {})) {
            if (!policy || !shouldShowPolicy(policy, true, currentUserLogin)) {
                continue;
            }

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
                        avatar: details.avatar,
                    };
                }
            }

            result.push({
                id: policy.id,
                name: policy.name,
                type: policy.type,
                role: policy.role,
                ownerAccountID: policy.ownerAccountID,
                avatarURL: policy.avatarURL,
                pendingAction: policy.pendingAction,
                errors: policy.errors,
                isPendingDelete: isPendingDeletePolicy(policy),
                isJoinRequestPending,
                nonMemberDetails,
            });
        }
        return result;
    };

const activeAdminPoliciesSelector = (policies: OnyxCollection<Policy>, currentUserAccountLogin: string) => getActiveAdminWorkspaces(policies, currentUserAccountLogin);

const hasActiveAdminPoliciesSelector = (policies: OnyxCollection<Policy>, currentUserAccountLogin: string) => !!activeAdminPoliciesSelector(policies, currentUserAccountLogin).length;

/**
 * Creates a selector returning only whether the user has any active workspace they can submit expenses to
 * (paid Collect/Control workspaces, plus free Submit (submit2026) workspaces when the beta is enabled),
 * so subscribers don't re-render when anything else on the policy collection changes.
 */
const createHasWorkspaceToSubmitToSelector =
    (currentUserLogin: string | undefined, isSubmit2026BetaEnabled = false) =>
    (policies: OnyxCollection<Policy>): boolean =>
        getActivePoliciesWithExpenseChat(policies, currentUserLogin, isSubmit2026BetaEnabled).length > 0;

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
    const policyIDs = new Set(
        domainNames
            .map((domainName) => domainName.match(CONST.REGEX.EXPENSIFY_POLICY_DOMAIN_NAME)?.[1])
            .filter((policyID): policyID is string => !!policyID)
            .map((policyID) => policyID.toUpperCase()),
    );

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

const hasMultipleOutputCurrenciesSelector = (policies: OnyxCollection<Policy>) => {
    const currencies = new Set<string>();

    for (const policy of Object.values(policies ?? {})) {
        if (!policy || !isPaidGroupPolicy(policy)) {
            continue;
        }

        currencies.add(policy.outputCurrency);
        if (currencies.size > 1) {
            return true;
        }
    }

    return false;
};

type PolicySelector = Pick<Policy, 'type' | 'role' | 'isPolicyExpenseChatEnabled' | 'pendingAction' | 'avatarURL' | 'name' | 'id' | 'areInvoicesEnabled'>;

const policyMapper = (policy: OnyxEntry<Policy>): PolicySelector =>
    (policy && {
        type: policy.type,
        role: policy.role,
        id: policy.id,
        isPolicyExpenseChatEnabled: policy.isPolicyExpenseChatEnabled,
        pendingAction: policy.pendingAction,
        avatarURL: policy.avatarURL,
        name: policy.name,
        areInvoicesEnabled: policy.areInvoicesEnabled,
    }) as PolicySelector;

// deepEqual on ~15 fields is cheaper than re-rendering IOURequestStartPage's full hook/memo tree.
const iouRequestPolicyCollectionSelector = (policies: OnyxCollection<Policy>): OnyxCollection<Policy> => {
    if (!policies) {
        return {};
    }

    const result: Record<string, Policy> = {};

    for (const [id, policyItem] of Object.entries(policies)) {
        if (!policyItem) {
            continue;
        }

        result[id] = {
            id: policyItem.id,
            type: policyItem.type,
            name: policyItem.name,
            pendingAction: policyItem.pendingAction,
            isPolicyExpenseChatEnabled: policyItem.isPolicyExpenseChatEnabled,
            role: policyItem.role,
            chatReportIDAdmins: policyItem.chatReportIDAdmins,
            employeeList: policyItem.employeeList,
            arePerDiemRatesEnabled: policyItem.arePerDiemRatesEnabled,
            customUnits: policyItem.customUnits,
            units: policyItem.units,
            isJoinRequestPending: policyItem.isJoinRequestPending,
            errors: policyItem.errors,
            owner: policyItem.owner,
            areInvoicesEnabled: policyItem.areInvoicesEnabled,
        } as Policy;
    }

    return result;
};

const hasOnlyPersonalPoliciesSelector = (policies: OnyxCollection<Policy>): boolean => {
    return !Object.values(policies ?? {}).some((policy) => policy && policy.type !== CONST.POLICY.TYPE.PERSONAL && policy.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
};

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

const reusableConnectionAdminSelectors: Record<ReusablePolicyConnectionName, (policies: OnyxCollection<Policy>) => Policy[]> = {
    [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: adminPoliciesConnectedToNetSuiteSelector,
    [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: adminPoliciesConnectedToSageIntacctSelector,
    [CONST.POLICY.CONNECTIONS.NAME.QBD]: adminPoliciesConnectedToQBDSelector,
    [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: adminPoliciesConnectedToCertiniaSelector,
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

const hasPoliciesConnectedToQBDSelector = (policies: OnyxCollection<Policy>) => !!adminPoliciesConnectedToQBDSelector(policies).length;

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

const areInvoicesEnabledSelector = (policy: OnyxEntry<Policy>) => policy?.areInvoicesEnabled;

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
            acc[key] = {id: policy.id, name: policy.name, avatarURL: policy.avatarURL, created: policy.created};
            return acc;
        }, {});
    };

export type {PolicySelector};
export {
    activePolicySelector,
    createAllPolicyReportFieldsSelector,
    ownerPoliciesSelector,
    createOwnedPaidPoliciesCountsSelector,
    createCopySettingsEligibleTargetsSelector,
    createWorkspaceListPoliciesSelector,
    activeAdminPoliciesSelector,
    hasActiveAdminPoliciesSelector,
    createHasWorkspaceToSubmitToSelector,
    createPoliciesForDomainCardsSelector,
    policyTimeTrackingSelector,
    hasMultipleOutputCurrenciesSelector,
    iouRequestPolicyCollectionSelector,
    policyMapper,
    adminPoliciesConnectedToQBDSelector,
    reusablePoliciesConnectedToSelector,
    hasPoliciesConnectedToQBDSelector,
    hasReusablePoliciesConnectedToSelector,
    lastWorkspaceNumberSelector,
    hasOnlyPersonalPoliciesSelector,
    policyNameSelector,
    policyTypeSelector,
    areInvoicesEnabledSelector,
    createAdminPoliciesSelector,
    isAdminForPolicyByIDSelector,
};
export type {ReusablePolicyConnectionName, CopySettingsEligibleTargets};
