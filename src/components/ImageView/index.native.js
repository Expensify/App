/* eslint-disable es/no-optional-chaining */
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import AttachmentCarouselPagerContext from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import ImageLightbox from '@components/ImageLightbox';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {imageViewDefaultProps, imageViewPropTypes} from './propTypes';

/**
 * On the native layer, we use a image library to handle zoom functionality
 */
const propTypes = {
    ...imageViewPropTypes,
    /** Function for handle on press */
    onPress: PropTypes.func,

    /** Additional styles to add to the component */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
};

const defaultProps = {
    ...imageViewDefaultProps,
    onPress: () => {},
    style: {},
};

function ImageView({isAuthTokenRequired, url, onScaleChanged, onPress, style}) {
    let {windowWidth: canvasWidth, windowHeight: canvasHeight} = useWindowDimensions();
    const attachmenCarouselPagerContext = useContext(AttachmentCarouselPagerContext);

    if (attachmenCarouselPagerContext != null) {
        canvasWidth = attachmenCarouselPagerContext.canvasWidth;
        canvasHeight = attachmenCarouselPagerContext.canvasHeight;
    }

    return (
        <ImageLightbox
            source={url}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            isAuthTokenRequired={isAuthTokenRequired}
            onScaleChanged={onScaleChanged}
            onPress={onPress}
            style={style}
        />
    );
}

ImageView.propTypes = propTypes;
ImageView.defaultProps = defaultProps;
ImageView.displayName = 'ImageView';

export default ImageView;
