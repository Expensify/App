import type {GeolocationErrorCodeType} from '@libs/getCurrentPosition/getCurrentPosition.types';
import {GeolocationErrorCode} from '@libs/getCurrentPosition/getCurrentPosition.types';

function getGeolocationError(error: unknown): {code: GeolocationErrorCodeType; message: string} {
    let message = 'Geolocation call failed';
    let code = GeolocationErrorCode.POSITION_UNAVAILABLE;

    if (error instanceof GeolocationPositionError) {
        code = error.code;
        message = error.message;
    } else if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }

    return {code, message};
}

export default getGeolocationError;
