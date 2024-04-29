import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {ConnectPolicyToQuickbooksOnlineParams, SyncPolicyToQuickbooksOnlineParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function getQuickBooksOnlineSetupLink(policyID: string) {
    const params: ConnectPolicyToQuickbooksOnlineParams = {policyID};
    const commandURL = getCommandURL({command: READ_COMMANDS.CONNECT_POLICY_TO_QUICKBOOKS_ONLINE, shouldSkipWebProxy: true});
    return commandURL + new URLSearchParams(params).toString();
}

function syncConnection(policyID: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: {
                stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.STARTING_IMPORT,
                connectionName: CONST.POLICY.CONNECTIONS.NAME.QBO,
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: null,
        },
    ];
    const parameters: SyncPolicyToQuickbooksOnlineParams = {
        policyID,
        idempotencyKey: policyID,
    };
    API.read(READ_COMMANDS.SYNC_POLICY_TO_QUICKBOOKS_ONLINE, parameters, {optimisticData, failureData});
}

export {getQuickBooksOnlineSetupLink, syncConnection};
