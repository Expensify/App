import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route as Routes} from '@src/ROUTES';

import findAllMatchingDynamicSuffixes from './dynamicRoutesUtils/findAllMatchingDynamicSuffixes';
import getPathWithoutDynamicSuffix from './dynamicRoutesUtils/getPathWithoutDynamicSuffix';

const replaceCompanyCardsRoute = (route: string): Routes => {
    const pathWithoutLeadingSlash = route.replaceAll(/^\/+/g, '');
    const match = findAllMatchingDynamicSuffixes(pathWithoutLeadingSlash).find((m) => m.pattern === DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARD_EXPORT.path);
    if (match) {
        return getPathWithoutDynamicSuffix(match.pathUsedForMatching, match.actualSuffix, match.pattern);
    }

    return pathWithoutLeadingSlash.replaceAll(/\/edit\/export$/g, '') as Routes;
};

export default replaceCompanyCardsRoute;
