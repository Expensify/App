import CONFIG from '../../CONFIG';

export default () => ({redirect_uri: `${CONFIG.EXPENSIFY.EXPENSIFY_CHAT_URL}partners/plaid/oauth_ios`});
