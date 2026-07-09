import type {BaseIconProps} from '@components/Icon/primitives/types';
import ImageSVG from '@components/ImageSVG';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {Dimensions} from '@src/types/utils/Layout';

import React from 'react';
import {View} from 'react-native';

import IconWrapperStyles from './IconWrapperStyles';

/** Shared props for primitives that also receive a measured or layout content size. */
type ContentSizedIcon = {
    /** Layout size for inline icons. */
    contentSize: Dimensions;
};

/** Renders an icon positioned inline within surrounding text. */
function InlineIcon({testID, additionalStyles, src, contentSize, iconWidth, iconHeight, fill, isHovered, isPressed, contentFit}: BaseIconProps & ContentSizedIcon) {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const iconStyles = [StyleUtils.getWidthAndHeightStyle(contentSize.width ?? 0, contentSize.height), IconWrapperStyles, styles.pAbsolute, additionalStyles];

    return (
        <View
            testID={testID}
            style={[StyleUtils.getWidthAndHeightStyle(contentSize.width ?? 0, contentSize.height), styles.bgTransparent, styles.overflowVisible]}
            pointerEvents="none"
        >
            <View style={iconStyles}>
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
        </View>
    );
}

export default InlineIcon;
