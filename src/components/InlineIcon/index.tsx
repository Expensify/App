import ImageSVG from '@components/ImageSVG';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type IconAsset from '@src/types/utils/IconAsset';

import type {ImageContentFit} from 'expo-image';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import IconWrapperStyles from './IconWrapperStyles';

type InlineIconProps = {
    /** The asset to render. */
    src: IconAsset | undefined;

    /** Custom width when no preset size is selected. */
    width?: number;

    /** Custom height when no preset size is selected. */
    height?: number;

    /** Fill color for the SVG. */
    fill?: string;

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
};

/** Renders an icon positioned inline within surrounding text. */
function InlineIcon({
    src,
    width = variables.iconSizeNormal,
    height = variables.iconSizeNormal,
    fill = undefined,
    additionalStyles = [],
    hovered = false,
    pressed = false,
    testID = '',
    contentFit = 'cover',
}: InlineIconProps) {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();

    if (!src) {
        return null;
    }

    const iconStyles = [StyleUtils.getWidthAndHeightStyle(width, height), IconWrapperStyles, styles.pAbsolute, additionalStyles];

    return (
        <View
            testID={testID}
            style={[StyleUtils.getWidthAndHeightStyle(width, height), styles.bgTransparent, styles.overflowVisible]}
            pointerEvents="none"
        >
            <View style={iconStyles}>
                <ImageSVG
                    src={src}
                    width={width}
                    height={height}
                    fill={fill}
                    hovered={hovered}
                    pressed={pressed}
                    contentFit={contentFit}
                    pointerEvents="none"
                />
            </View>
        </View>
    );
}

export default InlineIcon;
