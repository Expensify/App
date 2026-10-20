import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import findAllMatchingDynamicSuffixes from '@libs/Navigation/helpers/dynamicRoutesUtils/findAllMatchingDynamicSuffixes';
import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';

import {DYNAMIC_ROUTES} from '@src/ROUTES';

const PATTERN = DYNAMIC_ROUTES.COLLECT_DEPOSIT_ACCOUNT.path;

describe('Collect deposit account dynamic route', () => {
    it('keeps Home underneath when opened from Home', () => {
        const fullPath = 'home/collect-deposit-account/country';
        const matches = findAllMatchingDynamicSuffixes(fullPath);
        const match = matches.find((m) => m.pattern === PATTERN);
        expect(match).toBeDefined();
        if (!match) {
            return;
        }

        const backPath = getPathWithoutDynamicSuffix(match.pathUsedForMatching, match.actualSuffix, match.pattern);
        expect(backPath).toBe('home');
    });

    it('keeps Wallet underneath when opened from Wallet', () => {
        const fullPath = 'settings/wallet/collect-deposit-account/country';
        const matches = findAllMatchingDynamicSuffixes(fullPath);
        const match = matches.find((m) => m.pattern === PATTERN);
        expect(match).toBeDefined();
        if (!match) {
            return;
        }

        const backPath = getPathWithoutDynamicSuffix(match.pathUsedForMatching, match.actualSuffix, match.pattern);
        expect(backPath).toBe('settings/wallet');
    });

    it('builds next step route from entry base without duplicating suffix', () => {
        const basePath = 'home';
        const route = createDynamicRoute(DYNAMIC_ROUTES.COLLECT_DEPOSIT_ACCOUNT.getRoute('country'), basePath);

        expect(route).toBe('home/collect-deposit-account/country');
        expect(route.match(/collect-deposit-account/g)?.length).toBe(1);
    });

    it('builds confirm step route with action', () => {
        const basePath = 'settings/wallet';
        const route = createDynamicRoute(DYNAMIC_ROUTES.COLLECT_DEPOSIT_ACCOUNT.getRoute('confirm', 'edit'), basePath);

        expect(route).toBe('settings/wallet/collect-deposit-account/confirm/edit');
    });

    it('returns bare suffix when no entry base is provided', () => {
        expect(DYNAMIC_ROUTES.COLLECT_DEPOSIT_ACCOUNT.getRoute()).toBe('collect-deposit-account');
        expect(DYNAMIC_ROUTES.COLLECT_DEPOSIT_ACCOUNT.getRoute('country')).toBe('collect-deposit-account/country');
    });
});
