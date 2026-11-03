import {act, renderHook} from '@testing-library/react-native';

import type {NavigationState, PartialState} from '@react-navigation/native';

type FakeNavigation = {
    getRootState: () => NavigationState;
    getState: () => NavigationState;
    resetRoot: jest.Mock;
    dispatch: jest.Mock;
    addListener: (type: string, callback: () => void) => () => void;
};

type LinkingOptions = {
    getStateFromPath: (path: string) => PartialState<NavigationState> | undefined;
    getPathFromState: (state: NavigationState) => string;
};

// The web `useLinking` is replaced by `useLinking.native` under Jest, so load the patched web file directly
const {
    useLinking,
}: {
    useLinking: (ref: {current: FakeNavigation}, options: LinkingOptions) => unknown;
} = jest.requireActual('../../../node_modules/@react-navigation/native/lib/module/useLinking.js');

const getStateFromPath = (path: string) => ({routes: [{name: path.slice(1)}]});
const getPathFromState = (state: NavigationState) => `/${state.routes.at(state.index)?.name ?? ''}`;

function createRootState(key: string, routeNames: string[], routes: Array<{key: string; name: string}>): NavigationState {
    return {key, index: routes.length - 1, routeNames, routes, stale: false, type: 'stack'};
}

function renderLinking(initialState: NavigationState) {
    let rootState = initialState;
    const stateListeners: Array<() => void> = [];
    const navigation: FakeNavigation = {
        getRootState: () => rootState,
        getState: () => rootState,
        resetRoot: jest.fn(),
        dispatch: jest.fn(),
        addListener: (type, callback) => {
            if (type === 'state') {
                stateListeners.push(callback);
            }
            return () => {};
        },
    };
    renderHook(() => useLinking({current: navigation}, {getStateFromPath, getPathFromState}));
    const browserState: unknown = window.history.state;
    const firstEntryID = browserState && typeof browserState === 'object' && 'id' in browserState ? browserState.id : undefined;
    const firstEntry = {id: firstEntryID, path: window.location.pathname};

    const setRootState = async (state: NavigationState) => {
        rootState = state;
        await act(async () => {
            for (const listener of stateListeners) {
                listener();
            }
        });
    };

    // Browser back to the first entry. The memory history finds its entry by the id in the browser state, so set it the way a real traversal would
    const pressBrowserBackToFirstEntry = async () => {
        window.history.replaceState({id: firstEntry.id}, '', firstEntry.path);
        await act(async () => {
            window.dispatchEvent(new PopStateEvent('popstate'));
        });
    };

    return {navigation, setRootState, pressBrowserBackToFirstEntry};
}

describe('useLinking', () => {
    beforeEach(() => {
        window.history.replaceState(null, '', '/');
    });

    it('builds the state from the URL on browser back when the saved state has different root screens', async () => {
        // Given an account whose root navigator has an onboarding screen, that opens Home and then Account
        const sessionARouteNames = ['Home', 'Account', 'Onboarding'];
        const {navigation, setRootState, pressBrowserBackToFirstEntry} = renderLinking(createRootState('root-a', sessionARouteNames, [{key: 'home-a', name: 'Home'}]));
        await setRootState(
            createRootState('root-a', sessionARouteNames, [
                {key: 'home-a', name: 'Home'},
                {key: 'account-a', name: 'Account'},
            ]),
        );

        // When navigation is reset for another account whose root navigator has no onboarding screen (e.g. a copilot switch), and the user presses browser back
        await setRootState(createRootState('root-b', ['Home', 'Account'], [{key: 'account-b', name: 'Account'}]));
        await pressBrowserBackToFirstEntry();

        // Then the saved state, which the router would reject, is skipped and the screen is built from the URL instead
        expect(navigation.resetRoot).toHaveBeenCalledTimes(1);
        expect(navigation.resetRoot).toHaveBeenCalledWith({routes: [{name: 'Home'}]});
    });

    it('restores the saved state on browser back when the root screens are unchanged', async () => {
        // Given a root navigator that opens Home and then Account
        const routeNames = ['Home', 'Account'];
        const {navigation, setRootState, pressBrowserBackToFirstEntry} = renderLinking(createRootState('root-a', routeNames, [{key: 'home-a', name: 'Home'}]));
        const homeState = navigation.getRootState();
        await setRootState(
            createRootState('root-a', routeNames, [
                {key: 'home-a', name: 'Home'},
                {key: 'account-a', name: 'Account'},
            ]),
        );

        // When the root navigator is replaced with the same screens, and the user presses browser back
        await setRootState(createRootState('root-b', routeNames, [{key: 'account-b', name: 'Account'}]));
        await pressBrowserBackToFirstEntry();

        // Then the saved state is restored as before, because the router accepts it
        expect(navigation.resetRoot).toHaveBeenCalledTimes(1);
        expect(navigation.resetRoot).toHaveBeenCalledWith(homeState);
    });
});
