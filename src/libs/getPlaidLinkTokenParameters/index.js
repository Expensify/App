import ROUTES from '../../ROUTES';
import CONFIG from '../../CONFIG';

export default () => {
    const bankAccountRoute = window.location.href.includes('personal') ? ROUTES.BANK_ACCOUNT_PERSONAL : ROUTES.BANK_ACCOUNT;
    return {redirect_uri: `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}${bankAccountRoute}`};
};
