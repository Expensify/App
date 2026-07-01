import React from 'react';
import {View} from 'react-native';
import ImageSVG from '@components/ImageSVG';
import type {BaseIconProps} from './types';

type BaseIconComponentProps = BaseIconProps & {
    /** When set, exposes the icon to assistive tech with this label. */
    accessibilityLabel?: string;
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
