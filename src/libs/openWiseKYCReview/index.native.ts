import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type OpenWiseKYCReview from './types';

/** Opens Wise's hosted KYC form in a WebView screen. The screen reads the link from Onyx, since the link carries a token that must stay out of the route. */
const openWiseKYCReview: OpenWiseKYCReview = () => {
    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_KYC_REVIEW.path));
};

export default openWiseKYCReview;
