import type {NavigationState, PartialState} from '@react-navigation/native';
import getFocusedLeafScreenName from '@libs/Navigation/helpers/getFocusedLeafScreenName';

describe('getFocusedLeafScreenName', () => {
    it('returns undefined for undefined state', () => {
        expect(getFocusedLeafScreenName(undefined)).toBeUndefined();
    });

    it('falls back to the last route when state.index is undefined', () => {
        const state: PartialState<NavigationState> = {
            routes: [{name: 'Home'}, {name: 'Settings'}],
        };
        expect(getFocusedLeafScreenName(state)).toBe('Settings');
    });

    it('returns undefined when state has no routes', () => {
        const state = {routes: []} as unknown as PartialState<NavigationState>;
        expect(getFocusedLeafScreenName(state)).toBeUndefined();
    });

    it('returns focused route name when no nested state', () => {
        const state: PartialState<NavigationState> = {
            index: 0,
            routes: [{name: 'Home'}, {name: 'Settings'}],
        };
        expect(getFocusedLeafScreenName(state)).toBe('Home');
    });

    it('recurses into nested state to find leaf screen', () => {
        const state: PartialState<NavigationState> = {
            index: 0,
            routes: [
                {
                    name: 'TabNavigator',
                    state: {
                        index: 1,
                        routes: [{name: 'Home'}, {name: 'ReportsSplit'}],
                    },
                },
            ],
        };
        expect(getFocusedLeafScreenName(state)).toBe('ReportsSplit');
    });

    it('handles 3+ levels of nesting', () => {
        const state: PartialState<NavigationState> = {
            index: 0,
            routes: [
                {
                    name: 'TabNavigator',
                    state: {
                        index: 0,
                        routes: [
                            {
                                name: 'SettingsSplit',
                                state: {
                                    index: 1,
                                    routes: [{name: 'Settings_Root'}, {name: 'Settings_Profile'}],
                                },
                            },
                        ],
                    },
                },
            ],
        };
        expect(getFocusedLeafScreenName(state)).toBe('Settings_Profile');
    });

    it('falls back to the last nested route when nested state has no index', () => {
        const state: PartialState<NavigationState> = {
            index: 0,
            routes: [
                {
                    name: 'TabNavigator',
                    state: {
                        routes: [{name: 'Inbox'}, {name: 'Report'}],
                    },
                },
            ],
        };
        expect(getFocusedLeafScreenName(state)).toBe('Report');
    });

    it('resolves the deep leaf on cold-start when the state is incomplete (no index at any level)', () => {
        const state: PartialState<NavigationState> = {
            routes: [
                {
                    name: 'TabNavigator',
                    state: {
                        routes: [
                            {
                                name: 'ReportsSplitNavigator',
                                state: {
                                    routes: [{name: 'Report'}],
                                },
                            },
                        ],
                    },
                },
            ],
        };
        expect(getFocusedLeafScreenName(state)).toBe('Report');
    });
});
