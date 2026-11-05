import openExternalLink from '@libs/openExternalLink';

import type OpenWiseKYCReview from './types';

/** Opens Wise's hosted KYC form in the app's tab. Wise redirects back to the app when the form ends. */
const openWiseKYCReview: OpenWiseKYCReview = (url) => {
    openExternalLink(url, undefined, true);
};

export default openWiseKYCReview;
