import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';

const GRADIENT_ID = 'flatNavRowActionFade';

/** Where the fade reaches the bar's own background, leaving the rest solid behind the control itself. */
const FADE_END_OFFSET = '0.6';

/**
 * Sits behind a row's hover control. A marquee label scrolls underneath it, so a hard edge would chop the text
 * off mid-letter; fading to the bar's background lets the label disappear into it instead.
 */
function FlatNavRowActionBackdrop() {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <View
            style={[styles.pAbsolute, styles.l0, styles.r0, styles.t0, styles.b0]}
            pointerEvents="none"
        >
            <Svg
                width="100%"
                height="100%"
            >
                <Defs>
                    <LinearGradient
                        id={GRADIENT_ID}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                    >
                        <Stop
                            offset="0"
                            stopColor={theme.appBG}
                            stopOpacity={0}
                        />
                        <Stop
                            offset={FADE_END_OFFSET}
                            stopColor={theme.appBG}
                            stopOpacity={1}
                        />
                        <Stop
                            offset="1"
                            stopColor={theme.appBG}
                            stopOpacity={1}
                        />
                    </LinearGradient>
                </Defs>
                <Rect
                    width="100%"
                    height="100%"
                    fill={`url(#${GRADIENT_ID})`}
                />
            </Svg>
        </View>
    );
}

export default FlatNavRowActionBackdrop;
