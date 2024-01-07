import PropTypes from 'prop-types';
import React from 'react';
import Lightbox from '@components/Lightbox';
import {zoomRangeDefaultProps, zoomRangePropTypes} from '@components/MultiGestureCanvas/propTypes';
import {imageViewDefaultProps, imageViewPropTypes} from './propTypes';

/**
 * On the native layer, we use a image library to handle zoom functionality
 */
const propTypes = {
    ...imageViewPropTypes,
    ...zoomRangePropTypes,

    /** Additional styles to add to the component */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
};

const defaultProps = {
    ...imageViewDefaultProps,
    ...zoomRangeDefaultProps,

    onPress: () => {},
    style: {},
};

function ImageView({isAuthTokenRequired, url, onScaleChanged, style, zoomRange, onError}) {
    return (
        <Lightbox
            source={url}
            zoomRange={zoomRange}
            isAuthTokenRequired={isAuthTokenRequired}
            onScaleChanged={onScaleChanged}
            onError={onError}
            style={style}
        />
    );
}

ImageView.propTypes = propTypes;
ImageView.defaultProps = defaultProps;
ImageView.displayName = 'ImageView';

export default ImageView;
