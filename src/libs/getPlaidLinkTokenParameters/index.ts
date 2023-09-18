import ROUTES from '../../ROUTES';
import CONFIG from '../../CONFIG';
import GetPlaidLinkTokenParameters from './types';

const getPlaidLinkTokenParameters: GetPlaidLinkTokenParameters = ()=> {
    const bankAccountRoute = window.location.href.includes('personal') ? ROUTES.BANK_ACCOUNT_PERSONAL : ROUTES.BANK_ACCOUNT;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    return {redirect_uri: `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}${bankAccountRoute}`};
};

export default getPlaidLinkTokenParameters;
