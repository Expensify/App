import type {ConnectPolicyToAccountingIntegrationParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';

const getXeroSetupLink = (policyID: string) => {
    const params: ConnectPolicyToAccountingIntegrationParams = {policyID};
    const commandURL = getCommandURL({command: READ_COMMANDS.CONNECT_POLICY_TO_XERO, shouldSkipWebProxy: true});
    return commandURL + new URLSearchParams(params).toString();
};

export default getXeroSetupLink;
