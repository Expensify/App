import ImageSVG from '@components/ImageSVG';

import type {ImageContentFit} from 'expo-image';

import React from 'react';
import {View} from 'react-native';

import type {CommonIconProps} from './types';

type BaseIconComponentProps = CommonIconProps & {
    /** Test identifier for end-to-end tests. */
    testID?: string;

    /** When set, exposes the icon to assistive tech with this label. */
    accessibilityLabel?: string;

    /** Rendered width of the SVG content. */
    iconWidth?: number | `${number}%` | 'auto';

    /** Rendered height of the SVG content. */
    iconHeight?: number | `${number}%` | 'auto';

    /** Fill color passed to the SVG. */
    fill?: string;

    /** Whether the icon is in a hovered state. */
    isHovered?: boolean;

    /** Whether the icon is in a pressed state. */
    isPressed?: boolean;

    /** How the SVG content should fit its container. */
    contentFit?: ImageContentFit;
};

/** Renders a standard icon with optional accessibility support. */
function BaseIcon({testID, accessibilityLabel, additionalStyles, src, iconWidth, iconHeight, fill, isHovered, isPressed, contentFit}: BaseIconComponentProps) {
    const hasLabel = !!accessibilityLabel;

    return (
        <View
            testID={testID}
            style={additionalStyles}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={hasLabel ? 'image' : undefined}
            accessibilityElementsHidden={!hasLabel}
            importantForAccessibility={hasLabel ? 'yes' : 'no-hide-descendants'}
            accessible={hasLabel}
            pointerEvents="none"
        >
            <ImageSVG
                src={src}
                width={iconWidth}
                height={iconHeight}
                fill={fill}
                hovered={isHovered}
                pressed={isPressed}
                contentFit={contentFit}
                pointerEvents="none"
            />
        </View>
    );
}

export default BaseIcon;
