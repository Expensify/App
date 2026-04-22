import escapeRegExp from 'lodash/escapeRegExp';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {hasSynchronizationErrorMessage, isConnectionUnverified} from '@libs/actions/connections';
import {getDisplayNameForWorkspace} from '@libs/actions/Policy/Policy';
import {areAllGroupPoliciesExpenseChatDisabled, getActiveAdminWorkspaces, getOwnedPaidPolicies, isPaidGroupPolicy, shouldShowPolicy} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import type {Policy, PolicyReportField} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const activePolicySelector = (policy: OnyxEntry<Policy>) => (policy?.type !== CONST.POLICY.TYPE.PERSONAL ? policy : undefined);

const ownerPoliciesSelector = (policies: OnyxCollection<Policy>, currentUserAccountID: number) => getOwnedPaidPolicies(policies, currentUserAccountID);

const activeAdminPoliciesSelector = (policies: OnyxCollection<Policy>, currentUserAccountLogin: string) => getActiveAdminWorkspaces(policies, currentUserAccountLogin);

const hasActiveAdminPoliciesSelector = (policies: OnyxCollection<Policy>, currentUserAccountLogin: string) => !!activeAdminPoliciesSelector(policies, currentUserAccountLogin).length;

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

const groupPaidPoliciesWithExpenseChatEnabledSelector = (policies: OnyxCollection<Policy>, currentUserLogin: string | undefined) => {
    if (isEmptyObject(policies)) {
        return CONST.EMPTY_ARRAY;
    }
    return Object.values(policies ?? {}).filter(
        (policy): policy is Policy => !!policy?.isPolicyExpenseChatEnabled && !policy?.isJoinRequestPending && isPaidGroupPolicy(policy) && shouldShowPolicy(policy, false, currentUserLogin),
    );
};

const shouldRedirectToExpensifyClassicSelector = (policies: OnyxCollection<Policy>) => areAllGroupPoliciesExpenseChatDisabled(policies);

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

const adminPoliciesConnectedToSageIntacctSelector = (policies: OnyxCollection<Policy>) =>
    Object.values(policies ?? {}).filter<Policy>((policy): policy is Policy => !!policy && policy.role === CONST.POLICY.ROLE.ADMIN && !!policy?.connections?.intacct);

const adminPoliciesConnectedToNetSuiteSelector = (policies: OnyxCollection<Policy>) =>
    Object.values(policies ?? {}).filter<Policy>((policy): policy is Policy => !!policy && policy.role === CONST.POLICY.ROLE.ADMIN && !!policy?.connections?.netsuite);

const adminPoliciesConnectedToQBDSelector = (policies: OnyxCollection<Policy>) =>
    Object.values(policies ?? {}).filter<Policy>((policy): policy is Policy => !!policy && policy.role === CONST.POLICY.ROLE.ADMIN && !!policy?.connections?.quickbooksDesktop);

function getReusablePoliciesConnectedToQBD(policies: OnyxCollection<Policy>, currentPolicyID?: string) {
    return adminPoliciesConnectedToQBDSelector(policies).filter((policy) => {
        if (policy.id === currentPolicyID) {
            return false;
        }

        return !isConnectionUnverified(policy, CONST.POLICY.CONNECTIONS.NAME.QBD) && !hasSynchronizationErrorMessage(policy, CONST.POLICY.CONNECTIONS.NAME.QBD, false);
    });
}

const reusablePoliciesConnectedToQBDSelector = (policies: OnyxCollection<Policy>, currentPolicyID?: string) => getReusablePoliciesConnectedToQBD(policies, currentPolicyID);

const hasPoliciesConnectedToSageIntacctSelector = (policies: OnyxCollection<Policy>) => !!adminPoliciesConnectedToSageIntacctSelector(policies).length;

const hasPoliciesConnectedToNetSuiteSelector = (policies: OnyxCollection<Policy>) => !!adminPoliciesConnectedToNetSuiteSelector(policies).length;

const hasPoliciesConnectedToQBDSelector = (policies: OnyxCollection<Policy>) => !!adminPoliciesConnectedToQBDSelector(policies).length;

const hasReusablePoliciesConnectedToQBDSelector = (policies: OnyxCollection<Policy>, currentPolicyID?: string) => !!getReusablePoliciesConnectedToQBD(policies, currentPolicyID).length;

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

export {
    activePolicySelector,
    createAllPolicyReportFieldsSelector,
    ownerPoliciesSelector,
    activeAdminPoliciesSelector,
    hasActiveAdminPoliciesSelector,
    createPoliciesForDomainCardsSelector,
    policyTimeTrackingSelector,
    hasMultipleOutputCurrenciesSelector,
    groupPaidPoliciesWithExpenseChatEnabledSelector,
    iouRequestPolicyCollectionSelector,
    shouldRedirectToExpensifyClassicSelector,
    adminPoliciesConnectedToSageIntacctSelector,
    adminPoliciesConnectedToNetSuiteSelector,
    adminPoliciesConnectedToQBDSelector,
    reusablePoliciesConnectedToQBDSelector,
    hasPoliciesConnectedToSageIntacctSelector,
    hasPoliciesConnectedToNetSuiteSelector,
    hasPoliciesConnectedToQBDSelector,
    hasReusablePoliciesConnectedToQBDSelector,
    lastWorkspaceNumberSelector,
    hasOnlyPersonalPoliciesSelector,
};
