import {getCommandURL} from '@libs/ApiUtils';
import CONFIG from '@src/CONFIG';

const getQuickBooksOnlineSetupLink = (policyID: string) => {
    const callbackPath = `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}/workspace/${policyID}/accounting`;
    const otherParams = new URLSearchParams({callbackPath, policyID}).toString();
    const commandURL = getCommandURL({command: 'ConnectToQuickbooksOnline'});

    // fake a setup link
    return (
        `https://appcenter.intuit.com/app/connect/oauth2?client_id=xxx&response_type=code&scope=com.intuit.quickbooks.accounting&redirect_uri=https%3A%2F%2Fintegrations.expensify.com.dev%2FIntegration-Server%2FQuickbooksOAuthCallback&state=yyy` ??
        `${commandURL}&${otherParams}`
    );
};

export default getQuickBooksOnlineSetupLink;
