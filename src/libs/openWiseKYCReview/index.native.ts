import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import addTrailingForwardSlash from '@libs/UrlUtils';

import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type OpenWiseKYCReview from './types';
import type {GetWiseKYCRedirectURL} from './types';

/** Opens Wise's hosted KYC form in a WebView screen. The screen reads the link from Onyx, since the link carries a token that must stay out of the route. */
const openWiseKYCReview: OpenWiseKYCReview = (_url, statusPath) => {
    // The active route is rebuilt from the stack, which misses the intro when Wallet or Home opened the status page, so the form opens over the status page's own path
    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_KYC_REVIEW.path, statusPath));
};

/** The form's WebView stops at this URL instead of loading it, by matching its host against the environment URL */
const getWiseKYCRedirectURL: GetWiseKYCRedirectURL = (statusPath, environmentURL) => `${addTrailingForwardSlash(environmentURL)}${statusPath}`;

export default openWiseKYCReview;
export {getWiseKYCRedirectURL};
