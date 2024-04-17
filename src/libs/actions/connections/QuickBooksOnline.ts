import {getCommandURL} from '@libs/ApiUtils';

function getQuickBooksOnlineSetupLink(policyID: string) {
    const params = new URLSearchParams({policyID});
    const commandURL = getCommandURL({command: 'ConnectPolicyToQuickbooksOnline', shouldSkipWebProxy: true});
    return commandURL + params.toString();
}

// More action functions will be added later
// eslint-disable-next-line import/prefer-default-export
export {getQuickBooksOnlineSetupLink};
