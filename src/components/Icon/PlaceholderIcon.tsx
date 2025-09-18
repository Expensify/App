import React from 'react';
import type {SvgProps} from 'react-native-svg';
import Svg, {Circle} from 'react-native-svg';

function PlaceholderIcon({width = 20, height = 20, fill = '#68748A', ...props}: SvgProps) {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 20 20"
            fill="none"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            <Circle
                cx="10"
                cy="10"
                r="2"
                fill={fill}
                opacity="0.5"
            />
        </Svg>
    );
}

PlaceholderIcon.displayName = 'PlaceholderIcon';

export default PlaceholderIcon;
