import ImageSVG from '@components/ImageSVG';

import useStyleUtils from '@hooks/useStyleUtils';

import variables from '@styles/variables';

import type IconAsset from '@src/types/utils/IconAsset';

import type {ImageContentFit} from 'expo-image';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type IconSize from './types';

type IconProps = {
    /** The asset to render. */
    src: IconAsset | undefined;

    /** Custom width when no preset size is selected. */
    width?: number;

    /** Custom height when no preset size is selected. */
    height?: number;

    /** Fill color for the SVG. */
    fill?: string;

    /** Preset icon size. */
    size?: IconSize;

    /** Whether the icon is hovered. */
    hovered?: boolean;

    /** Whether the icon is pressed. */
    pressed?: boolean;

    /** Additional styles for the icon wrapper. */
    additionalStyles?: StyleProp<ViewStyle>;

    /** Test identifier for end-to-end tests. */
    testID?: string;

    /** How the SVG content should fit its container. */
    contentFit?: ImageContentFit;

    /** Keeps icon sizing consistent when used inside buttons. */
    isButtonIcon?: boolean;

    /** When set, exposes the icon to assistive tech. Leave unset for decorative icons. */
    accessibilityLabel?: string;
};

/** Renders an SVG icon with preset sizes. */
function Icon({
    src,
    width = variables.iconSizeNormal,
    height = variables.iconSizeNormal,
    fill = undefined,
    size,
    additionalStyles = [],
    hovered = false,
    pressed = false,
    testID = '',
    contentFit = 'cover',
    isButtonIcon = false,
    accessibilityLabel,
}: IconProps) {
    const StyleUtils = useStyleUtils();

    if (!src) {
        return null;
    }

    const {width: iconWidth, height: iconHeight} = StyleUtils.getIconWidthAndHeightStyle(size, width, height, isButtonIcon);
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
                hovered={hovered}
                pressed={pressed}
                contentFit={contentFit}
                pointerEvents="none"
            />
        </View>
    );
}

export default Icon;
export type {IconProps};
