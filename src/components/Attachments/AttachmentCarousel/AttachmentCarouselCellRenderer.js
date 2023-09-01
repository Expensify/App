import React from 'react';
import {View, PixelRatio} from 'react-native';
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import styles from '../../../styles/styles';

function AttachmentCarouselCellRenderer(props) {
    const {windowWidth, isSmallScreenWidth} = useWindowDimensions();
    const modalStyles = styles.centeredModalStyles(isSmallScreenWidth, true);
    // eslint-disable-next-line react/prop-types
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
