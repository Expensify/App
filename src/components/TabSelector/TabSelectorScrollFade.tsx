import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';

type TabSelectorScrollFadeProps = {
    /** Which edge of the tab row the fade covers */
    side: 'left' | 'right';
};

/** Fades the tabs out toward an edge so a cut-off tab reads as scrollable */
function TabSelectorScrollFade({side}: TabSelectorScrollFadeProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const gradientID = `tabSelectorScrollFade-${side}`;

    return (
        <View
            pointerEvents="none"
            style={[styles.pAbsolute, styles.t0, styles.b0, side === 'left' ? styles.l0 : styles.r0, StyleUtils.getWidthStyle(variables.tabSelectorScrollFadeWidth)]}
        >
            <Svg
                width="100%"
                height="100%"
            >
                <Defs>
                    <LinearGradient
                        id={gradientID}
                        x1={side === 'left' ? 1 : 0}
                        y1="0"
                        x2={side === 'left' ? 0 : 1}
                        y2="0"
                    >
                        <Stop
                            offset="0"
                            stopColor={theme.appBG}
                            stopOpacity="0"
                        />
                        <Stop
                            offset="1"
                            stopColor={theme.appBG}
                            stopOpacity="1"
                        />
                    </LinearGradient>
                </Defs>
                <Rect
                    width="100%"
                    height="100%"
                    fill={`url(#${gradientID})`}
                />
            </Svg>
        </View>
    );
}

export default TabSelectorScrollFade;
