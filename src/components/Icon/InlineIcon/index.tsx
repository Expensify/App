import type {IconSize} from '@components/Icon/utils/resolveIconSize';
import ImageSVG from '@components/ImageSVG';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import IconWrapperStyles from './IconWrapperStyles';

type InlineIconProps = {
    /** Icon asset to render. */
    src: IconAsset;

    /** Preset size that resolves to square pixel dimensions, matching `Icon`. */
    size: IconSize;

    /** Test identifier for end-to-end tests. */
    testID?: string;

    /** Additional styles applied to the icon wrapper. */
    additionalStyles?: StyleProp<ViewStyle>;

    /** Fill color passed to the SVG. */
    fill?: string;
};

/** Renders an icon positioned inline within surrounding text. */
function InlineIcon({testID = 'inline-icon', additionalStyles, src, size, fill}: InlineIconProps) {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const contentSize = StyleUtils.getIconWidthAndHeightStyle(size, variables.iconSizeNormal, variables.iconSizeNormal, false);
    const viewStyles = [contentSize, styles.bgTransparent, styles.overflowVisible];
    const iconStyles = [contentSize, IconWrapperStyles, styles.pAbsolute, additionalStyles];

    return (
        <View
            testID={testID}
            style={viewStyles}
            pointerEvents="none"
        >
            <View style={iconStyles}>
                <ImageSVG
                    src={src}
                    width={contentSize.width}
                    height={contentSize.height}
                    fill={fill}
                    pointerEvents="none"
                />
            </View>
        </View>
    );
}

export default InlineIcon;
