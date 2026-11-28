/** A horizontal fade into the app's background, filling its parent, so content cut off at an edge melts away instead of ending mid-letter. */
import useTheme from '@hooks/useTheme';

import React, {useId} from 'react';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';

type EdgeFadeProps = {
    /** The edge where the fade is fully opaque */
    side: 'left' | 'right';

    /** Where, from the transparent end (0) to the opaque edge (1), the fade turns fully opaque. The rest stays solid. */
    fadeEndOffset?: number;
};

function EdgeFade({side, fadeEndOffset = 1}: EdgeFadeProps) {
    const theme = useTheme();
    const gradientID = useId();

    return (
        <Svg
            width="100%"
            height="100%"
            pointerEvents="none"
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
                        offset={0}
                        stopColor={theme.appBG}
                        stopOpacity={0}
                    />
                    <Stop
                        offset={fadeEndOffset}
                        stopColor={theme.appBG}
                        stopOpacity={1}
                    />
                    <Stop
                        offset={1}
                        stopColor={theme.appBG}
                        stopOpacity={1}
                    />
                </LinearGradient>
            </Defs>
            <Rect
                width="100%"
                height="100%"
                fill={`url(#${gradientID})`}
            />
        </Svg>
    );
}

export default EdgeFade;
