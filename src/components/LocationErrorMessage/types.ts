import type {GeolocationErrorCodeType} from '@libs/getCurrentPosition/getCurrentPosition.types';

type LocationErrorMessageProps = {
    /** A callback that runs when close icon is pressed */
    onClose: () => void;

    /**
     * The location error code from onyx
     * - code -1 = location not supported (web only)
     * - code 1 = location permission is not enabled
     * - code 2 = location is unavailable or there is some connection issue
     * - code 3 = location fetch timeout
     */
    locationErrorCode?: GeolocationErrorCodeType | null;
};

export default LocationErrorMessageProps;
