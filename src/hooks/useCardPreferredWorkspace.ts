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
function useCardPreferredWorkspace(card: Card | undefined): UseCardPreferredWorkspaceResult {}

export default useCardPreferredWorkspace;
export {CARD_PREFERRED_WORKSPACE_STATE};
export type {CardPreferredWorkspaceStateType, UseCardPreferredWorkspaceResult};
