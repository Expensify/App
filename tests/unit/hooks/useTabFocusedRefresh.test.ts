import {renderHook} from '@testing-library/react-native';

import useAppReturnCount from '@hooks/useAppReturnCount';
import useIsTabFocused from '@hooks/useIsTabFocused';
import useTabFocusedRefresh from '@hooks/useTabFocusedRefresh';

import SCREENS from '@src/SCREENS';

import {useIsFocused} from '@react-navigation/native';

jest.mock('@hooks/useIsTabFocused', () => ({
    __esModule: true,
    default: jest.fn(() => true),
}));

jest.mock('@react-navigation/native', () => ({
    useIsFocused: jest.fn(() => true),
}));

jest.mock('@hooks/useAppReturnCount', () => ({
    __esModule: true,
    default: jest.fn(() => 0),
}));

const mockedUseIsTabFocused = jest.mocked(useIsTabFocused);
const mockedUseIsFocused = jest.mocked(useIsFocused);
const mockedUseAppReturnCount = jest.mocked(useAppReturnCount);

let appReturnCount = 0;

/** Reports one more return to the app and re-renders so the hook sees it. */
function returnToApp(rerender: (props: {refreshKey: string}) => void, refreshKey: string) {
    appReturnCount++;
    rerender({refreshKey});
}

/** Renders the hook with a controllable refresh key and returns the refresh spy. */
function renderRefresh(refreshKey = 'key-1') {
    const refresh = jest.fn();
    const {rerender} = renderHook((props: {refreshKey: string}) => useTabFocusedRefresh(SCREENS.HOME, props.refreshKey, refresh), {initialProps: {refreshKey}});
    return {refresh, rerender};
}

describe('useTabFocusedRefresh', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseIsTabFocused.mockReturnValue(true);
        mockedUseIsFocused.mockReturnValue(true);
        appReturnCount = 0;
        mockedUseAppReturnCount.mockImplementation(() => appReturnCount);
    });

    it('refreshes once when the tab is active and the screen is visible', () => {
        // Given the Home tab is active and its screen is visible

        // When the hook mounts
        const {refresh} = renderRefresh();

        // Then it refreshes exactly once
        expect(refresh).toHaveBeenCalledTimes(1);
    });

    it('does not refresh while the tab is inactive', () => {
        // Given another tab is active
        mockedUseIsTabFocused.mockReturnValue(false);
        mockedUseIsFocused.mockReturnValue(false);

        // When the hook mounts
        const {refresh} = renderRefresh();

        // Then nothing is refreshed for a screen the user isn't on
        expect(refresh).not.toHaveBeenCalled();
    });

    it('does not refresh when an RHP opens and closes over the screen', () => {
        // Given the screen has already refreshed once
        const {refresh, rerender} = renderRefresh();
        expect(refresh).toHaveBeenCalledTimes(1);

        // When an RHP is pushed on top (the tab stays active, the leaf route does not) and then popped
        mockedUseIsFocused.mockReturnValue(false);
        rerender({refreshKey: 'key-1'});
        mockedUseIsFocused.mockReturnValue(true);
        rerender({refreshKey: 'key-1'});

        // Then the close does not replay the refresh
        expect(refresh).toHaveBeenCalledTimes(1);
    });

    it('holds a change made behind an RHP and refreshes once on close', () => {
        // Given the screen has refreshed once and an RHP is now covering it
        const {refresh, rerender} = renderRefresh();
        mockedUseIsFocused.mockReturnValue(false);
        rerender({refreshKey: 'key-1'});

        // When several changes land behind the RHP and it is then closed
        rerender({refreshKey: 'key-2'});
        rerender({refreshKey: 'key-3'});
        expect(refresh).toHaveBeenCalledTimes(1);
        mockedUseIsFocused.mockReturnValue(true);
        rerender({refreshKey: 'key-3'});

        // Then the whole batch costs a single refresh, fired only once the screen is visible again
        expect(refresh).toHaveBeenCalledTimes(2);
    });

    it('refreshes immediately when the key changes while the screen is visible', () => {
        // Given a visible screen that has refreshed once
        const {refresh, rerender} = renderRefresh();

        // When its inputs change
        rerender({refreshKey: 'key-2'});

        // Then it refreshes again
        expect(refresh).toHaveBeenCalledTimes(2);
    });

    it('refreshes when the user switches tabs away and back', () => {
        // Given the screen has refreshed once
        const {refresh, rerender} = renderRefresh();

        // When the user switches to another tab and returns, with nothing else changed
        mockedUseIsTabFocused.mockReturnValue(false);
        mockedUseIsFocused.mockReturnValue(false);
        rerender({refreshKey: 'key-1'});
        mockedUseIsTabFocused.mockReturnValue(true);
        mockedUseIsFocused.mockReturnValue(true);
        rerender({refreshKey: 'key-1'});

        // Then arriving back on the tab refreshes the data
        expect(refresh).toHaveBeenCalledTimes(2);
    });

    it('holds the arrival refresh when the tab is re-entered behind an RHP', () => {
        // Given the user left the tab
        const {refresh, rerender} = renderRefresh();
        mockedUseIsTabFocused.mockReturnValue(false);
        mockedUseIsFocused.mockReturnValue(false);
        rerender({refreshKey: 'key-1'});

        // When they come back to the tab while an RHP still covers the screen, then close it
        mockedUseIsTabFocused.mockReturnValue(true);
        rerender({refreshKey: 'key-1'});
        expect(refresh).toHaveBeenCalledTimes(1);
        mockedUseIsFocused.mockReturnValue(true);
        rerender({refreshKey: 'key-1'});

        // Then the arrival refresh is not lost, it fires when the screen becomes visible
        expect(refresh).toHaveBeenCalledTimes(2);
    });

    it('refreshes when the user returns to the app', () => {
        // Given a visible screen that has refreshed once
        const {refresh, rerender} = renderRefresh();
        expect(refresh).toHaveBeenCalledTimes(1);

        // When the user comes back to the app, with nothing else changed
        returnToApp(rerender, 'key-1');

        // Then the values the screen cannot derive locally are re-read
        expect(refresh).toHaveBeenCalledTimes(2);
    });

    it('does not refresh on a re-render that reports no return', () => {
        // Given a visible screen that has refreshed once
        const {refresh, rerender} = renderRefresh();

        // When it re-renders with the same key and no new return
        rerender({refreshKey: 'key-1'});

        // Then nothing is refetched
        expect(refresh).toHaveBeenCalledTimes(1);
    });

    it('holds the return refresh until the screen is visible again', () => {
        // Given an RHP covering the screen
        const {refresh, rerender} = renderRefresh();
        mockedUseIsFocused.mockReturnValue(false);
        rerender({refreshKey: 'key-1'});

        // When the user leaves the app and comes back while the RHP is still open, then closes it
        returnToApp(rerender, 'key-1');
        expect(refresh).toHaveBeenCalledTimes(1);
        mockedUseIsFocused.mockReturnValue(true);
        rerender({refreshKey: 'key-1'});

        // Then the refresh lands once, after the screen is visible
        expect(refresh).toHaveBeenCalledTimes(2);
    });
});
