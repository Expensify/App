import {Image as ExpoImage} from 'expo-image';
import type {ImageProps as ExpoImageProps, ImageLoadEventData} from 'expo-image';
import {useCallback, useState} from 'react';
import type {BaseImageProps} from './types';

function BaseImage({onLoad, objectPositionTop = false, style, ...props}: ExpoImageProps & BaseImageProps) {
    const [aspectRatio, setAspectRatio] = useState<string | number | null>(null);
    const imageLoadedSuccessfully = useCallback(
        (event: ImageLoadEventData) => {
            if (!onLoad) {
                return;
            }

            // We override `onLoad`, so both web and native have the same signature
            const {width, height} = event.source;
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
        <ExpoImage
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
