import {getCommandURL} from '@libs/ApiUtils';

function getQuickBooksOnlineSetupLink(policyID: string) {
    const otherParams = new URLSearchParams({policyID}).toString();
    return `${getCommandURL({command: 'ConnectPolicyToQuickbooksOnline'})}&${otherParams}`;
}

// More action functions will be added later
// eslint-disable-next-line import/prefer-default-export
export {getQuickBooksOnlineSetupLink};
