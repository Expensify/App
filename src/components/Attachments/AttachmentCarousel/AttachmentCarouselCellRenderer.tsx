import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {PixelRatio, View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

type AttachmentCarouselCellRendererProps = {
    /** Cell Container styles */
    style?: StyleProp<ViewStyle>;
};

function AttachmentCarouselCellRenderer(props: AttachmentCarouselCellRendererProps) {
    const styles = useThemeStyles();
    const {windowWidth, isSmallScreenWidth} = useWindowDimensions();
    const modalStyles = styles.centeredModalStyles(isSmallScreenWidth, true);
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
