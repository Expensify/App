import {Image as ExpoImage} from 'expo-image';
import type {ImageLoadEventData} from 'expo-image';
import {useCallback} from 'react';
import type {BaseImageProps} from './types';

function BaseImage({onLoad, ...props}: BaseImageProps) {
    const imageLoadedSuccessfully = useCallback(
        (event: ImageLoadEventData) => {
            if (!onLoad) {
                return;
            }

            // We override `onLoad`, so both web and native have the same signature
            const {width, height} = event.source;
            onLoad({nativeEvent: {width, height}});
        },
        [onLoad],
    );

    return (
        <ExpoImage
            // Only subscribe to onLoad when a handler is provided to avoid unnecessary event registrations, optimizing performance.
            onLoad={onLoad ? imageLoadedSuccessfully : undefined}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

BaseImage.displayName = 'BaseImage';

export default BaseImage;
