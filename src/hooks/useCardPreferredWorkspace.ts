import {usePersonalDetails} from '@components/OnyxListItemProvider';

import {isEligibleForCardPreferredWorkspace, shouldShowPolicy} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Card} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import useEnvironment from './useEnvironment';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

const CARD_PREFERRED_WORKSPACE_STATE = {
    DOMAIN_GROUP_LOCK: 'domainGroupLock',
    NONE: 'none',
    CUSTOM: 'custom',
    EMPLOYEE_DEFAULT: 'employeeDefaultPolicy',
    EMPLOYEE_DEFAULT_ONLY_OPTION: 'employeeDefaultOnlyOption',
    SUBMISSIONS_DISABLED: 'submissionsDisabled',
    SUBMISSIONS_DISABLED_LOCKED: 'submissionsDisabledLocked',
    EMPLOYEE_DEFAULT_UNKNOWN: 'employeeDefaultUnknown',
} as const;

type CardPreferredWorkspaceStateType = ValueOf<typeof CARD_PREFERRED_WORKSPACE_STATE>;

type UseCardPreferredWorkspaceResult = {
    /** Which row of the state table matched */
    state: CardPreferredWorkspaceStateType;

    /** Row title, already localized */
    title: string;

    /** Help text explaining if other workspace settings impact this setting (e.g., auto reporting, domain group...) */
    helperText: string | undefined;

    /** Whether interactive */
    isInteractive: boolean;

    /** Card-level settings: undefined | '' | '0' | policyID */
    cardPreferredPolicyID: string | undefined;

    /** Employee default chain */
    employeeDefaultPolicyID: string | undefined;
    employeeDefaultPolicyName: string | undefined;

    /** The cardholder's login */
    cardholderEmail: string | undefined;
};

/**
 * Resolves the card-level "Preferred workspace" settings and the eligible-workspace list the picker offers.
 *
 * Cards without a custom preferred policy pin are marked as "Employee default" and follow this resolution chain:
 * Domain group > Card-level > Card feed > Individual default workspace.
 */
function useCardPreferredWorkspace(card: Card | undefined): UseCardPreferredWorkspaceResult {
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const personalDetails = usePersonalDetails();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const cardholderEmail = personalDetails?.[card?.accountID ?? CONST.DEFAULT_NUMBER_ID]?.login;
    const cardPreferredPolicyID = card?.nameValuePairs?.preferredPolicy ?? undefined;

    const employeeDefaultPolicy = card?.nameValuePairs?.employeeDefault ?? undefined;
    const employeeDefaultPolicyID = employeeDefaultPolicy?.policyID ? employeeDefaultPolicy.policyID : undefined;
    const employeeDefaultPolicyName = employeeDefaultPolicy?.name ? employeeDefaultPolicy.name : undefined;

    const eligiblePolicyIDs = Object.values(policies ?? {})
        .filter((policy) => !policy?.isJoinRequestPending && shouldShowPolicy(policy, false, session?.email) && isEligibleForCardPreferredWorkspace(policy, cardholderEmail))
        .map((policy) => policy?.id)
        .filter((id): id is string => !!id);

    const workspaceWorkflowsLink = (targetPolicyID: string) => `${environmentURL}/${ROUTES.WORKSPACE_WORKFLOWS.getRoute(targetPolicyID, CONST.TAB.WORKFLOWS.SUBMISSIONS)}`;

    if (employeeDefaultPolicy?.isEnforcedByDomainGroup) {
        return {
            state: CARD_PREFERRED_WORKSPACE_STATE.DOMAIN_GROUP_LOCK,
            title: employeeDefaultPolicyName ?? translate('workspace.card.preferredWorkspace.unknownWorkspace'),
            helperText: translate('workspace.card.preferredWorkspace.domainGroupEnforced', CONST.CARD_PREFERRED_WORKSPACE_HELP_URL),
            isInteractive: false,
            cardPreferredPolicyID,
            employeeDefaultPolicyID,
            employeeDefaultPolicyName,
            cardholderEmail,
        };
    }

    if (cardPreferredPolicyID === CONST.CARD_PREFERRED_POLICY.NONE) {
        return {
            state: CARD_PREFERRED_WORKSPACE_STATE.NONE,
            title: translate('workspace.card.preferredWorkspace.none'),
            helperText: undefined,
            isInteractive: true,
            cardPreferredPolicyID,
            employeeDefaultPolicyID,
            employeeDefaultPolicyName,
            cardholderEmail,
        };
    }

    // A pinned workspace that's no longer eligible falls through to the employee-default chain.
    if (cardPreferredPolicyID && eligiblePolicyIDs.includes(cardPreferredPolicyID)) {
        return {
            state: CARD_PREFERRED_WORKSPACE_STATE.CUSTOM,
            title: policies?.[`${ONYXKEYS.COLLECTION.POLICY}${cardPreferredPolicyID}`]?.name ?? '',
            helperText: undefined,
            isInteractive: true,
            cardPreferredPolicyID,
            employeeDefaultPolicyID,
            employeeDefaultPolicyName,
            cardholderEmail,
        };
    }

    if (employeeDefaultPolicyID) {
        if (employeeDefaultPolicy?.autoReporting === true) {
            return {
                state: eligiblePolicyIDs.length > 1 ? CARD_PREFERRED_WORKSPACE_STATE.EMPLOYEE_DEFAULT : CARD_PREFERRED_WORKSPACE_STATE.EMPLOYEE_DEFAULT_ONLY_OPTION,
                title: translate('workspace.card.preferredWorkspace.employeeDefault', employeeDefaultPolicyName ?? ''),
                helperText: undefined,
                isInteractive: eligiblePolicyIDs.length > 1,
                cardPreferredPolicyID,
                employeeDefaultPolicyID,
                employeeDefaultPolicyName,
                cardholderEmail,
            };
        }

        if (eligiblePolicyIDs.length > 0) {
            return {
                state: CARD_PREFERRED_WORKSPACE_STATE.SUBMISSIONS_DISABLED,
                title: translate('workspace.card.preferredWorkspace.noneEmployeeDefault'),
                helperText: translate('workspace.card.preferredWorkspace.submissionsDisabled', workspaceWorkflowsLink(employeeDefaultPolicyID)),
                isInteractive: true,
                cardPreferredPolicyID,
                employeeDefaultPolicyID,
                employeeDefaultPolicyName,
                cardholderEmail,
            };
        }

        return {
            state: CARD_PREFERRED_WORKSPACE_STATE.SUBMISSIONS_DISABLED_LOCKED,
            title: translate('workspace.card.preferredWorkspace.none'),
            helperText: translate('workspace.card.preferredWorkspace.submissionsDisabled', workspaceWorkflowsLink(employeeDefaultPolicyID)),
            isInteractive: false,
            cardPreferredPolicyID,
            employeeDefaultPolicyID,
            employeeDefaultPolicyName,
            cardholderEmail,
        };
    }

    // Fall back to a bare "Employee default".
    return {
        state: CARD_PREFERRED_WORKSPACE_STATE.EMPLOYEE_DEFAULT_UNKNOWN,
        title: eligiblePolicyIDs.length > 0 ? translate('workspace.card.preferredWorkspace.employeeDefaultUnknown') : translate('workspace.card.preferredWorkspace.none'),
        helperText: undefined,
        isInteractive: eligiblePolicyIDs.length > 0,
        cardPreferredPolicyID,
        employeeDefaultPolicyID,
        employeeDefaultPolicyName,
        cardholderEmail,
    };
}

export default useCardPreferredWorkspace;
export {CARD_PREFERRED_WORKSPACE_STATE};
export type {CardPreferredWorkspaceStateType, UseCardPreferredWorkspaceResult};
