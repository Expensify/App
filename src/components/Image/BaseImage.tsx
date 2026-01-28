import React, {useCallback, useContext, useEffect} from 'react';
import {Image as RNImage} from 'react-native';
import type {ImageLoadEvent, ImageSourcePropType} from 'react-native';
import type {AttachmentSource} from '@components/Attachments/types';
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
        (event: ImageLoadEvent) => {
            setAttachmentLoaded?.(source as AttachmentSource, true);
            if (!onLoad) {
                return;
            }

            // We override `onLoad`, so both web and native have the same signature
            const {width, height} = event.nativeEvent.source;
            onLoad({nativeEvent: {width, height}});
        },
        [onLoad, source, setAttachmentLoaded],
    );

    return (
        <RNImage
            // Only subscribe to onLoad when a handler is provided to avoid unnecessary event registrations, optimizing performance.
            onLoad={onLoad ? imageLoadedSuccessfully : undefined}
            source={source as ImageSourcePropType}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default BaseImage;
