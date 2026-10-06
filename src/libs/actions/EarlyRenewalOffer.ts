import {write} from '@libs/API';
import type {AcceptEarlyRenewalOfferParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/** Auth resets the eligibility on success, which removes the offer from Home and Subscription. */
function acceptEarlyRenewalOffer(offerID: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.EARLY_RENEWAL_OFFER_ELIGIBILITY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.EARLY_RENEWAL_OFFER_ELIGIBILITY,
            value: {
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                errors: null,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.EARLY_RENEWAL_OFFER_ELIGIBILITY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.EARLY_RENEWAL_OFFER_ELIGIBILITY,
            value: {pendingAction: null},
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.EARLY_RENEWAL_OFFER_ELIGIBILITY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.EARLY_RENEWAL_OFFER_ELIGIBILITY,
            value: {
                pendingAction: null,
                errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
            },
        },
    ];

    const parameters: AcceptEarlyRenewalOfferParams = {offerID};
    write(WRITE_COMMANDS.ACCEPT_EARLY_RENEWAL_OFFER, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

function clearEarlyRenewalOfferErrors() {
    Onyx.merge(ONYXKEYS.EARLY_RENEWAL_OFFER_ELIGIBILITY, {errors: null});
}

export {acceptEarlyRenewalOffer, clearEarlyRenewalOfferErrors};
