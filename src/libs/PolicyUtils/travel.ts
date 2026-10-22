/**
 * Travel provisioning, accepted terms, and which travel step to show.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import CONST from '@src/CONST';
import type {Policy, TravelSettings} from '@src/types/onyx';
import type {WorkspaceTravelSettings} from '@src/types/onyx/TravelSettings';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {getAdminsPrivateEmailDomains} from './domains';
import {getActivePolicies} from './policy';
import {isPaidGroupPolicy} from './policyType';

type TravelStep = ValueOf<typeof CONST.TRAVEL.STEPS>;

/** Whether a workspace has been provisioned with a Spotnana entity. */
function isWorkspaceProvisionedForTravel(travelSettings?: WorkspaceTravelSettings): boolean {
    return !!(travelSettings?.spotnanaCompanyID ?? travelSettings?.associatedTravelDomainAccountID);
}

/** Whether travel is enabled on a workspace, meaning it can be used to book a trip. */
function hasAcceptedTravelTerms(policy: OnyxEntry<Policy>, accountTravelSettings: TravelSettings | undefined): boolean {
    return !!(policy?.travelSettings?.hasAcceptedTerms ?? (accountTravelSettings?.hasAcceptedTerms && isWorkspaceProvisionedForTravel(policy?.travelSettings)));
}

/**
 * Whether a member can book travel on a workspace. Workspaces provisioned before travel access was managed per member
 * let every member book, so a member only needs to be turned on once the workspace limits travel to enabled members.
 */
function canMemberUseTravel(policy: OnyxEntry<Policy>, login: string | undefined): boolean {
    if (!policy?.travelSettings?.restrictToEnabledMembers) {
        return true;
    }
    return !!login && policy.employeeList?.[login]?.canUseTravel === true;
}

/**
 * A member's role in Expensify Travel. Members without one of their own follow their workspace role, so workspace admins
 * are travel admins and everyone else is a traveler.
 */
function getTravelMemberRole(policy: OnyxEntry<Policy>, login: string | undefined): ValueOf<typeof CONST.TRAVEL.MEMBER_ROLE> {
    const employee = login ? policy?.employeeList?.[login] : undefined;
    if (employee?.travelRole) {
        return employee.travelRole;
    }
    return employee?.role === CONST.POLICY.ROLE.ADMIN ? CONST.TRAVEL.MEMBER_ROLE.ADMIN : CONST.TRAVEL.MEMBER_ROLE.TRAVELER;
}

function isNonUSDPolicy(policy: OnyxEntry<Policy>): boolean {
    return !!policy?.outputCurrency && policy.outputCurrency !== CONST.CURRENCY.USD;
}

/**
 * Determines which travel step should be shown based on policy state
 */
function getTravelStep(
    policy: OnyxEntry<Policy>,
    travelSettings: TravelSettings | undefined,
    isTravelVerifiedBetaEnabled: boolean,
    policies: OnyxCollection<Policy>,
    currentUserLogin: string | undefined,
): TravelStep {
    const adminDomains = getAdminsPrivateEmailDomains(policy);
    const activePolicies = getActivePolicies(policies, currentUserLogin);
    const groupPaidPolicies = activePolicies.filter(isPaidGroupPolicy);

    if (adminDomains.length === 0 || groupPaidPolicies.length < 1 || !isPaidGroupPolicy(policy)) {
        return CONST.TRAVEL.STEPS.GET_STARTED_TRAVEL;
    }
    if (policy?.travelSettings?.hasAcceptedTerms) {
        return CONST.TRAVEL.STEPS.BOOK_OR_MANAGE_YOUR_TRIP;
    }
    if (!isTravelVerifiedBetaEnabled && travelSettings?.lastTravelSignupRequestTime) {
        return CONST.TRAVEL.STEPS.REVIEWING_REQUEST;
    }
    return CONST.TRAVEL.STEPS.GET_STARTED_TRAVEL;
}

export {isWorkspaceProvisionedForTravel, hasAcceptedTravelTerms, canMemberUseTravel, getTravelMemberRole, isNonUSDPolicy, getTravelStep};
