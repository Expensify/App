import {useIsFocused} from '@react-navigation/native';
import React, {useLayoutEffect, useState} from 'react';
import {Freeze} from 'react-freeze';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

/**
 * Pauses renders of Skia chart widgets when the Home tab is not focused.
 *
 * Why Freeze instead of returning null: Skia surfaces have a non-trivial reinit cost.
 * Keeping them mounted but frozen avoids that cost when the user returns to Home.
 *
 * Why not rely solely on freezeOnBlur from TabNavigator: the native screen freeze
 * takes effect after the JS navigation commit, so Onyx updates during that window
 * can trigger spurious re-renders (measured at ~11.7ms on iOS DEV, May 26 baseline).
 * useIsFocused fires at the JS level and catches this window earlier.
 */
function HomeTabFocusBoundary({children}: ChildrenProps) {
    const isFocused = useIsFocused();
    const [frozen, setFrozen] = useState(false);

    // Decouple the Freeze state update from the render cycle to avoid interrupting
    // React concurrent mode (same pattern as FreezeWrapper/index.tsx).
    useLayoutEffect(() => {
        setFrozen(!isFocused);
    }, [isFocused]);

    return <Freeze freeze={frozen}>{children}</Freeze>;
}

export default HomeTabFocusBoundary;
