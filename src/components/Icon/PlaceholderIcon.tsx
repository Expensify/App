import React from 'react';
import type {SvgProps} from 'react-native-svg';
import Svg from 'react-native-svg';

/**
 * Empty placeholder icon that maintains dimensions without showing any visible content.
 * Used during lazy loading to prevent layout shifting while keeping clean appearance.
 */
function PlaceholderIcon({width = 24, height = 24, fill, style, testID}: SvgProps) {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill={fill}
            style={style}
            testID={testID}
        >
            {/* Completely empty - no visible content, just maintains dimensions */}
        </Svg>
    );
}

export default PlaceholderIcon;
