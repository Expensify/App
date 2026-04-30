import React from 'react';
import {isMobile} from '@libs/Browser';
import CameraCapture from './CameraCapture';
import FileUpload from './FileUpload';
import type {CameraProps} from './types';

/**
 * Camera — web entry point.
 * On mobile browsers renders a camera viewfinder (CameraCapture).
 * On desktop browsers renders a drag-and-drop / file-picker upload area (FileUpload).
 */
function Camera(props: CameraProps) {
    if (isMobile()) {
        return (
            <CameraCapture
                // Props are forwarded as-is to the platform-specific Camera variant
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        );
    }

    return (
        <FileUpload
            // Props are forwarded as-is to the platform-specific Camera variant
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

Camera.displayName = 'Camera';

export default Camera;
export type {CameraProps};
