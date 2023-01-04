import ROUTES from '../../ROUTES';

export default () => {
    const bankAccountRoute = window.location.href.includes('personal') ? ROUTES.BANK_ACCOUNT_PERSONAL : ROUTES.BANK_ACCOUNT;
    return {redirect_uri: `https://localhost:8080/${bankAccountRoute}`};
};
