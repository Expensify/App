import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import findAllMatchingDynamicSuffixes from '@libs/Navigation/helpers/dynamicRoutesUtils/findAllMatchingDynamicSuffixes';
import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import isDynamicRouteSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/isDynamicRouteSuffix';

import {DYNAMIC_ROUTES} from '@src/ROUTES';

const BUSINESS_PATTERN = DYNAMIC_ROUTES.ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS.path;

describe('Enable global reimbursements dynamic routes', () => {
    const fullPath = 'search/view/6546028296902751/enable-global-reimbursements/business/9053192/registration-number?bankCountry=US&bankCurrency=USD';

    it('matches business suffix on search path', () => {
        const matches = findAllMatchingDynamicSuffixes(fullPath);
        const businessMatch = matches.find((m) => m.pattern === BUSINESS_PATTERN);
        expect(businessMatch).toBeDefined();
        expect(businessMatch?.actualSuffix).toBe('enable-global-reimbursements/business/9053192/registration-number');
    });

    it('strips business suffix for back path', () => {
        const matches = findAllMatchingDynamicSuffixes(fullPath);
        const businessMatch = matches.find((m) => m.pattern === BUSINESS_PATTERN);
        expect(businessMatch).toBeDefined();

        const backPath = getPathWithoutDynamicSuffix(businessMatch!.pathUsedForMatching, businessMatch!.actualSuffix, businessMatch!.pattern);
        expect(backPath).toBe('search/view/6546028296902751');
    });

    it('strips business suffix when backTo query param is present', () => {
        const pathWithBackTo =
            'search/view/6546028296902751/enable-global-reimbursements/business/9053192/registration-number?backTo=%2Fsearch%3Fq%3Dtype%253Aexpense&bankCountry=US&bankCurrency=USD';
        const matches = findAllMatchingDynamicSuffixes(pathWithBackTo);
        const businessMatch = matches.find((m) => m.pattern === BUSINESS_PATTERN);
        expect(businessMatch).toBeDefined();

        const backPath = getPathWithoutDynamicSuffix(businessMatch!.pathUsedForMatching, businessMatch!.actualSuffix, businessMatch!.pattern);
        expect(backPath).toBe('search/view/6546028296902751?backTo=%2Fsearch%3Fq%3Dtype%253Aexpense');
    });

    it('accepts type subpage suffix', () => {
        const typeSuffix = 'enable-global-reimbursements/business/9053192/type?bankCountry=US&bankCurrency=USD';
        expect(isDynamicRouteSuffix(typeSuffix.split('?').at(0) ?? '')).toBe(true);
    });

    it('builds next step route from stripped base without duplicating suffix', () => {
        const basePath = 'search/view/6546028296902751?backTo=%2Fsearch%3Fq%3Dtype%253Aexpense';
        const typeRoute = createDynamicRoute(DYNAMIC_ROUTES.ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS.getRoute('9053192', 'type', undefined, {bankCountry: 'US', bankCurrency: 'USD'}), basePath);

        expect(typeRoute).toBe('search/view/6546028296902751/enable-global-reimbursements/business/9053192/type?backTo=%2Fsearch%3Fq%3Dtype%253Aexpense&bankCountry=US&bankCurrency=USD');
        expect(typeRoute.match(/enable-global-reimbursements/g)?.length).toBe(1);
    });
});
