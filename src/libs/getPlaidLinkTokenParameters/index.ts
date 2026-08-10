import CONFIG from '@src/CONFIG';
import ROUTES from '@src/ROUTES';

import type GetPlaidLinkTokenParameters from './types';

const getPlaidLinkTokenParameters: GetPlaidLinkTokenParameters = (isPersonalBankAccount = false) => {
    const bankAccountRoute = isPersonalBankAccount ? ROUTES.BANK_ACCOUNT_PERSONAL.getRoute() : ROUTES.BANK_ACCOUNT;

    return {redirectURI: `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}${bankAccountRoute}`};
};

export default getPlaidLinkTokenParameters;
