import React, {useEffect, useRef} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import Webcam from 'react-webcam';
import useTabNavigatorFocus from '@hooks/useTabNavigatorFocus';
import type {NavigationAwareCameraProps} from './types';



// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
function NavigationAwareCamera({torchOn, onTorchAvailability, cameraTabIndex, ...props}: NavigationAwareCameraProps, ref: ForwardedRef<Webcam>) {
    const trackRef = useRef<MediaStreamTrack | null>(null);
    const shouldShowCamera = useTabNavigatorFocus({
        tabIndex: cameraTabIndex,
    });

    const handleOnUserMedia = (stream: MediaStream) => {
        if (props.onUserMedia) {
            props.onUserMedia(stream);
        }

        const [track] = stream.getVideoTracks();
        const capabilities = track.getCapabilities();
        if (capabilities.torch) {
            trackRef.current = track;
        }
        if (onTorchAvailability) {
            onTorchAvailability(!!capabilities.torch);
        }
    };

    useEffect(() => {
        if (!trackRef.current) {
            return;
        }

        trackRef.current.applyConstraints({
            advanced: [{torch: torchOn}],
        });
    }, [torchOn]);

    if (!shouldShowCamera) {
        return null;
    }
    return (
        <View>
            <Webcam
                audio={false}
                screenshotFormat="image/png"
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={ref}
                onUserMedia={handleOnUserMedia}
            />
        </View>
    );
}

NavigationAwareCamera.displayName = 'NavigationAwareCamera';

export default React.forwardRef(NavigationAwareCamera)
