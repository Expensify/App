import {getCommandURL} from '@libs/ApiUtils';
import CONFIG from '@src/CONFIG';

function getQuickBooksOnlineSetupLink(policyID: string) {
    const callbackPath = `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}/workspace/${policyID}/accounting`;
    const otherParams = new URLSearchParams({callbackPath, policyID}).toString();
    const commandURL = getCommandURL({command: 'ConnectToQuickbooksOnline'});
    return `${commandURL}&${otherParams}`;
}

// More action functions will be added later
// eslint-disable-next-line import/prefer-default-export
export {getQuickBooksOnlineSetupLink};
