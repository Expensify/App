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
import {canMemberWrite} from './permissions';
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

/** Whether a member has travel turned on for a workspace, meaning they can book trips with it. */
function canMemberUseTravel(policy: OnyxEntry<Policy>, login: string | undefined): boolean {
    return !!login && policy?.employeeList?.[login]?.canUseTravel === true;
}

/**
 * Whether an admin turned travel off for a member of a workspace. A member whose access isn't known yet isn't blocked
 * here, since the server decides when they try to book.
 */
function isMemberTravelAccessTurnedOff(policy: OnyxEntry<Policy>, login: string | undefined): boolean {
    return !!login && policy?.employeeList?.[login]?.canUseTravel === false;
}

/**
 * Whether a member can turn travel on or off for another member. Workspace admins and travel admins can, but only full
 * workspace admins can change it for the workspace owner and other workspace admins, matching Auth.
 */
function canMemberChangeTravelAccess(policy: OnyxEntry<Policy>, login: string, targetLogin: string): boolean {
    if (!canMemberWrite(policy, login, CONST.POLICY.POLICY_FEATURE.TRAVEL)) {
        return false;
    }
    if (canMemberWrite(policy, login, CONST.POLICY.POLICY_FEATURE.ASSIGN_ELEVATED_ROLES)) {
        return true;
    }
    return policy?.owner !== targetLogin && policy?.employeeList?.[targetLogin]?.role !== CONST.POLICY.ROLE.ADMIN;
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

export {isWorkspaceProvisionedForTravel, hasAcceptedTravelTerms, canMemberUseTravel, isMemberTravelAccessTurnedOff, canMemberChangeTravelAccess, isNonUSDPolicy, getTravelStep};
