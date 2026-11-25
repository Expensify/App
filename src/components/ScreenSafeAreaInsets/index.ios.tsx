/**
 * Gives a screen the safe area insets UIKit gives its view, rather than the window's. On a foldable iPhone the vertical
 * bar only reaches the safe area of the screens: with the app in the left half of a split screen, the bar sits on the
 * left edge, where the window has no inset. Modals cover the bar, so they go back to the window's insets.
 */
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {EdgeInsets} from 'react-native-safe-area-context';

import React, {createContext, useContext, useState} from 'react';
// eslint-disable-next-line no-restricted-imports -- The screen's insets replace the window's for everything under it, so they go in the library's own context.
import {SafeAreaInsetsContext, SafeAreaListener} from 'react-native-safe-area-context';

/**
 * The window's insets, kept for the modals of a screen. Every screen of a stack inside a screen shares the outer screen's
 * insets, so only the outermost one, where this is still null, measures them.
 */
const WindowSafeAreaInsetsContext = createContext<EdgeInsets | null>(null);

function isSameInsets(first: EdgeInsets | null, second: EdgeInsets) {
    return first?.top === second.top && first.right === second.right && first.bottom === second.bottom && first.left === second.left;
}

function ScreenSafeAreaInsets({children}: ChildrenProps) {
    const windowInsetsOfOuterScreen = useContext(WindowSafeAreaInsetsContext);
    const windowInsets = useContext(SafeAreaInsetsContext);
    // Starts from the window's insets, so the first layout doesn't wait for the native view to report its own.
    const [screenInsets, setScreenInsets] = useState(windowInsets);

    if (windowInsetsOfOuterScreen) {
        return children;
    }

    return (
        <SafeAreaListener onChange={({insets}) => setScreenInsets((previousInsets) => (isSameInsets(previousInsets, insets) ? previousInsets : insets))}>
            <WindowSafeAreaInsetsContext.Provider value={windowInsets}>
                <SafeAreaInsetsContext.Provider value={screenInsets}>{children}</SafeAreaInsetsContext.Provider>
            </WindowSafeAreaInsetsContext.Provider>
        </SafeAreaListener>
    );
}

/** Gives a modal opened from a screen the window's insets again, as it covers the vertical bar the screen keeps clear of. */
function WindowSafeAreaInsets({children}: ChildrenProps) {
    const windowInsets = useContext(WindowSafeAreaInsetsContext);

    if (!windowInsets) {
        return children;
    }

    return <SafeAreaInsetsContext.Provider value={windowInsets}>{children}</SafeAreaInsetsContext.Provider>;
}

export default ScreenSafeAreaInsets;
export {WindowSafeAreaInsets};
