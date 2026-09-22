import {makeRequestWithSideEffects} from '@libs/API';
import type {AcceptEarlyRenewalOfferParams, NudgeBillingOwnerEarlyRenewalParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

function acceptEarlyRenewalOffer(offerID: string) {
    const parameters: AcceptEarlyRenewalOfferParams = {offerID};
    return makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.ACCEPT_EARLY_RENEWAL_OFFER, parameters);
}

function nudgeBillingOwnerEarlyRenewal(offerID: string, policyID: string) {
    const parameters: NudgeBillingOwnerEarlyRenewalParams = {offerID, policyID};
    return makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.NUDGE_BILLING_OWNER_EARLY_RENEWAL, parameters);
}

export {acceptEarlyRenewalOffer, nudgeBillingOwnerEarlyRenewal};
