import {getCommandURL} from '@libs/ApiUtils';

function getQuickBooksOnlineSetupLink(policyID: string) {
    const params = new URLSearchParams({policyID});
    const commandURL = getCommandURL({command: 'ConnectPolicyToQuickbooksOnline', shouldSkipWebProxy: true});
    return commandURL + params.toString();
}

export default getQuickBooksOnlineSetupLink;
