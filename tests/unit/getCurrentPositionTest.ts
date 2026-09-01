import getCurrentPosition from '@libs/getCurrentPosition';
import {GeolocationErrorCode} from '@libs/getCurrentPosition/getCurrentPosition.types';

import CONST from '@src/CONST';

import {getCurrentPositionAsync, getLastKnownPositionAsync, PermissionStatus, requestForegroundPermissionsAsync} from 'expo-location';

const POSITION = {
    coords: {latitude: 51.5, longitude: -0.12, altitude: null, accuracy: 20, altitudeAccuracy: null, heading: null, speed: null},
    timestamp: 1_700_000_000_000,
};

describe('getCurrentPosition', () => {
    beforeEach(() => {
        jest.mocked(requestForegroundPermissionsAsync).mockResolvedValue({status: PermissionStatus.GRANTED, granted: true, canAskAgain: true, expires: 'never'});
        jest.mocked(getLastKnownPositionAsync).mockResolvedValue(null);
        jest.mocked(getCurrentPositionAsync).mockResolvedValue(POSITION);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('asks the platform to give up on the location once the deadline passes', async () => {
        // Given a caller that passes no options of its own
        const success = jest.fn();
        const error = jest.fn();

        // When it asks for the current position
        await getCurrentPosition(success, error);

        // Then the platform is told to stop waiting after CONST.GPS.TIMEOUT
        expect(getCurrentPositionAsync).toHaveBeenCalledWith(expect.objectContaining({timeout: CONST.GPS.TIMEOUT}));
    });

    it('reports a failure instead of a position when the platform gives up', async () => {
        // Given a platform that abandons the request at its deadline
        jest.mocked(getCurrentPositionAsync).mockRejectedValue(new Error('Location request timed out'));
        const success = jest.fn();
        const error = jest.fn();

        // When a caller asks for the current position
        await getCurrentPosition(success, error);

        // Then the caller is told it failed and is never handed a position
        expect(error).toHaveBeenCalledWith(expect.objectContaining({message: 'Location request timed out'}));
        expect(success).not.toHaveBeenCalled();
    });

    it('serves a recent cached fix without starting a live request', async () => {
        // Given a fix the device recorded within CONST.GPS.MAX_AGE
        jest.mocked(getLastKnownPositionAsync).mockResolvedValue(POSITION);
        const success = jest.fn();
        const error = jest.fn();

        // When a caller asks for the current position
        await getCurrentPosition(success, error);

        // Then the cached fix is handed back and no live request is ever started
        expect(getLastKnownPositionAsync).toHaveBeenCalledWith({maxAge: CONST.GPS.MAX_AGE});
        expect(success).toHaveBeenCalledWith(POSITION);
        expect(getCurrentPositionAsync).not.toHaveBeenCalled();
    });

    it('falls back to a live request when no cached fix is recent enough', async () => {
        // Given a device whose cached fix is older than CONST.GPS.MAX_AGE
        jest.mocked(getLastKnownPositionAsync).mockResolvedValue(null);
        const success = jest.fn();
        const error = jest.fn();

        // When a caller asks for the current position
        await getCurrentPosition(success, error);

        // Then a live position is acquired and delivered
        expect(getCurrentPositionAsync).toHaveBeenCalled();
        expect(success).toHaveBeenCalledWith(POSITION);
        expect(error).not.toHaveBeenCalled();
    });

    it('reads no location at all when the user has denied permission', async () => {
        // Given a user who has denied location access
        jest.mocked(requestForegroundPermissionsAsync).mockResolvedValue({status: PermissionStatus.DENIED, granted: false, canAskAgain: true, expires: 'never'});
        const success = jest.fn();
        const error = jest.fn();

        // When a caller asks for the current position
        await getCurrentPosition(success, error);

        // Then the cache is not read either, and the caller is told permission was denied
        expect(error).toHaveBeenCalledWith({code: GeolocationErrorCode.PERMISSION_DENIED, message: 'User denied access to location.'});
        expect(getLastKnownPositionAsync).not.toHaveBeenCalled();
        expect(getCurrentPositionAsync).not.toHaveBeenCalled();
    });
});
