import {CellContainer} from '@shopify/flash-list';
import PropTypes from 'prop-types';
import React from 'react';
import {PixelRatio} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

const propTypes = {
    /** Cell Container styles */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
    forwardedRef: PropTypes.func,
};

const defaultProps = {
    style: [],
    forwardedRef: () => {},
};

function AttachmentCarouselCellRenderer(props) {
    const styles = useThemeStyles();
    const {windowWidth, isSmallScreenWidth} = useWindowDimensions();
    const modalStyles = styles.centeredModalStyles(isSmallScreenWidth, true);
    const style = [props.style, styles.h100, {width: PixelRatio.roundToNearestPixel(windowWidth - (modalStyles.marginHorizontal + modalStyles.borderWidth) * 2)}];

    return (
        <CellContainer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={props.forwardedRef}
            style={style}
        />
    );
}

AttachmentCarouselCellRenderer.propTypes = propTypes;
AttachmentCarouselCellRenderer.defaultProps = defaultProps;
AttachmentCarouselCellRenderer.displayName = 'AttachmentCarouselCellRenderer';

export default React.memo(
    React.forwardRef((props, ref) => (
        <AttachmentCarouselCellRenderer
            {...props}
            forwardedRef={ref}
        />
    )),
);
