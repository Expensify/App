import type {ScreenConfigEntry} from '@libs/Navigation/helpers/collectScreensWithTabNavigator';
import collectScreensWithTabNavigator from '@libs/Navigation/helpers/collectScreensWithTabNavigator';

jest.mock('@src/NAVIGATORS', () => {
    const navigators = {
        CENTRAL_PANE_NAVIGATOR: 'CentralPaneNavigator',
        RIGHT_MODAL_NAVIGATOR: 'RightModalNavigator',
    };
    return navigators;
});

describe('collectScreensWithTabNavigator', () => {
    it('should skip string configs and object configs missing path or screens', () => {
        const screens: Record<string, ScreenConfigEntry> = {
            StringScreen: 'home',
            PathOnly: {path: '/settings'},
            ScreensOnly: {screens: {Child: 'child'}},
        };

        const result = collectScreensWithTabNavigator(screens);

        expect(result.size).toBe(0);
    });

    it('should collect a screen that has both path and screens', () => {
        const screens: Record<string, ScreenConfigEntry> = {
            TabScreen: {path: '/tabs', screens: {Tab1: 'tab1', Tab2: 'tab2'}},
        };

        const result = collectScreensWithTabNavigator(screens);

        expect(result).toEqual(new Set(['TabScreen']));
    });

    it('should exclude navigator names even if they have both path and screens', () => {
        const screens: Record<string, ScreenConfigEntry> = {
            CentralPaneNavigator: {path: '/central', screens: {Inner: 'inner'}},
            RightModalNavigator: {path: '/modal', screens: {Inner: 'inner'}},
        };

        const result = collectScreensWithTabNavigator(screens);

        expect(result.size).toBe(0);
    });

    it('should collect a nested tab screen inside a navigator', () => {
        const screens: Record<string, ScreenConfigEntry> = {
            CentralPaneNavigator: {
                screens: {
                    NestedTabScreen: {path: '/nested', screens: {Tab1: 'tab1'}},
                },
            },
        };

        const result = collectScreensWithTabNavigator(screens);

        expect(result).toEqual(new Set(['NestedTabScreen']));
    });

    it('should collect tab screens at all depth levels in a 3-level structure', () => {
        const screens: Record<string, ScreenConfigEntry> = {
            Level1Tab: {
                path: '/l1',
                screens: {
                    Wrapper: {
                        screens: {
                            Level3Tab: {path: '/l3', screens: {DeepTab: 'deep'}},
                        },
                    },
                },
            },
        };

        const result = collectScreensWithTabNavigator(screens);

        expect(result).toEqual(new Set(['Level1Tab', 'Level3Tab']));
    });

    it('should collect only matching screens from a mixed config', () => {
        const screens: Record<string, ScreenConfigEntry> = {
            SimpleString: 'home',
            PathOnly: {path: '/settings'},
            ScreensOnly: {screens: {A: 'a'}},
            CentralPaneNavigator: {path: '/nav', screens: {X: 'x'}},
            ValidTab: {path: '/valid', screens: {T1: 't1'}},
            AnotherTab: {path: '/another', screens: {T2: 't2'}},
        };

        const result = collectScreensWithTabNavigator(screens);

        expect(result).toEqual(new Set(['ValidTab', 'AnotherTab']));
    });
});
