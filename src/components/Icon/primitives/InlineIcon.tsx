import React from 'react';
import {View} from 'react-native';
import IconWrapperStyles from '@components/Icon/IconWrapperStyles';
import ImageSVG from '@components/ImageSVG';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ContentSizedIconProps} from './types';

/** Renders an icon positioned inline within surrounding text. */
function InlineIcon({testID, additionalStyles, src, contentSize, iconWidth, iconHeight, fill, isHovered, isPressed, contentFit}: ContentSizedIconProps) {
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
