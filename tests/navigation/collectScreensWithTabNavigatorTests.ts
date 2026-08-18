import type {ScreenConfigEntry} from '@libs/Navigation/helpers/collectScreensWithTabNavigator';
import collectScreensWithTabNavigator from '@libs/Navigation/helpers/collectScreensWithTabNavigator';

jest.mock('@src/NAVIGATORS', () => ({
    CENTRAL_PANE_NAVIGATOR: 'CentralPaneNavigator',
    RIGHT_MODAL_NAVIGATOR: 'RightModalNavigator',
}));

jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/isDynamicRouteSuffix', () => ({
    __esModule: true,
    default: (suffix: string) => suffix === 'tag/:tagID' || suffix === 'report/:reportID',
    dynamicRoutePaths: new Set(['tag/:tagID', 'report/:reportID']),
}));

describe('collectScreensWithTabNavigator', () => {
    it('should skip string configs and object configs missing path or screens', () => {
        const screens: Record<string, ScreenConfigEntry> = {
            StringScreen: 'home',
            PathOnly: {path: '/settings'},
            ScreensOnly: {screens: {Child: 'child'}},
        };

        const result = collectScreensWithTabNavigator(screens);

        expect(result.screensWithTabNavigator.size).toBe(0);
    });

    it('should collect a screen that has both path and screens', () => {
        const screens: Record<string, ScreenConfigEntry> = {
            TabScreen: {path: '/tabs', screens: {Tab1: 'tab1', Tab2: 'tab2'}},
        };

        const result = collectScreensWithTabNavigator(screens);

        expect(result.screensWithTabNavigator).toEqual(new Set(['TabScreen']));
    });

    it('should exclude navigator names even if they have both path and screens', () => {
        const screens: Record<string, ScreenConfigEntry> = {
            CentralPaneNavigator: {path: '/central', screens: {Inner: 'inner'}},
            RightModalNavigator: {path: '/modal', screens: {Inner: 'inner'}},
        };

        const result = collectScreensWithTabNavigator(screens);

        expect(result.screensWithTabNavigator.size).toBe(0);
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

        expect(result.screensWithTabNavigator).toEqual(new Set(['NestedTabScreen']));
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

        expect(result.screensWithTabNavigator).toEqual(new Set(['Level1Tab', 'Level3Tab']));
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

        expect(result.screensWithTabNavigator).toEqual(new Set(['ValidTab', 'AnotherTab']));
    });
});

describe('collectScreensWithTabNavigator — dynamicTabPatternToTabPaths', () => {
    it('should not populate map for non-dynamic tab-host screens', () => {
        const screens: Record<string, ScreenConfigEntry> = {
            TabScreen: {path: '/tabs', screens: {Tab1: 'tab1', Tab2: 'tab2'}},
        };

        const result = collectScreensWithTabNavigator(screens);

        expect(result.dynamicTabPatternToTabPaths.size).toBe(0);
    });

    it('should map dynamic pattern to tab paths', () => {
        const screens: Record<string, ScreenConfigEntry> = {
            TagScreen: {path: 'tag/:tagID', screens: {Expenses: 'expenses', Reports: 'reports'}},
        };

        const result = collectScreensWithTabNavigator(screens);

        expect(result.dynamicTabPatternToTabPaths.get('tag/:tagID')).toEqual(new Set(['expenses', 'reports']));
    });

    it('should exclude tab children without a path', () => {
        const screens: Record<string, ScreenConfigEntry> = {
            TagScreen: {
                path: 'tag/:tagID',
                screens: {
                    WithPath: {path: 'expenses'},
                    WithoutPath: {},
                },
            },
        };

        const result = collectScreensWithTabNavigator(screens);

        expect(result.dynamicTabPatternToTabPaths.get('tag/:tagID')).toEqual(new Set(['expenses']));
    });

    it('should handle multiple dynamic tab-host screens independently', () => {
        const screens: Record<string, ScreenConfigEntry> = {
            TagScreen: {path: 'tag/:tagID', screens: {Tab1: 'tab1'}},
            ReportScreen: {path: 'report/:reportID', screens: {Tab2: 'tab2'}},
        };

        const result = collectScreensWithTabNavigator(screens);

        expect(result.dynamicTabPatternToTabPaths.get('tag/:tagID')).toEqual(new Set(['tab1']));
        expect(result.dynamicTabPatternToTabPaths.get('report/:reportID')).toEqual(new Set(['tab2']));
    });
});

describe('collectScreensWithTabNavigator — dynamicTabScreensByHost', () => {
    it('should not populate map for non-dynamic tab-host screens', () => {
        const screens: Record<string, ScreenConfigEntry> = {
            TabScreen: {path: '/tabs', screens: {Tab1: 'tab1'}},
        };

        const result = collectScreensWithTabNavigator(screens);

        expect(result.dynamicTabScreensByHost.size).toBe(0);
    });

    it('should map host screen name to tab path - screen name', () => {
        const screens: Record<string, ScreenConfigEntry> = {
            TagScreen: {path: 'tag/:tagID', screens: {ExpenseTab: 'expenses', ReportTab: 'reports'}},
        };

        const result = collectScreensWithTabNavigator(screens);

        expect(result.dynamicTabScreensByHost.get('TagScreen')).toEqual(
            new Map([
                ['expenses', 'ExpenseTab'],
                ['reports', 'ReportTab'],
            ]),
        );
    });

    it('should handle mixed string and object tab children', () => {
        const screens: Record<string, ScreenConfigEntry> = {
            TagScreen: {
                path: 'tag/:tagID',
                screens: {
                    StringChild: 'string-path',
                    ObjectChild: {path: 'object-path'},
                },
            },
        };

        const result = collectScreensWithTabNavigator(screens);

        expect(result.dynamicTabScreensByHost.get('TagScreen')).toEqual(
            new Map([
                ['string-path', 'StringChild'],
                ['object-path', 'ObjectChild'],
            ]),
        );
    });

    it('should exclude children without a path from the map', () => {
        const screens: Record<string, ScreenConfigEntry> = {
            TagScreen: {
                path: 'tag/:tagID',
                screens: {
                    WithPath: 'expenses',
                    WithoutPath: {},
                },
            },
        };

        const result = collectScreensWithTabNavigator(screens);

        expect(result.dynamicTabScreensByHost.get('TagScreen')).toEqual(new Map([['expenses', 'WithPath']]));
    });
});
