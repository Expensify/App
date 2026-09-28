import {makeRequestWithSideEffects} from '@libs/API';
import type {AcceptEarlyRenewalOfferParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

function acceptEarlyRenewalOffer(offerID: string) {
    const parameters: AcceptEarlyRenewalOfferParams = {offerID};
    return makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.ACCEPT_EARLY_RENEWAL_OFFER, parameters);
}

export default acceptEarlyRenewalOffer;
