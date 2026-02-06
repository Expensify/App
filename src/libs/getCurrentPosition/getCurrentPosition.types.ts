import type {LocationOptions} from 'expo-location';
import type {ValueOf} from 'type-fest';

type GeolocationSuccessCallback = (position: {
    coords: {
        latitude: number;
        longitude: number;
        altitude: number | null;
        accuracy: number | null;
        altitudeAccuracy: number | null;
        heading: number | null;
        speed: number | null;
    };
    timestamp: number;
}) => void;

type GeolocationErrorCodeType = ValueOf<typeof GeolocationErrorCode> | null;

type GeolocationErrorCallback = (error?: {code: GeolocationErrorCodeType; message: string}) => void;

const GeolocationErrorCode = {
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
    NOT_SUPPORTED: -1,
};

type GetCurrentPosition = (success: GeolocationSuccessCallback, error: GeolocationErrorCallback, options?: LocationOptions) => Promise<void>;

export {GeolocationErrorCode};

export type {GeolocationErrorCallback, GetCurrentPosition, GeolocationErrorCodeType};
