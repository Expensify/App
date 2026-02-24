import {Image as ExpoImage} from 'expo-image';
import type {ImageLoadEventData} from 'expo-image';
import React, {useCallback, useContext, useEffect} from 'react';
import type {AttachmentSource} from '@components/Attachments/types';
import getImageRecyclingKey from '@libs/getImageRecyclingKey';
import {AttachmentStateContext} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/AttachmentStateContextProvider';
import type {BaseImageProps} from './types';

function BaseImage({onLoad, source, ...props}: BaseImageProps) {
    const {setAttachmentLoaded, isAttachmentLoaded} = useContext(AttachmentStateContext);
    useEffect(() => {
        if (isAttachmentLoaded?.(source as AttachmentSource)) {
            return;
        }

        setAttachmentLoaded?.(source as AttachmentSource, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            source={source}
            recyclingKey={getImageRecyclingKey(source)}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default BaseImage;
