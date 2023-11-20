import PropTypes from 'prop-types';
import React from 'react';
import {PixelRatio, View} from 'react-native';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useThemeStyles from '@styles/useThemeStyles';

const propTypes = {
    /** Cell Container styles */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
};

const defaultProps = {
    style: [],
};

function AttachmentCarouselCellRenderer(props) {
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

AttachmentCarouselCellRenderer.propTypes = propTypes;
AttachmentCarouselCellRenderer.defaultProps = defaultProps;
AttachmentCarouselCellRenderer.displayName = 'AttachmentCarouselCellRenderer';

export default React.memo(AttachmentCarouselCellRenderer);
