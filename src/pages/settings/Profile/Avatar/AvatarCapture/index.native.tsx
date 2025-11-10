import React, {useImperativeHandle, useRef} from 'react';
import ViewShot from 'react-native-view-shot';
import type {AvatarCaptureProps} from './types';

/**
 * Native implementation of AvatarCapture using react-native-view-shot
 */
function AvatarCapture({children, fileName, ref}: AvatarCaptureProps) {
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


AvatarCapture.displayName = 'AvatarCapture';

export default AvatarCapture;
