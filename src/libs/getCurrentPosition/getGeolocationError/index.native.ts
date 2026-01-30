import type {GeolocationErrorCodeType} from '@libs/getCurrentPosition/getCurrentPosition.types';
import {GeolocationErrorCode} from '@libs/getCurrentPosition/getCurrentPosition.types';

function getGeolocationError(error: unknown): {code: GeolocationErrorCodeType; message: string} {
    let message = 'Geolocation call failed';

    if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }

    return {code: GeolocationErrorCode.POSITION_UNAVAILABLE, message};
}

export default getGeolocationError;
