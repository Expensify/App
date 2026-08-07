import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import {linkingConfig} from '@libs/Navigation/linkingConfig';

import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

type NavigationStateNode = NavigationState | PartialState<NavigationState> | undefined;

type NavigationRouteParams = NavigationState['routes'][number]['params'];

function findParams(state: NavigationStateNode, screenName: string): NavigationRouteParams {
    for (const route of state?.routes ?? []) {
        if (route.name === screenName) {
            return route.params;
        }

        const nestedParams = findParams(route.state, screenName);
        if (nestedParams) {
            return nestedParams;
        }
    }

    return undefined;
}

/**
 * The wallet links an admin to the Company cards page of a broken card feed. Without the `feed` param the page opens
 * whichever feed was selected last, which may not be the broken one.
 */
describe('WORKSPACE_COMPANY_CARDS route', () => {
    it('carries the feed through the URL so a deep link opens that feed', () => {
        const route = ROUTES.WORKSPACE_COMPANY_CARDS.getRoute('policy123', 'oauth.americanexpressfdx.com#7001');

        expect(route).toBe('workspaces/policy123/company-cards?feed=oauth.americanexpressfdx.com%237001');
        expect(findParams(getAdaptedStateFromPath(route, linkingConfig.config, false), SCREENS.WORKSPACE.COMPANY_CARDS)).toEqual({
            policyID: 'policy123',
            feed: 'oauth.americanexpressfdx.com#7001',
        });
    });

    it('is unchanged when no feed is passed', () => {
        const route = ROUTES.WORKSPACE_COMPANY_CARDS.getRoute('policy123');

        expect(route).toBe('workspaces/policy123/company-cards');
        expect(findParams(getAdaptedStateFromPath(route, linkingConfig.config, false), SCREENS.WORKSPACE.COMPANY_CARDS)).toEqual({policyID: 'policy123'});
    });
});
