import {act, renderHook} from '@testing-library/react-native';

import useIsTabRootRevealing from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useIsTabRootRevealing';

type Props = {isAtTabRoot: boolean; activeTabKey: string | undefined};

function renderRevealing(initialProps: Props) {
    return renderHook(({isAtTabRoot, activeTabKey}: Props) => useIsTabRootRevealing(isAtTabRoot, activeTabKey), {initialProps});
}

describe('useIsTabRootRevealing', () => {
    it('reveals the root of the focused tab while a pushed screen is still in the state', () => {
        // Given a tab whose state points at a screen pushed over its root
        const {result} = renderRevealing({isAtTabRoot: false, activeTabKey: 'inbox'});

        // When the root starts coming back into view, as at the start of the iOS swipe-back gesture
        act(() => result.current[1](true));

        // Then the root counts as revealing, so the tab bar can come back with it
        expect(result.current[0]).toBe(true);
    });

    it('stops revealing when the gesture is cancelled', () => {
        // Given a root that started coming back into view
        const {result} = renderRevealing({isAtTabRoot: false, activeTabKey: 'inbox'});
        act(() => result.current[1](true));

        // When the root starts leaving again, as when the swipe-back gesture is cancelled
        act(() => result.current[1](false));

        // Then the bar follows the state again, which still points at the pushed screen
        expect(result.current[0]).toBe(false);
    });

    it('lets the state take over once the tab is back at its root', () => {
        // Given a root that started coming back into view
        const {result, rerender} = renderRevealing({isAtTabRoot: false, activeTabKey: 'inbox'});
        act(() => result.current[1](true));

        // When the gesture ends and the state reaches the root, and a screen is then pushed again
        rerender({isAtTabRoot: true, activeTabKey: 'inbox'});
        rerender({isAtTabRoot: false, activeTabKey: 'inbox'});

        // Then the earlier reveal does not keep the bar up over the newly pushed screen
        expect(result.current[0]).toBe(false);
    });

    it('does not carry a reveal over to another tab', () => {
        // Given a root of one tab that started coming back into view
        const {result, rerender} = renderRevealing({isAtTabRoot: false, activeTabKey: 'inbox'});
        act(() => result.current[1](true));

        // When another tab with a pushed screen gets focused
        rerender({isAtTabRoot: false, activeTabKey: 'settings'});

        // Then that tab's pushed screen keeps the bar hidden
        expect(result.current[0]).toBe(false);
    });
});
