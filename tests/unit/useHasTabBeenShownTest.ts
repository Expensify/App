import {renderHook} from '@testing-library/react-native';

import useHasTabBeenShown from '@hooks/useHasTabBeenShown';
import useRootNavigationState from '@hooks/useRootNavigationState';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';

jest.mock('@hooks/useRootNavigationState', () => jest.fn());

function buildRootState(selectedTabIndex: number): NavigationState {
    const routeNames = [SCREENS.HOME, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR];
    const tabState: NavigationState = {stale: false, type: 'tab', key: 'tab', index: selectedTabIndex, routeNames, routes: routeNames.map((name) => ({key: name, name}))};
    return {stale: false, type: 'stack', key: 'root', index: 0, routeNames: [NAVIGATORS.TAB_NAVIGATOR], routes: [{key: 'tabs', name: NAVIGATORS.TAB_NAVIGATOR, state: tabState}]};
}

describe('useHasTabBeenShown', () => {
    it('stays false for a background tab and true once the tab has been selected', () => {
        // Given native tabs that mounted Spend at startup while Home is selected
        let rootState = buildRootState(0);
        jest.mocked(useRootNavigationState).mockImplementation((selector) => selector(rootState));
        const {result, rerender} = renderHook(() => useHasTabBeenShown(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR));
        const wasShownInBackground = result.current;

        // When the user selects Spend and then goes back to Home
        rootState = buildRootState(1);
        rerender({});
        rootState = buildRootState(0);
        rerender({});

        // Then Spend held back its mount work in the background and keeps it running after the user leaves it
        expect(wasShownInBackground).toBe(false);
        expect(result.current).toBe(true);
    });
});
