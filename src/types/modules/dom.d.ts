type AppleIDSignInOnSuccessEvent = {
    detail: {
        authorization: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            id_token: string;
        };
    };
};

type AppleIDSignInOnFailureEvent = {
    detail: {
        error: string;
    };
};

declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface DocumentEventMap extends GlobalEventHandlersEventMap {
        AppleIDSignInOnSuccess: AppleIDSignInOnSuccessEvent;
        AppleIDSignInOnFailure: AppleIDSignInOnFailureEvent;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Permissions {
        /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Permissions/query) */
        query(permissionDesc: {name: 'geolocation' | 'notifications' | 'persistent-storage' | 'push' | 'screen-wake-lock' | 'xr-spatial-tracking' | 'camera'}): Promise<PermissionStatus>;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface MediaTrackConstraintSet {
        aspectRatio?: ConstrainDouble;
        autoGainControl?: ConstrainBoolean;
        channelCount?: ConstrainULong;
        deviceId?: ConstrainDOMString;
        displaySurface?: ConstrainDOMString;
        echoCancellation?: ConstrainBoolean;
        facingMode?: ConstrainDOMString;
        frameRate?: ConstrainDouble;
        groupId?: ConstrainDOMString;
        height?: ConstrainULong;
        noiseSuppression?: ConstrainBoolean;
        sampleRate?: ConstrainULong;
        sampleSize?: ConstrainULong;
        width?: ConstrainULong;
        zoom?: {ideal: number};
        torch?: boolean;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface MediaTrackSettings {
        aspectRatio?: number;
        autoGainControl?: boolean;
        channelCount?: number;
        deviceId?: string;
        displaySurface?: string;
        echoCancellation?: boolean;
        facingMode?: string;
        frameRate?: number;
        groupId?: string;
        height?: number;
        noiseSuppression?: boolean;
        sampleRate?: number;
        sampleSize?: number;
        width?: number;
        zoom?: number;
    }
}

export type {AppleIDSignInOnFailureEvent, AppleIDSignInOnSuccessEvent};
