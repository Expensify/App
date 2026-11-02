import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React from 'react';
import {View} from 'react-native';

/**
 * Keeps a screen's content out of the horizontal safe area, which the app root leaves free for the native tab bar.
 *
 * The insets come from context, so the very first layout is already inset. A native SafeAreaView applies them a frame
 * later, and a scroll view laid out full width in that frame keeps UIKit's inset for its scroll indicator.
 * Margins rather than padding, because an absolute child (like the narrow RHP frame) is sized against the content box
 * but placed against the padding box.
 */
function HorizontalSafeArea({children}: ChildrenProps) {
    const styles = useThemeStyles();
    const {left, right} = useSafeAreaInsets();

    return <View style={[styles.flex1, {marginLeft: left, marginRight: right}]}>{children}</View>;
}

export default HorizontalSafeArea;
