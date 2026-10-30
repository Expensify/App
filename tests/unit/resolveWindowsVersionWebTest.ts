import type ResolveWindowsVersion from '@libs/actions/Device/getDeviceInfo/resolveWindowsVersion/types';

// Import the web implementation explicitly: Jest resolves the platform-split module to index.native.ts.
const resolveWindowsVersion = jest.requireActual<{default: ResolveWindowsVersion}>('@libs/actions/Device/getDeviceInfo/resolveWindowsVersion/index.ts').default;

const windowsDeviceInfo = {appVersion: '9.0.0-0', timestamp: '2026-10-30 00:00:00.000', os: 'Windows', osVersion: '10', deviceName: 'Chrome', deviceVersion: '141.0.0.0'};

function mockPlatformVersion(platformVersion: string) {
    const getHighEntropyValues = jest.fn().mockResolvedValue({platformVersion});
    Object.defineProperty(navigator, 'userAgentData', {value: {getHighEntropyValues}, configurable: true});
    return getHighEntropyValues;
}

describe('resolveWindowsVersion (web)', () => {
    afterEach(() => {
        Object.defineProperty(navigator, 'userAgentData', {value: undefined, configurable: true});
    });

    it('reports Windows 11 when Client Hints return a platform version of 13 or higher', async () => {
        // Given a Windows 11 browser, whose User-Agent still says Windows 10 but whose Client Hints return platform version 15
        mockPlatformVersion('15.0.0');

        // When the Windows version is resolved
        const deviceInfo = await resolveWindowsVersion(windowsDeviceInfo);

        // Then the OS version is corrected to 11 so Device management shows the right Windows version
        expect(deviceInfo).toEqual({...windowsDeviceInfo, osVersion: '11'});
    });

    it('keeps Windows 10 when Client Hints return a platform version below 13', async () => {
        // Given a Windows 10 browser, whose Client Hints return platform version 10
        mockPlatformVersion('10.0.0');

        // When the Windows version is resolved
        const deviceInfo = await resolveWindowsVersion(windowsDeviceInfo);

        // Then the OS version stays 10 because the device really runs Windows 10
        expect(deviceInfo).toEqual(windowsDeviceInfo);
    });

    it('keeps the User-Agent version when the browser does not support Client Hints', async () => {
        // Given a browser without User-Agent Client Hints, like Firefox or Safari
        Object.defineProperty(navigator, 'userAgentData', {value: undefined, configurable: true});

        // When the Windows version is resolved
        const deviceInfo = await resolveWindowsVersion(windowsDeviceInfo);

        // Then the User-Agent version is kept because there is no better source
        expect(deviceInfo).toEqual(windowsDeviceInfo);
    });

    it('keeps the User-Agent version when the Client Hints request fails', async () => {
        // Given a browser whose Client Hints request rejects
        Object.defineProperty(navigator, 'userAgentData', {value: {getHighEntropyValues: jest.fn().mockRejectedValue(new Error('NotAllowedError'))}, configurable: true});

        // When the Windows version is resolved
        const deviceInfo = await resolveWindowsVersion(windowsDeviceInfo);

        // Then the User-Agent version is kept so sign-in still sends device info
        expect(deviceInfo).toEqual(windowsDeviceInfo);
    });

    it('does not query Client Hints on other operating systems', async () => {
        // Given a macOS device in a browser that supports Client Hints
        const getHighEntropyValues = mockPlatformVersion('15.0.0');
        const macDeviceInfo = {...windowsDeviceInfo, os: 'Mac OS', osVersion: '10.15.7'};

        // When the Windows version is resolved
        const deviceInfo = await resolveWindowsVersion(macDeviceInfo);

        // Then the device info is unchanged, because macOS platform versions do not map to Windows releases
        expect(deviceInfo).toEqual(macDeviceInfo);
        expect(getHighEntropyValues).not.toHaveBeenCalled();
    });
});
