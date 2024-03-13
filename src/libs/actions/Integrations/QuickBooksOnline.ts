import { getCommandURL } from '@libs/ApiUtils';

const getQuickBooksOnlineSetupLink = (policyID: string) => {
    const callbackPath = `https://dev.new.expensify.com:8082/workspace/${policyID}/accounting`;
    const otherParams = new URLSearchParams({callbackPath, policyID}).toString();
    const commandUrl = `${getCommandURL({command: 'ConnectPolicyToQuickbooksOnline'})}&${otherParams}`;
    return commandUrl;
}

export {
    // runQuickbooksOnlineOAuthFlow,
    // eslint-disable-next-line import/prefer-default-export
    getQuickBooksOnlineSetupLink,
};