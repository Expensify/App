/**
 * Actions for the third party accounts a user connects, such as Gmail for receipt sync.
 */
import {write} from '@libs/API';
import type {DisconnectGmailParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/** The row stays until the server confirms, because the server also revokes the token with Google */
function disconnectGmail(connectionID: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_OAUTH_CONNECTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_OAUTH_CONNECTIONS,
            value: {
                [connectionID]: {
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    errors: null,
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_OAUTH_CONNECTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_OAUTH_CONNECTIONS,
            value: {[connectionID]: null},
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_OAUTH_CONNECTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_OAUTH_CONNECTIONS,
            value: {
                [connectionID]: {
                    pendingAction: null,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];

    const parameters: DisconnectGmailParams = {connectionID};
    write(WRITE_COMMANDS.DISCONNECT_GMAIL, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

function clearOAuthConnectionErrors(connectionID: string) {
    Onyx.merge(ONYXKEYS.NVP_PRIVATE_OAUTH_CONNECTIONS, {
        [connectionID]: {errors: null},
    });
}

export {disconnectGmail, clearOAuthConnectionErrors};
