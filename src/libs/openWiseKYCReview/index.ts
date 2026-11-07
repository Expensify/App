import openExternalLink from '@libs/openExternalLink';

import type OpenWiseKYCReview from './types';
import type {GetWiseKYCRedirectURL} from './types';

/** Opens Wise's hosted KYC form in the app's tab. Wise redirects back to the app when the form ends. */
const openWiseKYCReview: OpenWiseKYCReview = (url) => {
    openExternalLink(url, undefined, true);
};

/** The browser loads this URL when the form ends, so it points at the tab's own origin, which differs from the environment URL on adhoc builds and on dev servers behind another host */
const getWiseKYCRedirectURL: GetWiseKYCRedirectURL = (statusPath) => `${window.location.origin}/${statusPath}`;

export default openWiseKYCReview;
export {getWiseKYCRedirectURL};
