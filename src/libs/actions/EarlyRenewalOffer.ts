import {makeRequestWithSideEffects} from '@libs/API';
import type {AcceptEarlyRenewalOfferParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

import {saveReportDraftComment} from './Report';

function acceptEarlyRenewalOffer(offerID: string) {
    const parameters: AcceptEarlyRenewalOfferParams = {offerID};
    return makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.ACCEPT_EARLY_RENEWAL_OFFER, parameters);
}

function draftEarlyRenewalMessage(reportID: string, message: string, openAdminsRoom: () => void) {
    saveReportDraftComment(reportID, message, openAdminsRoom);
}

export {acceptEarlyRenewalOffer, draftEarlyRenewalMessage};
