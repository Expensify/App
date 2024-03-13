import { getCommandURL } from '@libs/ApiUtils';

const getQuickBooksOnlineSetupLink = (policyID: string) => {
    const otherParams = new URLSearchParams({policyID}).toString();
    const commandUrl = `${getCommandURL({command: 'ConnectPolicyToQuickbooksOnline'})}&${otherParams}`;
    return commandUrl;
}

export {
    // runQuickbooksOnlineOAuthFlow,
    // eslint-disable-next-line import/prefer-default-export
    getQuickBooksOnlineSetupLink,
};