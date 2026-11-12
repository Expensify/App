import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import findAllMatchingDynamicSuffixes from '@libs/Navigation/helpers/dynamicRoutesUtils/findAllMatchingDynamicSuffixes';
import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';

import {DYNAMIC_ROUTES} from '@src/ROUTES';

const PATTERN = DYNAMIC_ROUTES.COLLECT_DEPOSIT_ACCOUNT.path;

describe('Collect deposit account dynamic route', () => {
    it('keeps Home underneath when opened from Home', () => {
        // Given a full path that opens the collect-deposit-account flow on top of the Home screen
        const fullPath = 'home/collect-deposit-account/country';

        // When the dynamic suffix matcher runs against the path
        const matches = findAllMatchingDynamicSuffixes(fullPath);
        const match = matches.find((m) => m.pattern === PATTERN);

        // Then the collect-deposit-account suffix matches and the back path is the Home base
        expect(match).toBeDefined();
        if (!match) {
            return;
        }
        const backPath = getPathWithoutDynamicSuffix(match.pathUsedForMatching, match.actualSuffix, match.pattern);
        expect(backPath).toBe('home');
    });

    it('keeps Wallet underneath when opened from Wallet', () => {
        // Given a full path that opens the collect-deposit-account flow on top of the Wallet settings screen
        const fullPath = 'settings/wallet/collect-deposit-account/country';

        // When the dynamic suffix matcher runs against the path
        const matches = findAllMatchingDynamicSuffixes(fullPath);
        const match = matches.find((m) => m.pattern === PATTERN);

        // Then the collect-deposit-account suffix matches and the back path is the Wallet base
        expect(match).toBeDefined();
        if (!match) {
            return;
        }
        const backPath = getPathWithoutDynamicSuffix(match.pathUsedForMatching, match.actualSuffix, match.pattern);
        expect(backPath).toBe('settings/wallet');
    });

    it('builds next step route from entry base without duplicating suffix', () => {
        // Given an entry base path for the Home screen and a target sub-page
        const basePath = 'home';

        // When the next step route is built from the entry base
        const route = createDynamicRoute(DYNAMIC_ROUTES.COLLECT_DEPOSIT_ACCOUNT.getRoute('country'), basePath);

        // Then the suffix is appended once onto the entry base, not stacked onto the current URL
        expect(route).toBe('home/collect-deposit-account/country');
        expect(route.match(/collect-deposit-account/g)?.length).toBe(1);
    });

    it('builds confirm step route with action', () => {
        // Given an entry base path for the Wallet screen and an edit action on the confirm step
        const basePath = 'settings/wallet';

        // When the confirm-step route is built with the edit action
        const route = createDynamicRoute(DYNAMIC_ROUTES.COLLECT_DEPOSIT_ACCOUNT.getRoute('confirm', 'edit'), basePath);

        // Then the sub-page and action are both appended to the entry base
        expect(route).toBe('settings/wallet/collect-deposit-account/confirm/edit');
    });

    it('returns bare suffix when no entry base is provided', () => {
        // Given no entry base path is supplied to getRoute
        // When getRoute is called with no sub-page and with a sub-page
        // Then the bare suffix is returned, so the caller can append it onto whatever entry base they capture
        expect(DYNAMIC_ROUTES.COLLECT_DEPOSIT_ACCOUNT.getRoute()).toBe('collect-deposit-account');
        expect(DYNAMIC_ROUTES.COLLECT_DEPOSIT_ACCOUNT.getRoute('country')).toBe('collect-deposit-account/country');
    });
});
