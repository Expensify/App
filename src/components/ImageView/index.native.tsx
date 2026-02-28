import React from 'react';
import Lightbox from '@components/Lightbox';
import {DEFAULT_ZOOM_RANGE} from '@components/MultiGestureCanvas';
import type ImageViewProps from './types';

function ImageView({attachmentID, isAuthTokenRequired = false, url, style, zoomRange = DEFAULT_ZOOM_RANGE, onError}: ImageViewProps) {
    return (
        <Lightbox
            attachmentID={attachmentID}
            uri={url}
            zoomRange={zoomRange}
            isAuthTokenRequired={isAuthTokenRequired}
            onError={onError}
            style={style}
        />
    );
}

export default ImageView;
