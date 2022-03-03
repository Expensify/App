import CONFIG from '../../CONFIG';

export default () => ({redirect_uri: `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}partners/plaid/oauth_ios`});
