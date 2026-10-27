import {act, renderHook} from '@testing-library/react-native';

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

/** Matches the hook's window: a return to the app sooner than this after a refresh is skipped. */
const APP_RETURN_REFRESH_INTERVAL_MS = 60 * 1000;

/** Reports one more return to the app and re-renders so the hook sees it. */
function returnToApp(rerender: (props: {refreshKey: string}) => void, refreshKey: string) {
    appReturnCount++;
    rerender({refreshKey});
}

/** Moves the clock past the window, so the next return to the app counts. */
function waitPastReturnWindow() {
    jest.setSystemTime(Date.now() + APP_RETURN_REFRESH_INTERVAL_MS);
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
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
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
        // Given a visible screen that refreshed more than a minute ago
        const {refresh, rerender} = renderRefresh();
        expect(refresh).toHaveBeenCalledTimes(1);
        waitPastReturnWindow();

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
        // Given an RHP covering a screen that refreshed more than a minute ago
        const {refresh, rerender} = renderRefresh();
        mockedUseIsFocused.mockReturnValue(false);
        rerender({refreshKey: 'key-1'});
        waitPastReturnWindow();

        // When the user leaves the app and comes back while the RHP is still open, then closes it
        returnToApp(rerender, 'key-1');
        expect(refresh).toHaveBeenCalledTimes(1);
        mockedUseIsFocused.mockReturnValue(true);
        rerender({refreshKey: 'key-1'});

        // Then the refresh lands once, after the screen is visible
        expect(refresh).toHaveBeenCalledTimes(2);
    });

    it('skips a return to the app soon after the last refresh', () => {
        // Given a visible screen that has just refreshed
        const {refresh, rerender} = renderRefresh();
        expect(refresh).toHaveBeenCalledTimes(1);

        // When the user flicks to another browser tab and back a few times within the minute
        returnToApp(rerender, 'key-1');
        returnToApp(rerender, 'key-1');
        returnToApp(rerender, 'key-1');

        // Then none of those returns refetch, since the data was read moments ago
        expect(refresh).toHaveBeenCalledTimes(1);
    });

    it('still refreshes a data change right after a skipped return', () => {
        // Given a return to the app that was skipped because the screen had just refreshed
        const {refresh, rerender} = renderRefresh();
        returnToApp(rerender, 'key-1');
        expect(refresh).toHaveBeenCalledTimes(1);

        // When the data the screen watches changes
        rerender({refreshKey: 'key-2'});

        // Then that change refreshes at once, because only returns to the app are throttled
        expect(refresh).toHaveBeenCalledTimes(2);
    });
    it('refreshes a skipped return once the window ends', () => {
        // Given a return to the app that was skipped because the screen had just refreshed
        const {refresh, rerender} = renderRefresh();
        returnToApp(rerender, 'key-1');
        expect(refresh).toHaveBeenCalledTimes(1);

        // When the user stays on the screen until the window ends
        act(() => {
            jest.advanceTimersByTime(APP_RETURN_REFRESH_INTERVAL_MS);
        });

        // Then the skipped return refreshes once, so an expense made while away still shows up
        expect(refresh).toHaveBeenCalledTimes(2);
    });

    it('drops a skipped return when another refresh lands first', () => {
        // Given a skipped return to the app
        const {refresh, rerender} = renderRefresh();
        returnToApp(rerender, 'key-1');

        // When a data change refreshes the screen before the window ends
        rerender({refreshKey: 'key-2'});
        act(() => {
            jest.advanceTimersByTime(APP_RETURN_REFRESH_INTERVAL_MS);
        });

        // Then the window ending adds no second refresh, since the data was just read
        expect(refresh).toHaveBeenCalledTimes(2);
    });

    it('refreshes a return to the app after the device clock moved back', () => {
        // Given a screen that has refreshed
        const {refresh, rerender} = renderRefresh();

        // When the device clock moves back and the user returns to the app
        jest.setSystemTime(Date.now() - APP_RETURN_REFRESH_INTERVAL_MS);
        returnToApp(rerender, 'key-1');

        // Then the return refreshes, rather than waiting for the clock to catch up
        expect(refresh).toHaveBeenCalledTimes(2);
    });
});
