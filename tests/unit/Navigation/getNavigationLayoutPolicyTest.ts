import getNavigationLayoutPolicy from '@libs/Navigation/AppNavigator/getNavigationLayoutPolicy';

import variables from '@styles/variables';

const ZERO_INSETS = {top: 0, right: 0, bottom: 0, left: 0};
const REQUIRED_WIDE_WIDTH = variables.navigationTabBarSize + variables.sideBarWithLHBWidth + variables.navigationCentralPaneMinWidth;

describe('getNavigationLayoutPolicy', () => {
    it('requires enough usable width for the rail, sidebar, and central pane', () => {
        const narrowPolicy = getNavigationLayoutPolicy(
            {width: REQUIRED_WIDE_WIDTH - 1, height: 700, safeAreaInsets: ZERO_INSETS},
            {forceNarrowInLandscape: false, includeNavigationRail: true},
        );
        const widePolicy = getNavigationLayoutPolicy({width: REQUIRED_WIDE_WIDTH, height: 700, safeAreaInsets: ZERO_INSETS}, {forceNarrowInLandscape: false, includeNavigationRail: true});

        expect(narrowPolicy.mode).toBe('narrow');
        expect(widePolicy.mode).toBe('wide');
        expect(widePolicy.centralWidth).toBe(variables.navigationCentralPaneMinWidth);
    });

    it('classifies the available width after safe-area insets', () => {
        const policy = getNavigationLayoutPolicy(
            {width: REQUIRED_WIDE_WIDTH + 19, height: 700, safeAreaInsets: {...ZERO_INSETS, left: 10, right: 10}},
            {forceNarrowInLandscape: false, includeNavigationRail: true},
        );

        expect(policy.mode).toBe('narrow');
        expect(policy.availableRect).toEqual({x: 10, y: 0, width: REQUIRED_WIDE_WIDTH - 1, height: 700});
        expect(policy.safeAreaInsets).toEqual({top: 0, right: 10, bottom: 0, left: 10});
    });

    it('can preserve the existing web landscape rule', () => {
        const policy = getNavigationLayoutPolicy({width: REQUIRED_WIDE_WIDTH + 200, height: 700, safeAreaInsets: ZERO_INSETS}, {forceNarrowInLandscape: true, includeNavigationRail: true});

        expect(policy.mode).toBe('narrow');
    });

    it('falls back to narrow mode when the policy is disabled', () => {
        const policy = getNavigationLayoutPolicy(
            {width: REQUIRED_WIDE_WIDTH + 200, height: 700, safeAreaInsets: ZERO_INSETS},
            {forceNarrowInLandscape: false, includeNavigationRail: true, isEnabled: false},
        );

        expect(policy.mode).toBe('narrow');
        expect(policy.navigationRailWidth).toBe(0);
        expect(policy.lhnWidth).toBe(0);
    });
});
