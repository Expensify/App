import CONFIG from '@src/CONFIG';
import ROUTES from '@src/ROUTES';

import type GetPlaidLinkTokenParameters from './types';

const getPlaidLinkTokenParameters: GetPlaidLinkTokenParameters = () => {
    const bankAccountRoute = window.location.href.includes('personal') ? ROUTES.BANK_ACCOUNT_PERSONAL.getRoute() : ROUTES.BANK_ACCOUNT;

    // Plaid redirects only to URIs registered with it, so this stays on the New Expensify host
    return {redirectURI: `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}${bankAccountRoute}`};
};

export default getPlaidLinkTokenParameters;
