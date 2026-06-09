import React from 'react';
import type {SvgProps} from 'react-native-svg';
import Svg, {Path} from 'react-native-svg';

// Inline SVG of the camera glyph used by the camera FAB. Rendering it inline (rather than via a lazy-loaded asset) lets the
// `fill` come straight from the theme so the icon can use a contrast-compliant color on the green button in high-contrast themes.
function CameraIcon({width, height, fill, style}: SvgProps) {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 20 20"
            fill="none"
            style={style}
        >
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18 4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3l1.063-1.771c.272-.452.76-.729 1.287-.729h5.301a1.5 1.5 0 0 1 1.286.729L15 4zm-8 3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7"
                fill={fill}
            />
        </Svg>
    );
}

CameraIcon.displayName = 'CameraIcon';

export default CameraIcon;
