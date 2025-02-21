import {Image as ExpoImage} from 'expo-image';
import type {ImageLoadEventData} from 'expo-image';
import {useCallback, useEffect, useRef} from 'react';
import type {BaseImageProps} from './types';

function BaseImage({onLoad, ...props}: BaseImageProps) {
    const loadTimeRef = useRef(0);
    const isLoadedRef = useRef(false);

    const imageLoadedSuccessfully = useCallback(
        (event: ImageLoadEventData) => {
            const endTime = Date.now();
            console.debug('[dev] Load time:', endTime - loadTimeRef.current);

            if (!onLoad) {
                return;
            }
            if (isLoadedRef.current === true) {
                return;
            }

            // We override `onLoad`, so both web and native have the same signature
            const {width, height} = event.source;
            isLoadedRef.current = true;
            onLoad({nativeEvent: {width, height}});
        },
        [onLoad],
    );

    useEffect(() => {
        loadTimeRef.current = Date.now();

        return () => {
            loadTimeRef.current = 0;
        };
    }, []);

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
