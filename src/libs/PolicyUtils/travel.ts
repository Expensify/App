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

export {isWorkspaceProvisionedForTravel, hasAcceptedTravelTerms, isNonUSDPolicy, getTravelStep};
