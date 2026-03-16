import {Image as ExpoImage} from 'expo-image';
import type {ImageLoadEventData} from 'expo-image';
import React, {useCallback, useContext, useEffect} from 'react';
import type {AttachmentSource} from '@components/Attachments/types';
import useCachedImageSource from '@hooks/useCachedImageSource';
import getImageRecyclingKey from '@libs/getImageRecyclingKey';
import {AttachmentStateContext} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/AttachmentStateContextProvider';
import type {BaseImageProps} from './types';

function BaseImage({onLoad, onLoadStart, source, ...props}: BaseImageProps) {
    const cachedSource = useCachedImageSource(typeof source === 'object' && !Array.isArray(source) ? source : undefined);
    const resolvedSource = cachedSource !== undefined ? cachedSource : source;

    const {setAttachmentLoaded, isAttachmentLoaded} = useContext(AttachmentStateContext);
    useEffect(() => {
        if (isAttachmentLoaded?.(source as AttachmentSource)) {
            return;
        }

        setAttachmentLoaded?.(source as AttachmentSource, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!source) {
            return;
        }
        // expo-image doesn't support onLoadStart on web, so we call it manually when the source changes, matching react-native-web's Image behavior
        onLoadStart?.();
    }, [source, onLoadStart]);

    const imageLoadedSuccessfully = useCallback(
        (event: ImageLoadEventData) => {
            setAttachmentLoaded?.(source as AttachmentSource, true);
            if (!onLoad) {
                return;
            }

            // We override `onLoad`, so both web and native have the same signature
            const {width, height} = event.source;
            onLoad({nativeEvent: {width, height}});
        },
        [onLoad, source, setAttachmentLoaded],
    );

    return (
        <ExpoImage
            // Only subscribe to onLoad when a handler is provided to avoid unnecessary event registrations, optimizing performance.
            onLoad={onLoad ? imageLoadedSuccessfully : undefined}
            source={resolvedSource}
            recyclingKey={getImageRecyclingKey(source)}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default BaseImage;
