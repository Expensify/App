import type {NavigationState, PartialState} from '@react-navigation/native';
import getFocusedLeafScreenName from '@libs/Navigation/helpers/getFocusedLeafScreenName';

describe('getFocusedLeafScreenName', () => {
    it('returns undefined for undefined state', () => {
        expect(getFocusedLeafScreenName(undefined)).toBeUndefined();
    });

    it('returns undefined when state.index is undefined', () => {
        const state: PartialState<NavigationState> = {
            routes: [{name: 'Home'}],
        };
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

    it('returns the focused route name when nested state has no index', () => {
        const state: PartialState<NavigationState> = {
            index: 0,
            routes: [
                {
                    name: 'TabNavigator',
                    state: {
                        routes: [{name: 'Child'}],
                    },
                },
            ],
        };
        // Inner state has no index => recursion returns undefined
        expect(getFocusedLeafScreenName(state)).toBeUndefined();
    });
});
