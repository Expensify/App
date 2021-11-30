import ROUTES from '../../ROUTES';
import CONST from '../../CONST';

export default () => {
    const bankAccountRoute = window.location.href.includes('personal') ? ROUTES.BANK_ACCOUNT_PERSONAL : ROUTES.BANK_ACCOUNT;
    return {redirect_uri: `${CONST.NEW_EXPENSIFY_URL}/${bankAccountRoute}`};
};
