import CONFIG from '../../CONFIG';
import {GetCurrentPosition, GeolocationErrorCode} from './getCurrentPosition.types';

type GoogleAPIsGeoLocateResponse = {
    location: {
        lat: number;
        lng: number;
    };
    accuracy: number;
};

const BASE_URL = 'https://www.googleapis.com/geolocation/v1/geolocate';

// Api request config
const requestConfig: RequestInit = {
    method: 'POST',
};

const getCurrentPosition: GetCurrentPosition = (
    success,
    error,
    options, // We will ignore options.maximumAge and options.enableHighAccuracy since cant pass it to geolocate api directly
) => {
    // Emulate the timeout param with an abort signal
    let timeoutID: NodeJS.Timeout;
    if (options?.timeout) {
        const abortController = new AbortController();
        timeoutID = setTimeout(() => {
            abortController.abort();
        }, options.timeout);
        requestConfig.signal = abortController.signal;
    }

    // Gets current location from google geolocation api
    fetch(`${BASE_URL}?key=${CONFIG.GOOGLE_GEOLOCATION_API_KEY}`, requestConfig)
        .then((response) => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }

            return response.json();
        })
        .then((response: GoogleAPIsGeoLocateResponse) => {
            // Transform response to match with the window.navigator.geolocation.getCurrentPosition response
            const transformedResponse = {
                coords: {
                    latitude: response.location.lat,
                    longitude: response.location.lng,
                    accuracy: response.accuracy,
                    // Return null for these keys as we don't get them in response when api is directly called
                    altitude: null,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null,
                },
                timestamp: Date.now(), // The api call doesn't return timestamp directly, so we emulate ourselves
            };

            success(transformedResponse);
        })
        .catch((apiError) => {
            // The base error object when api call fails
            const baseErrorObject = {
                // Since we are making a direct api call, we won't get permission denied error code
                PERMISSION_DENIED: GeolocationErrorCode.PERMISSION_DENIED,
                POSITION_UNAVAILABLE: GeolocationErrorCode.POSITION_UNAVAILABLE,
                TIMEOUT: GeolocationErrorCode.TIMEOUT,
                NOT_SUPPORTED: GeolocationErrorCode.NOT_SUPPORTED,
            };

            // Return timeout error on abort
            if (apiError instanceof Error && apiError.message === 'The user aborted a request.') {
                error({
                    ...baseErrorObject,
                    code: GeolocationErrorCode.TIMEOUT,
                    // Adds a generic message for desktop, when timeout occurs
                    message: 'timeout',
                });
                return;
            }

            error({
                ...baseErrorObject,
                code: GeolocationErrorCode.POSITION_UNAVAILABLE,
                // Adding a generic message for desktop, position unavailable can mean 'no internet'
                // or some other position related issues on api call failure (excluding timeout)
                message: 'position unavailable',
            });
        })
        .finally(() => {
            if (!timeoutID) {
                return;
            }

            // Clear any leftover timeouts
            clearTimeout(timeoutID);
        });
};

export default getCurrentPosition;
