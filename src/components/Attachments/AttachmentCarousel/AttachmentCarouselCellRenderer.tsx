import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {PixelRatio, View} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

type AttachmentCarouselCellRendererProps = {
    /** Cell Container styles */
    style?: StyleProp<ViewStyle>;
};

function AttachmentCarouselCellRenderer(props: AttachmentCarouselCellRendererProps) {
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const modalStyles = styles.centeredModalStyles(shouldUseNarrowLayout, true);
    const style = [props.style, styles.h100, {width: PixelRatio.roundToNearestPixel(windowWidth - (modalStyles.marginHorizontal + modalStyles.borderWidth) * 2)}];

    return (
        <View
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            style={style}
        />
    );
}

AttachmentCarouselCellRenderer.displayName = 'AttachmentCarouselCellRenderer';

export default React.memo(AttachmentCarouselCellRenderer);
