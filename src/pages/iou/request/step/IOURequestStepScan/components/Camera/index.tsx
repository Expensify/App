import React, {useEffect} from 'react';
import {isMobile} from '@libs/Browser';
import {cancelSpan, endSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';
import CameraCapture from './CameraCapture';
import FileUpload from './FileUpload';
import type {CameraProps} from './types';

/**
 * Camera — web entry point.
 * On mobile browsers renders a camera viewfinder (CameraCapture).
 * On desktop browsers renders a drag-and-drop / file-picker upload area (FileUpload).
 */
function Camera(props: CameraProps) {
    // End telemetry spans on mount for web (no camera init tracking needed)
    useEffect(() => {
        endSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
        endSpan(CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN_NAVIGATION);
        endSpan(CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN);

        return () => {
            cancelSpan(CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN_NAVIGATION);
            cancelSpan(CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN);
        };
    }, []);
    if (isMobile()) {
        return (
            <CameraCapture
                // Props are forwarded as-is to the platform-specific Camera variant

                {...props}
            />
        );
    }

    return (
        <FileUpload
            // Props are forwarded as-is to the platform-specific Camera variant

            {...props}
        />
    );
}

Camera.displayName = 'Camera';

export default Camera;
