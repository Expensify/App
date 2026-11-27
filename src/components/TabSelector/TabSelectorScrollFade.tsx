import EdgeFade from '@components/EdgeFade';
import useHorizontalSafeAreaReach from '@components/HorizontalSafeArea/useHorizontalSafeAreaReach';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

type TabSelectorScrollFadeProps = {
    /** Which edge of the tab row the fade covers */
    side: 'left' | 'right';
};

/** Fades the tabs out toward an edge so a cut-off tab reads as scrollable */
function TabSelectorScrollFade({side}: TabSelectorScrollFadeProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    // The tab row reaches the screen edge through the horizontal safe area, so the fade sits at that edge too.
    const reach = useHorizontalSafeAreaReach();

    return (
        <View
            pointerEvents="none"
            style={[styles.pAbsolute, styles.t0, styles.b0, side === 'left' ? {left: -reach.left} : {right: -reach.right}, StyleUtils.getWidthStyle(variables.tabSelectorScrollFadeWidth)]}
        >
            <EdgeFade side={side} />
        </View>
    );
}

export default TabSelectorScrollFade;
