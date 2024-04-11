import {getCommandURL} from '@libs/ApiUtils';
import CONFIG from '@src/CONFIG';
import ROUTES from '@src/ROUTES';

function getQuickBooksOnlineSetupLink(policyID: string) {
    const callbackPath = `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}${ROUTES.WORKSPACE_ACCOUNTING.getRoute(policyID)}`;
    const params = new URLSearchParams({callbackPath, policyID});
    const commandURL = getCommandURL({command: 'ConnectToQuickbooksOnline'});

    return commandURL + params.toString();
}

export default getQuickBooksOnlineSetupLink;
