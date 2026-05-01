import type {ConnectPolicyToGustoParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';

function getGustoSetupLink(policyID: string) {
    const params: ConnectPolicyToGustoParams = {policyID};
    const commandURL = getCommandURL({
        command: READ_COMMANDS.CONNECT_POLICY_TO_GUSTO,
        shouldSkipWebProxy: true,
    });
    return commandURL + new URLSearchParams(params).toString();
}

export default getGustoSetupLink;
