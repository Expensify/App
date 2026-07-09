import ImageSVG from '@components/ImageSVG';

import useThemeStyles from '@hooks/useThemeStyles';

import type IconAsset from '@src/types/utils/IconAsset';
import type {Dimensions} from '@src/types/utils/Layout';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import IconWrapperStyles from './IconWrapperStyles';

/** Shared props for primitives that also receive a measured or layout content size. */
type InlineIconProps = {
    /** Icon asset to render. */
    src: IconAsset;

    /** Size for inline icons. */
    contentSize: Dimensions;

    /** Test identifier for end-to-end tests. */
    testID?: string;

    /** Additional styles applied to the icon wrapper. */
    additionalStyles?: StyleProp<ViewStyle>;

    /** Fill color passed to the SVG. */
    fill?: string;
};

/** Renders an icon positioned inline within surrounding text. */
function InlineIcon({testID = 'inline-icon', additionalStyles, src, contentSize, fill}: InlineIconProps) {
    const styles = useThemeStyles();
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
