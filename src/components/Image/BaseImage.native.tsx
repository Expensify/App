import type {AttachmentSource} from '@components/Attachments/types';

import useCachedImageSource from '@hooks/useCachedImageSource';

import getImageRecyclingKey from '@libs/getImageRecyclingKey';

import {AttachmentStateContext} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/AttachmentStateContextProvider';

import type {ImageProps as ExpoImageProps, ImageLoadEventData} from 'expo-image';

import {Image as ExpoImage} from 'expo-image';
import {useCallback, useContext, useEffect, useRef} from 'react';

import type {BaseImageProps} from './types';

function BaseImage({onLoad, source, style, ...props}: BaseImageProps) {
    const isLoadedRef = useRef(false);
    const attachmentContext = useContext(AttachmentStateContext);
    const cachedSource = useCachedImageSource(typeof source === 'object' && !Array.isArray(source) ? source : undefined);
    const resolvedSource = cachedSource !== undefined ? cachedSource : source;
    const {setAttachmentLoaded, isAttachmentLoaded} = attachmentContext || {};

    useEffect(() => {
        if (isAttachmentLoaded?.(source as AttachmentSource)) {
            return;
        }
        setAttachmentLoaded(source as AttachmentSource, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reset isLoadedRef when source changes to allow onLoad to fire again for new images (e.g., after rotation)
    useEffect(() => {
        isLoadedRef.current = false;
    }, [source]);

    const imageLoadedSuccessfully = useCallback(
        (event: ImageLoadEventData) => {
            setAttachmentLoaded(source as AttachmentSource, true);
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
        [onLoad, setAttachmentLoaded, source],
    );

    return (
        <ExpoImage
            // Only subscribe to onLoad when a handler is provided to avoid unnecessary event registrations, optimizing performance.
            onLoad={onLoad ? imageLoadedSuccessfully : undefined}
            source={resolvedSource}
            recyclingKey={getImageRecyclingKey(source)}
            style={style as ExpoImageProps['style']}
            {...props}
        />
    );
}

export default BaseImage;
