import CONFIG from '../../CONFIG';
import GetPlaidLinkTokenParameters from './types';

const getPlaidLinkTokenParameters: GetPlaidLinkTokenParameters = () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    redirect_uri: `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}partners/plaid/oauth_ios`,
});

export default getPlaidLinkTokenParameters;
