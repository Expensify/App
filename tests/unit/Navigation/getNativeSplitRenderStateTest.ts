import getNativeSplitRenderState from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/getNativeSplitRenderState';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';

import type {ParamListBase} from '@react-navigation/native';

const state: PlatformStackNavigationState<ParamListBase> = {
    stale: false,
    type: 'stack',
    key: 'split-stack',
    routeNames: ['Inbox', 'Report'],
    routes: [
        {key: 'inbox-key', name: 'Inbox'},
        {key: 'report-one-key', name: 'Report', params: {reportID: '1'}},
        {key: 'report-two-key', name: 'Report', params: {reportID: '2'}},
    ],
    index: 1,
    preloadedRoutes: [
        {key: 'preloaded-inbox-key', name: 'Inbox'},
        {key: 'preloaded-report-key', name: 'Report', params: {reportID: '3'}},
    ],
};

describe('getNativeSplitRenderState', () => {
    it('derives central state without changing canonical route keys or focus', () => {
        const result = getNativeSplitRenderState(state, 'Inbox');

        expect(result?.sidebarRoute.key).toBe('inbox-key');
        expect(result?.centralState.routes.map((route) => route.key)).toEqual(['report-one-key', 'report-two-key']);
        expect(result?.centralState.index).toBe(0);
        expect(result?.centralState.preloadedRoutes.map((route) => route.key)).toEqual(['preloaded-report-key']);
        expect(state.routes.map((route) => route.key)).toEqual(['inbox-key', 'report-one-key', 'report-two-key']);
    });

    it('does not create a split without both regions', () => {
        expect(getNativeSplitRenderState({...state, routes: state.routes.slice(1)}, 'Inbox')).toBeUndefined();
        expect(getNativeSplitRenderState({...state, routes: state.routes.slice(0, 1)}, 'Inbox')).toBeUndefined();
    });
});
