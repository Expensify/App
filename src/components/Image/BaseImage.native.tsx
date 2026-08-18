import getImageRecyclingKey from '@libs/getImageRecyclingKey';

import {AttachmentStateContext} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/AttachmentStateContextProvider';

import type {ImageLoadEventData} from 'expo-image';

import {Image as ExpoImage} from 'expo-image';
import {useCallback, useContext, useEffect, useRef} from 'react';

import type {BaseImageProps} from './types';

function BaseImage({onLoad, source, style, ...props}: BaseImageProps) {
    const isLoadedRef = useRef(false);
    const attachmentContext = useContext(AttachmentStateContext);
    const {setAttachmentLoaded, isAttachmentLoaded} = attachmentContext || {};

    useEffect(() => {
        if (source === undefined || isAttachmentLoaded?.(source)) {
            return;
        }
        setAttachmentLoaded(source, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reset isLoadedRef when source changes to allow onLoad to fire again for new images (e.g., after rotation)
    useEffect(() => {
        isLoadedRef.current = false;
    }, [source]);

    const imageLoadedSuccessfully = useCallback(
        (event: ImageLoadEventData) => {
            if (source !== undefined) {
                setAttachmentLoaded(source, true);
            }
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
            source={source}
            recyclingKey={getImageRecyclingKey(source)}
            style={style}
            {...props}
        />
    );
}

export default BaseImage;
