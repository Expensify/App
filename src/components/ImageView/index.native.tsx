import React from 'react';
import Lightbox from '@components/Lightbox';
import {DEFAULT_ZOOM_RANGE} from '@components/MultiGestureCanvas';
import type ImageViewProps from './types';

function ImageView({isAuthTokenRequired = false, url, style, zoomRange = DEFAULT_ZOOM_RANGE, onError}: ImageViewProps) {
    return (
        <Lightbox
            uri={url}
            zoomRange={zoomRange}
            isAuthTokenRequired={isAuthTokenRequired}
            onError={(errorEvent) => {
                console.log('ImageView>onError', errorEvent);
                onError();
            }}
            style={style}
        />
    );
}

ImageView.displayName = 'ImageView';

export default ImageView;
