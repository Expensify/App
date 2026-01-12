import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {AcceptSpotnanaTermsParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';

/**
 * Accept Spotnana terms and conditions to receive a proper token used for authenticating further actions
 */
function acceptSpotnanaTerms(domain?: string, policyID?: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_TRAVEL_SETTINGS | typeof ONYXKEYS.TRAVEL_PROVISIONING>> = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.NVP_TRAVEL_SETTINGS,
            value: {
                hasAcceptedTerms: true,
            },
        },
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.TRAVEL_PROVISIONING,
            value: {
                isLoading: true,
                errors: null,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.TRAVEL_PROVISIONING | typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.TRAVEL_PROVISIONING,
            value: {
                isLoading: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                travelSettings: {
                    hasAcceptedTerms: true,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.TRAVEL_PROVISIONING>> = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.TRAVEL_PROVISIONING,
            value: {
                isLoading: false,
                errors: getMicroSecondOnyxErrorWithTranslationKey('travel.errorMessage'),
            },
        },
    ];

    const params: AcceptSpotnanaTermsParams = {domain, policyID};

    // We need to call this API immediately to get the response and open the travel page.
    // See https://github.com/Expensify/App/pull/69769#discussion_r2368967354 for more info.
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.ACCEPT_SPOTNANA_TERMS, params, {optimisticData, successData, failureData});
}

function requestTravelAccess() {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_TRAVEL_SETTINGS>> = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.NVP_TRAVEL_SETTINGS,
            value: {
                // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                lastTravelSignupRequestTime: Date.now(),
            },
        },
    ];
    API.write(WRITE_COMMANDS.TRAVEL_SIGNUP_REQUEST, null, {optimisticData});
}

function setTravelProvisioningNextStep(nextStepRoute?: Route) {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, {nextStepRoute});
}

function cleanupTravelProvisioningSession() {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, null);
}

export {acceptSpotnanaTerms, cleanupTravelProvisioningSession, requestTravelAccess, setTravelProvisioningNextStep};
