import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {ConnectPolicyToRilletParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function connectToRillet(policyID: string, apiKey: string) {
    const parameters: ConnectPolicyToRilletParams = {
        policyID,
        apiKey,
    };
    API.write(WRITE_COMMANDS.CONNECT_POLICY_TO_RILLET, parameters, {});
}

function clearRilletErrorField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        connections: {[CONST.POLICY.CONNECTIONS.NAME.RILLET]: {config: {errorFields: {[fieldName]: null}}}},
    });
}

export {connectToRillet, clearRilletErrorField};
