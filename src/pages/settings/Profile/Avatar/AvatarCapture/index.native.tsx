import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import ViewShot from 'react-native-view-shot';
import type {AvatarCaptureHandle, AvatarCaptureProps} from './types';

/**
 * Native implementation of AvatarCapture using react-native-view-shot
 */
function AvatarCapture({children, fileName}: AvatarCaptureProps, ref: React.ForwardedRef<AvatarCaptureHandle>) {
    const viewShotRef = useRef<ViewShot>(null);

    useImperativeHandle(
        ref,
        () => ({
            capture: () => {
                return viewShotRef.current?.capture?.()?.then(
                    (uri) =>
                        ({
                            uri,
                            name: `${fileName}.png`,
                            type: 'image/png',
                        }) as File,
                );
            },
        }),
        [fileName],
    );

    return (
        <ViewShot
            ref={viewShotRef}
            options={{fileName, format: 'png'}}
        >
            {children}
        </ViewShot>
    );
}

const AvatarCaptureWithRef = forwardRef(AvatarCapture);

AvatarCapture.displayName = 'AvatarCapture';

export default AvatarCaptureWithRef;
