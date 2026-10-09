import hasLocationPermission from '@pages/iou/request/step/IOURequestStepScan/LocationPermission/hasLocationPermission';

const mockGetLocationPermission = jest.fn<Promise<string>, []>();

jest.mock('@pages/iou/request/step/IOURequestStepScan/LocationPermission', () => ({
    getLocationPermission: () => mockGetLocationPermission(),
}));

jest.mock('react-native-permissions', () => ({
    RESULTS: {GRANTED: 'granted', DENIED: 'denied', UNAVAILABLE: 'unavailable', BLOCKED: 'blocked', LIMITED: 'limited'},
}));

describe('hasLocationPermission', () => {
    it.each([
        ['granted', true],
        ['limited', true],
        ['denied', false],
        ['blocked', false],
    ])('resolves %s as %s', async (status, expected) => {
        // Given a device whose permission check returns this status
        mockGetLocationPermission.mockResolvedValue(status);

        // When the permission is checked
        const isGranted = await hasLocationPermission();

        // Then only granted and limited count, because both let the app read the position
        expect(isGranted).toBe(expected);
    });

    it('resolves false when the permission check rejects', async () => {
        // Given a device whose permission check fails outright
        mockGetLocationPermission.mockRejectedValue(new Error('check failed'));

        // When the permission is checked
        const isGranted = await hasLocationPermission();

        // Then it resolves false instead of rejecting, so a submit waiting on it still goes out
        expect(isGranted).toBe(false);
    });
});
