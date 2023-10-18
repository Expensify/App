import CONFIG from '../../CONFIG';
import GetPlaidLinkTokenParameters from './types';

const getPlaidLinkTokenParameters: GetPlaidLinkTokenParameters = () => ({
    redirectURI: `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}partners/plaid/oauth_ios`,
});

export default getPlaidLinkTokenParameters;
