import type * as LocationPermissionModule from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';

jest.mock('react-native-permissions', () => ({
    RESULTS: {GRANTED: 'granted', DENIED: 'denied', UNAVAILABLE: 'unavailable', BLOCKED: 'blocked', LIMITED: 'limited'},
}));

// Jest resolves the bare path to the native file, so load the web one by name
const {getLocationPermission} = jest.requireActual<typeof LocationPermissionModule>('@pages/iou/request/step/IOURequestStepScan/LocationPermission/index.ts');

describe('getLocationPermission on web', () => {
    const originalGeolocation = navigator.geolocation;
    const originalPermissions = navigator.permissions;

    afterEach(() => {
        Object.defineProperty(navigator, 'geolocation', {value: originalGeolocation, configurable: true});
        Object.defineProperty(navigator, 'permissions', {value: originalPermissions, configurable: true});
    });

    it('settles as unavailable when the Permissions API rejects the geolocation query', async () => {
        // Given a browser that has geolocation but rejects a geolocation query in the Permissions API
        Object.defineProperty(navigator, 'geolocation', {value: {}, configurable: true});
        Object.defineProperty(navigator, 'permissions', {value: {query: () => Promise.reject(new TypeError('unsupported'))}, configurable: true});

        // When the permission is checked
        const status = await getLocationPermission();

        // Then it settles instead of hanging, because the scan submit waits on this before it goes out
        expect(status).toBe('unavailable');
    });
});
