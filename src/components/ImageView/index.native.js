/* eslint-disable es/no-optional-chaining */
import PropTypes from 'prop-types';
import React from 'react';
import ImageLightbox from '@components/ImageLightbox';
import {scaleDefaultProps, scalePropTypes} from '@components/ImageLightbox/propTypes';
import {imageViewDefaultProps, imageViewPropTypes} from './propTypes';

/**
 * On the native layer, we use a image library to handle zoom functionality
 */
const propTypes = {
    ...imageViewPropTypes,
    ...scalePropTypes,

    /** Function for handle on press */
    onPress: PropTypes.func,

    /** Additional styles to add to the component */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
};

const defaultProps = {
    ...imageViewDefaultProps,
    ...scaleDefaultProps,

    onPress: () => {},
    style: {},
};

function ImageView({isAuthTokenRequired, url, onScaleChanged, onPress, style, minZoomScale, maxZoomScale}) {
    return (
        <ImageLightbox
            source={url}
            minZoomScale={minZoomScale}
            maxZoomScale={maxZoomScale}
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
