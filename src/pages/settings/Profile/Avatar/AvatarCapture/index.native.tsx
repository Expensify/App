import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import ViewShot from 'react-native-view-shot';
import type {AvatarCaptureHandle, AvatarCaptureProps} from './types';

/**
 * Native implementation of AvatarCapture using react-native-view-shot
 */
function AvatarCapture({children, name}: AvatarCaptureProps, ref: React.ForwardedRef<AvatarCaptureHandle>) {
    const viewShotRef = useRef<ViewShot>(null);

    useImperativeHandle(
        ref,
        () => ({
            capture: async () => {
                const uri = await viewShotRef.current?.capture?.();
                if (!uri) {
                    throw new Error('ViewShot ref not available');
                }

                return {
                    uri,
                    name: `${name}.png`,
                    type: 'image/png',
                } as File;
            },
        }),
        [name],
    );

    return (
        <ViewShot
            ref={viewShotRef}
            options={{fileName: 'avatar', format: 'png'}}
        >
            {children}
        </ViewShot>
    );
}

const AvatarCaptureWithRef = forwardRef(AvatarCapture);

export default AvatarCaptureWithRef;
