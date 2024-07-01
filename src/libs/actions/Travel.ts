import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import asyncOpenURL from '@libs/asyncOpenURL';
import ONYXKEYS from '@src/ONYXKEYS';
import {buildTravelDotURL} from './Link';

/**
 * Accept Spotnana terms and conditions to receive a proper token used for authenticating further actions
 */
function acceptSpotnanaTerms() {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.NVP_TRAVEL_SETTINGS,
            value: {
                hasAcceptedTerms: true,
            },
        },
    ];

    asyncOpenURL(
        // eslint-disable-next-line rulesdir/no-api-side-effects-method
        API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.ACCEPT_SPOTNANA_TERMS, null, {optimisticData})
            .then((response) => (response?.spotnanaToken ? buildTravelDotURL(response.spotnanaToken) : buildTravelDotURL()))
            .catch(() => buildTravelDotURL()),
        (travelDotURL) => travelDotURL,
    );
}

// eslint-disable-next-line import/prefer-default-export
export {acceptSpotnanaTerms};
