import CONFIG from '../../CONFIG';
import GetPlaidLinkTokenParameters from './types';

const getPlaidLinkTokenParameters: GetPlaidLinkTokenParameters = () => ({
    redirect_uri: `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}partners/plaid/oauth_ios` // eslint-disable-line @typescript-eslint/naming-convention
});

export default getPlaidLinkTokenParameters;
