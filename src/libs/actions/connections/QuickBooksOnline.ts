import {getCommandURL} from '@libs/ApiUtils';
import CONFIG from '@src/CONFIG';

const getQuickBooksOnlineSetupLink = (policyID: string) => {
    const callbackPath = `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}/workspace/${policyID}/accounting`;
    const otherParams = new URLSearchParams({callbackPath, policyID}).toString();
    const commandURL = getCommandURL({command: 'ConnectToQuickbooksOnline'});

    return `${commandURL}&${otherParams}`;
};

export default getQuickBooksOnlineSetupLink;
