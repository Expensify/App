import type {NavigationState} from '@react-navigation/native';
import {findParentNavigatorKey} from '@libs/Navigation/Navigation';

describe('findParentNavigatorKey', () => {
    it('returns the root navigator key when the route is a direct child', () => {
        const state = {
            key: 'root-nav',
            routes: [
                {key: 'route-A', name: 'ScreenA'},
                {key: 'route-B', name: 'ScreenB'},
            ],
        } as NavigationState;

        expect(findParentNavigatorKey('route-A', state)).toBe('root-nav');
        expect(findParentNavigatorKey('route-B', state)).toBe('root-nav');
    });

    it('returns the nested navigator key when the route is in a child navigator', () => {
        const state = {
            key: 'root-nav',
            routes: [
                {
                    key: 'split-route',
                    name: 'SplitNavigator',
                    state: {
                        key: 'split-nav',
                        routes: [
                            {key: 'nested-route-1', name: 'NestedScreen1'},
                            {key: 'nested-route-2', name: 'NestedScreen2'},
                        ],
                    },
                },
            ],
        } as NavigationState;

        expect(findParentNavigatorKey('nested-route-1', state)).toBe('split-nav');
        expect(findParentNavigatorKey('nested-route-2', state)).toBe('split-nav');
    });

    it('returns the correct key for deeply nested routes', () => {
        const state = {
            key: 'root-nav',
            routes: [
                {
                    key: 'level-1',
                    name: 'Level1',
                    state: {
                        key: 'level-1-nav',
                        routes: [
                            {
                                key: 'level-2',
                                name: 'Level2',
                                state: {
                                    key: 'level-2-nav',
                                    routes: [{key: 'deep-route', name: 'DeepScreen'}],
                                },
                            },
                        ],
                    },
                },
            ],
        } as NavigationState;

        expect(findParentNavigatorKey('deep-route', state)).toBe('level-2-nav');
        expect(findParentNavigatorKey('level-2', state)).toBe('level-1-nav');
        expect(findParentNavigatorKey('level-1', state)).toBe('root-nav');
    });

    it('returns undefined when the route key is not found', () => {
        const state = {
            key: 'root-nav',
            routes: [{key: 'route-A', name: 'ScreenA'}],
        } as NavigationState;

        expect(findParentNavigatorKey('nonexistent-key', state)).toBeUndefined();
    });

    it('returns undefined when state has no routes', () => {
        const state = {
            key: 'root-nav',
            routes: [],
        } as unknown as NavigationState;

        expect(findParentNavigatorKey('any-key', state)).toBeUndefined();
    });

    it('handles sibling navigators and finds the correct parent', () => {
        const state = {
            key: 'root-nav',
            routes: [
                {
                    key: 'split-A',
                    name: 'SplitA',
                    state: {
                        key: 'split-A-nav',
                        routes: [{key: 'route-in-A', name: 'ScreenInA'}],
                    },
                },
                {
                    key: 'split-B',
                    name: 'SplitB',
                    state: {
                        key: 'split-B-nav',
                        routes: [{key: 'route-in-B', name: 'ScreenInB'}],
                    },
                },
            ],
        } as NavigationState;

        expect(findParentNavigatorKey('route-in-A', state)).toBe('split-A-nav');
        expect(findParentNavigatorKey('route-in-B', state)).toBe('split-B-nav');
    });
});
