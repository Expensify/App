import React from 'react';
import Lightbox from '@components/Lightbox';
import {DEFAULT_ZOOM_RANGE} from '@components/MultiGestureCanvas';
import type ImageViewProps from './types';

function ImageView({isAuthTokenRequired = false, url, style, zoomRange = DEFAULT_ZOOM_RANGE, onError, onLoad}: ImageViewProps) {
    return (
        <Lightbox
            uri={url}
            zoomRange={zoomRange}
            isAuthTokenRequired={isAuthTokenRequired}
            onError={onError}
            onLoad={onLoad}
            style={style}
        />
    );
}

ImageView.displayName = 'ImageView';

export default ImageView;
