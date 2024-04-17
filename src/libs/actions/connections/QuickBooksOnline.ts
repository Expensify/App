import type {ConnectPolicyToQuickbooksOnlineParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';

function getQuickBooksOnlineSetupLink(policyID: string) {
    const params: ConnectPolicyToQuickbooksOnlineParams = {policyID};
    const commandURL = getCommandURL({command: READ_COMMANDS.CONNECT_POLICY_TO_QUICKBOOKS_ONLINE, shouldSkipWebProxy: true});
    return commandURL + new URLSearchParams(params).toString();
}

// More action functions will be added later
// eslint-disable-next-line import/prefer-default-export
export {getQuickBooksOnlineSetupLink};
