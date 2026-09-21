import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import findAllMatchingDynamicSuffixes from '@libs/Navigation/helpers/dynamicRoutesUtils/findAllMatchingDynamicSuffixes';
import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';

import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

function getFocusedRouteName(state: PartialState<NavigationState>): string | undefined {
    let current: PartialState<NavigationState> | undefined = state;
    let name: string | undefined;

    while (current?.routes) {
        const nextRoute = current.routes.at(current.index ?? current.routes.length - 1);
        name = nextRoute?.name;
        current = nextRoute?.state;
    }

    return name;
}

describe('add domain verify account route', () => {
    it('is listed as an entry screen for the verify-account dynamic route', () => {
        // Given the verify-account dynamic route config
        const {entryScreens} = DYNAMIC_ROUTES.VERIFY_ACCOUNT;

        // Then Add domain is registered, which is what lets the route below resolve instead of falling
        // through to the static linking table
        expect(entryScreens).toContain(SCREENS.WORKSPACES_ADD_DOMAIN);
    });

    it('resolves to the dynamic verify account screen', () => {
        // Given the verify-account suffix appended to the Add domain page, the way useVerifyAccountAndResume builds it
        const url = createDynamicRoute(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path, ROUTES.WORKSPACES_ADD_DOMAIN);

        // When the path is parsed into a navigation state
        const state = getStateFromPath(url);

        // Then the dynamic screen serves the page. Before Add domain was an entry screen this resolved to the
        // now-deleted static WORKSPACES_ADD_DOMAIN_VERIFY_ACCOUNT screen registered at the same URL.
        expect(url).toBe(`${ROUTES.WORKSPACES_ADD_DOMAIN}/${DYNAMIC_ROUTES.VERIFY_ACCOUNT.path}`);
        expect(getFocusedRouteName(state)).toBe(SCREENS.SETTINGS.DYNAMIC_VERIFY_ACCOUNT);
    });

    it('strips the verify-account suffix back to the Add domain page', () => {
        // Given the resolved verify-account path
        const url = createDynamicRoute(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path, ROUTES.WORKSPACES_ADD_DOMAIN);

        // When the suffix is stripped the way useDynamicBackPath does it
        const match = findAllMatchingDynamicSuffixes(url).find((suffixMatch) => suffixMatch.pattern === DYNAMIC_ROUTES.VERIFY_ACCOUNT.path);
        const backPath = match ? getPathWithoutDynamicSuffix(match.pathUsedForMatching, match.actualSuffix, match.pattern) : undefined;

        // Then back lands on Add domain, matching what the deleted static page hardcoded
        expect(backPath).toBe(ROUTES.WORKSPACES_ADD_DOMAIN);
    });
});
