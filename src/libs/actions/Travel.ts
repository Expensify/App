import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Accept Spotnana terms and conditions to receive a proper token used for authenticating further actions
 */
function acceptSpotnanaTerms() {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.ACCOUNT,
            value: {
                travelSettings: {
                    hasAcceptedTerms: true,
                },
            },
        },
    ];

    API.write(WRITE_COMMANDS.ACCEPT_SPOTNANA_TERMS, {}, {optimisticData});
}

// eslint-disable-next-line import/prefer-default-export
export {acceptSpotnanaTerms};
