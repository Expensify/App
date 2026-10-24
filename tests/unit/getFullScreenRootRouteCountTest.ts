import getFullScreenRootRouteCount from '@libs/Navigation/helpers/getFullScreenRootRouteCount';

import NAVIGATORS from '@src/NAVIGATORS';

describe('getFullScreenRootRouteCount', () => {
    it('returns 0 when there is no root state yet', () => {
        // Given no root state
        // When the full screen routes are counted
        const count = getFullScreenRootRouteCount(undefined);

        // Then there are none
        expect(count).toBe(0);
    });

    it('counts every full screen route', () => {
        // Given two tab navigators in the root state
        const rootState = {routes: [{name: NAVIGATORS.TAB_NAVIGATOR}, {name: NAVIGATORS.TAB_NAVIGATOR}]};

        // When the full screen routes are counted
        const count = getFullScreenRootRouteCount(rootState);

        // Then both are counted
        expect(count).toBe(2);
    });

    it('does not count a side modal', () => {
        // Given a tab navigator with a side modal drawn on top of it
        const rootState = {routes: [{name: NAVIGATORS.TAB_NAVIGATOR}, {name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR}]};

        // When the full screen routes are counted
        const count = getFullScreenRootRouteCount(rootState);

        // Then only the tab navigator is counted
        expect(count).toBe(1);
    });
});
