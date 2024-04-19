import React, {useCallback} from 'react';
import {Image as RNImage} from 'react-native';
import type {ImageLoadEventData} from 'react-native';
import type {BaseImageProps} from './types';

function BaseImage({onLoad, ...props}: BaseImageProps) {
    const imageLoadedSuccessfully = useCallback(
        (event: {nativeEvent: ImageLoadEventData}) => {
            if (!onLoad) {
                return;
            }

            // We override `onLoad`, so both web and native have the same signature
            const {width, height} = event.nativeEvent.source;
            onLoad({nativeEvent: {width, height}});
        },
        [onLoad],
    );

    return (
        <RNImage
            // Only subscribe to onLoad when a handler is provided to avoid unnecessary event registrations, optimizing performance.
            onLoad={onLoad ? imageLoadedSuccessfully : undefined}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

BaseImage.displayName = 'BaseImage';

export default BaseImage;
