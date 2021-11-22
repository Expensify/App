import CONFIG from '../../CONFIG';

export default () => ({redirect_uri: `${CONFIG.EXPENSIFY.URL_EXPENSIFY_CASH}partners/plaid/oauth_ios`});
