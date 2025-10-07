import {Image as ExpoImage} from 'expo-image';
import type {ImageLoadEventData} from 'expo-image';
import {useCallback, useContext, useEffect, useRef} from 'react';
import type {AttachmentSource} from '@components/Attachments/types';
import {AttachmentStateContext} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/AttachmentStateContextProvider';
import type {BaseImageProps} from './types';

function BaseImage({onLoad, source, ...props}: BaseImageProps) {
    const isLoadedRef = useRef(false);
    const attachmentContext = useContext(AttachmentStateContext);
    const {setAttachmentLoaded} = attachmentContext || {};

    useEffect(() => {
        setAttachmentLoaded(source as AttachmentSource, false);
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
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

BaseImage.displayName = 'BaseImage';

export default BaseImage;
