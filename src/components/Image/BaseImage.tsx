import React, {useCallback, useState} from 'react';
import {Image as RNImage} from 'react-native';
import type {ImageLoadEventData, ImageProps as WebImageProps} from 'react-native';
import type {BaseImageProps} from './types';

function BaseImage({onLoad, objectPositionTop = false, style, ...props}: WebImageProps & BaseImageProps) {
    const [aspectRatio, setAspectRatio] = useState<string | number | null>(null);
    const imageLoadedSuccessfully = useCallback(
        (event: {nativeEvent: ImageLoadEventData}) => {
            if (!onLoad) {
                return;
            }

            // We override `onLoad`, so both web and native have the same signature
            const {width, height} = event.nativeEvent.source;
            onLoad({nativeEvent: {width, height}});

            if (objectPositionTop) {
                if (width > height) {
                    setAspectRatio(1);
                    return;
                }
                setAspectRatio(height ? width / height : 'auto');
            }
        },
        [onLoad, objectPositionTop],
    );

    return (
        <RNImage
            // Only subscribe to onLoad when a handler is provided to avoid unnecessary event registrations, optimizing performance.
            onLoad={onLoad ? imageLoadedSuccessfully : undefined}
            style={[style, !!aspectRatio && {aspectRatio, height: 'auto'}, objectPositionTop && !aspectRatio && {opacity: 0}]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

BaseImage.displayName = 'BaseImage';

export default BaseImage;
