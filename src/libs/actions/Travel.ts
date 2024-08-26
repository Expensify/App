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
                isLoading: true,
            },
        },
    ];

    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.NVP_TRAVEL_SETTINGS,
            value: {
                isLoading: false,
            },
        },
    ];

    const error = new Error('Failed to generate spotnana token.');

    return new Promise((resolve, reject) => {
        asyncOpenURL(
            // eslint-disable-next-line rulesdir/no-api-side-effects-method
            API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.ACCEPT_SPOTNANA_TERMS, null, {optimisticData, finallyData})
                .then((response) => {
                    if (!response?.spotnanaToken) {
                        reject(error);
                        throw error;
                    }
                    return buildTravelDotURL(response.spotnanaToken);
                })
                .catch(() => {
                    reject(error);
                    throw error;
                }),
            (travelDotURL) => {
                resolve(travelDotURL);
                return travelDotURL ?? '';
            },
        );
    });
}

// eslint-disable-next-line import/prefer-default-export
export {acceptSpotnanaTerms};
