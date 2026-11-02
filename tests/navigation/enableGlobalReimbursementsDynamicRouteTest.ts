import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import findAllMatchingDynamicSuffixes from '@libs/Navigation/helpers/dynamicRoutesUtils/findAllMatchingDynamicSuffixes';
import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import isDynamicRouteSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/isDynamicRouteSuffix';
import {
    getEnableGlobalReimbursementsBusinessNavigationRoute,
    getWiseGlobalReimbursementsIntroNavigationRoute,
    isWiseGlobalReimbursementsIntroOverPayReportScreen,
    shouldUseDynamicEnableGlobalReimbursementsBase,
} from '@libs/Navigation/helpers/enableGlobalReimbursementsNavigationUtils';

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
        if (!businessMatch) {
            return;
        }

        const backPath = getPathWithoutDynamicSuffix(businessMatch.pathUsedForMatching, businessMatch.actualSuffix, businessMatch.pattern);
        expect(backPath).toBe('search/view/6546028296902751');
    });

    it('strips business suffix when backTo query param is present', () => {
        const pathWithBackTo = 'search/view/6546028296902751/enable-global-reimbursements/business/9053192/registration-number?backTo=%2Fr%2F123&bankCountry=US&bankCurrency=USD';
        const matches = findAllMatchingDynamicSuffixes(pathWithBackTo);
        const businessMatch = matches.find((m) => m.pattern === BUSINESS_PATTERN);
        expect(businessMatch).toBeDefined();
        if (!businessMatch) {
            return;
        }

        const backPath = getPathWithoutDynamicSuffix(businessMatch.pathUsedForMatching, businessMatch.actualSuffix, businessMatch.pattern);
        expect(backPath).toBe('search/view/6546028296902751?backTo=%2Fr%2F123');
    });

    it('accepts type subpage suffix', () => {
        const typeSuffix = 'enable-global-reimbursements/business/9053192/type?bankCountry=US&bankCurrency=USD';
        expect(isDynamicRouteSuffix(typeSuffix.split('?').at(0) ?? '')).toBe(true);
    });

    it('builds next step route from stripped base without duplicating suffix', () => {
        const basePath = 'search/view/6546028296902751?backTo=%2Fr%2F123';
        const typeRoute = createDynamicRoute(DYNAMIC_ROUTES.ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS.getRoute('9053192', 'type', undefined, {bankCountry: 'US', bankCurrency: 'USD'}), basePath);

        expect(typeRoute).toBe('search/view/6546028296902751/enable-global-reimbursements/business/9053192/type?backTo=%2Fr%2F123&bankCountry=US&bankCurrency=USD');
        expect(typeRoute.match(/enable-global-reimbursements/g)?.length).toBe(1);
    });

    it('builds sign route with query params on dynamic base', () => {
        const basePath = 'search/view/6546028296902751';
        const signRoute = createDynamicRoute(DYNAMIC_ROUTES.ENABLE_GLOBAL_REIMBURSEMENTS_SIGN.getRoute('9053192', {bankCountry: 'US', bankCurrency: 'USD'}), basePath);

        expect(signRoute).toBe('search/view/6546028296902751/enable-global-reimbursements/sign/9053192?bankCountry=US&bankCurrency=USD');
    });

    it('uses search base path captured at signal time for pay modal navigation', () => {
        const signalPath = 'search/view/6546028296902751?backTo=%2Fr%2F123';
        const route = getEnableGlobalReimbursementsBusinessNavigationRoute(9053192, 'registration-number', {bankCountry: 'US', bankCurrency: 'USD'}, signalPath);

        expect(route).toBe('search/view/6546028296902751/enable-global-reimbursements/business/9053192/registration-number?backTo=%2Fr%2F123&bankCountry=US&bankCurrency=USD');
    });

    it('accepts expense report and search root entry screens', () => {
        expect(shouldUseDynamicEnableGlobalReimbursementsBase('e/12345')).toBe(true);
        expect(shouldUseDynamicEnableGlobalReimbursementsBase('search')).toBe(true);
        expect(shouldUseDynamicEnableGlobalReimbursementsBase('r/12345')).toBe(true);
    });

    it('falls back to wallet settings route for unsupported entry screens', () => {
        expect(shouldUseDynamicEnableGlobalReimbursementsBase('settings/preferences')).toBe(false);

        const route = getEnableGlobalReimbursementsBusinessNavigationRoute(9053192, 'registration-number', {bankCountry: 'US', bankCurrency: 'USD'}, 'settings/preferences');

        expect(route).toBe('settings/wallet/9053192/enable-global-reimbursements/business/registration-number?bankCountry=US&bankCurrency=USD');
    });

    describe('getWiseGlobalReimbursementsIntroNavigationRoute', () => {
        it.each([
            ['a report', 'r/123', 'r/123/global-reimbursements/456'],
            ['the search root', 'search', 'search/global-reimbursements/456'],
            ['a search report RHP with backTo', 'search/view/123?backTo=search', 'search/view/123/global-reimbursements/456?backTo=search'],
        ])('opens the intro over %s', (_label, signalPath, expectedRoute) => {
            // Given the pay signal arrives while the admin is on a supported entry screen
            // When the intro route is built from the path captured at signal time
            const route = getWiseGlobalReimbursementsIntroNavigationRoute(456, signalPath);

            // Then the intro is nested on top of that screen so back returns to it
            expect(route).toBe(expectedRoute);
        });

        it('strips an already open intro so a repeated signal does not stack suffixes', () => {
            // Given the intro is already open over a report (double pay tap or retry)
            const signalPath = 'r/123/global-reimbursements/456';

            // When the intro route is built again from that path
            const route = getWiseGlobalReimbursementsIntroNavigationRoute(456, signalPath);

            // Then the report base is recovered and the suffix appears only once
            expect(route).toBe('r/123/global-reimbursements/456');
        });

        it('keeps the multiple reports flag on the intro opened by bulk pay', () => {
            // Given bulk pay could not pay any of the selected reports on the search root
            const signalPath = 'search';

            // When the intro route is built for several reports
            const route = getWiseGlobalReimbursementsIntroNavigationRoute(456, signalPath, true);

            // Then the intro is nested over search and carries the flag, so it shows the copy for several reports
            expect(route).toBe('search/global-reimbursements/456?isPayingMultipleReports=true');
        });

        it('falls back to the wallet when the signal arrives on an unsupported screen', () => {
            // Given the admin navigated to a screen that is not an intro entry screen
            const signalPath = 'settings/preferences';

            // When the intro route is built
            const route = getWiseGlobalReimbursementsIntroNavigationRoute(456, signalPath);

            // Then the intro opens over the wallet because it has no static route
            expect(route).toBe('settings/wallet/global-reimbursements/456');
        });
    });

    describe('isWiseGlobalReimbursementsIntroOverPayReportScreen', () => {
        it.each([
            ['a report', 'r/123'],
            ['the search root', 'search'],
            ['a search report RHP with backTo', 'search/view/123?backTo=search'],
        ])('treats the intro over %s as opened by paying a report', (_label, backPath) => {
            // Given the intro sits on top of a screen where the admin can pay a report
            // When the page checks where it was opened from
            const isOverPayReportScreen = isWiseGlobalReimbursementsIntroOverPayReportScreen(backPath);

            // Then it shows the copy explaining why paying this report needs global reimbursements
            expect(isOverPayReportScreen).toBe(true);
        });

        it.each([
            ['the wallet', 'settings/wallet'],
            ['workspace workflows', 'workspaces/123/workflows'],
        ])('treats the intro over %s as opened from a banner', (_label, backPath) => {
            // Given the intro sits on top of a screen that only reaches it through the Wise banner or menu
            // When the page checks where it was opened from
            const isOverPayReportScreen = isWiseGlobalReimbursementsIntroOverPayReportScreen(backPath);

            // Then it keeps the generic copy because the admin asked to enable global reimbursements directly
            expect(isOverPayReportScreen).toBe(false);
        });
    });
});
