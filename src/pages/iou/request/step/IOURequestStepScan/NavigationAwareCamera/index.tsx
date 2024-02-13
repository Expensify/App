import React, {forwardRef, useEffect, useRef} from 'react';
import type {Ref} from 'react';
import {View} from 'react-native';
import Webcam from 'react-webcam';
import useTabNavigatorFocus from '@hooks/useTabNavigatorFocus';

type NavigationAwareCameraProps = {
    torchOn: boolean;
    onTorchAvailability?: (torchAvailable: boolean) => void;
    cameraTabIndex: number;
    onUserMedia?: (stream: MediaStream) => void;
};

// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
const NavigationAwareCamera = forwardRef(({torchOn, onTorchAvailability, cameraTabIndex, ...props}: NavigationAwareCameraProps, ref: Ref<Webcam>) => {
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
});

export default NavigationAwareCamera;
