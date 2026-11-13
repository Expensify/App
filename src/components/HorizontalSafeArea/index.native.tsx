import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React, {useContext} from 'react';
import {View} from 'react-native';

import HorizontalSafeAreaContext, {HORIZONTAL_SAFE_AREA_PLACEMENT} from './HorizontalSafeAreaContext';

/**
 * Keeps a screen's content out of the horizontal safe area, which the app root leaves free for the native tab bar.
 * Nested in a screen that already does, it is a no-op, so every screen can wrap itself without insetting twice.
 *
 * The insets come from context, so the very first layout is already inset. A native SafeAreaView applies them a frame
 * later, and a scroll view laid out full width in that frame keeps UIKit's inset for its scroll indicator.
 * Margins rather than padding, because an absolute child (like the narrow RHP frame) is sized against the content box
 * but placed against the padding box. The screen's scroll view still reaches the screen edge through the margins, as
 * nothing clips it (see useHorizontalSafeAreaBleed).
 */
function HorizontalSafeArea({children}: ChildrenProps) {
    const styles = useThemeStyles();
    const {left, right} = useSafeAreaInsets();
    const placement = useContext(HorizontalSafeAreaContext);

    if (placement !== HORIZONTAL_SAFE_AREA_PLACEMENT.OUTSIDE) {
        return children;
    }

    return (
        <HorizontalSafeAreaContext.Provider value={HORIZONTAL_SAFE_AREA_PLACEMENT.SCREEN}>
            <View style={[styles.flex1, {marginLeft: left, marginRight: right}]}>{children}</View>
        </HorizontalSafeAreaContext.Provider>
    );
}

export default HorizontalSafeArea;
