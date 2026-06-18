import * as API from '@libs/API';
import type {ConnectPolicyToRilletParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';

function connectToRillet(policyID: string, apiKey: string) {
    const parameters: ConnectPolicyToRilletParams = {
        policyID,
        apiKey,
    };
    API.write(WRITE_COMMANDS.CONNECT_POLICY_TO_RILLET, parameters, {});
}

export {connectToRillet};
