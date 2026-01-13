import {Image as ExpoImage} from 'expo-image';
import type {ImageLoadEventData} from 'expo-image';
import {useCallback, useContext, useEffect, useRef} from 'react';
import type {AttachmentSource} from '@components/Attachments/types';
import {AttachmentStateContext} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/AttachmentStateContextProvider';
import type {BaseImageProps} from './types';

function BaseImage({onLoad, source, ...props}: BaseImageProps) {
    const isLoadedRef = useRef(false);
    const attachmentContext = useContext(AttachmentStateContext);
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
            source={source}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default BaseImage;
