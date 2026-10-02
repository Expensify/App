import getWideLensZoom from '@libs/cameraCapture/getWideLensZoom';
import selectWideCameraDevice from '@libs/cameraCapture/selectWideCameraDevice';

import type {CameraDevice, CameraPosition, DeviceType} from 'react-native-vision-camera';

function createDevice({
    id,
    position = 'back',
    lensTypes = [],
    zoomLensSwitchFactors = [],
}: {
    id: string;
    position?: CameraPosition;
    lensTypes?: DeviceType[];
    zoomLensSwitchFactors?: number[];
}): CameraDevice {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const lenses = lensTypes.map((type) => ({type}) as CameraDevice);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {id, position, physicalDevices: lenses, zoomLensSwitchFactors} as unknown as CameraDevice;
}

describe('getWideLensZoom', () => {
    it('opens a wide + ultra-wide device on the wide lens, not the ultra-wide', () => {
        // Given an iPhone virtual device whose ultra-wide lens is zoom 1 and whose wide lens starts at 2
        const device = createDevice({id: 'dual-wide', lensTypes: ['ultra-wide-angle', 'wide-angle'], zoomLensSwitchFactors: [2]});

        // When the opening zoom is derived
        // Then it is the wide lens, the 1x of the Camera app, as v4's neutralZoom was
        expect(getWideLensZoom(device)).toBe(2);
    });

    it('opens on the wide lens of a triple-camera device', () => {
        // Given an ultra-wide + wide + telephoto device switching at 2 and 6
        const device = createDevice({id: 'triple', lensTypes: ['ultra-wide-angle', 'wide-angle', 'telephoto'], zoomLensSwitchFactors: [2, 6]});

        // When the opening zoom is derived
        // Then it skips past the ultra-wide only
        expect(getWideLensZoom(device)).toBe(2);
    });

    it('uses zoom 1 when the wide lens is already the first lens, or there are no lenses to switch', () => {
        // Given a wide + telephoto device, and a single-lens device (which v5 reports with no physical devices)
        const wideAndTele = createDevice({id: 'dual', lensTypes: ['wide-angle', 'telephoto'], zoomLensSwitchFactors: [2]});
        const singleLens = createDevice({id: 'single'});

        // When the opening zoom is derived
        // Then both open at 1, which is already the wide lens
        expect(getWideLensZoom(wideAndTele)).toBe(1);
        expect(getWideLensZoom(singleLens)).toBe(1);
    });
});

describe('selectWideCameraDevice', () => {
    it('prefers the wide + ultra-wide device for the requested side', () => {
        // Given a list where the dual-wide device is not first, as v5's own filter would pick on a tie
        const triple = createDevice({id: 'triple', lensTypes: ['ultra-wide-angle', 'wide-angle', 'telephoto']});
        const dualWide = createDevice({id: 'dual-wide', lensTypes: ['ultra-wide-angle', 'wide-angle']});
        const fallback = createDevice({id: 'default'});

        // When the back camera is chosen
        // Then it is the wide + ultra-wide device that v4's physicalDevices filter selected
        expect(selectWideCameraDevice([triple, dualWide], 'back', fallback)?.id).toBe('dual-wide');
    });

    it('falls back to the platform default camera when there is no wide + ultra-wide device', () => {
        // Given a single-lens phone, and an Android-style list whose lenses report no usable types
        const singleLens = createDevice({id: 'single'});
        const fallback = createDevice({id: 'default'});
        const frontDualWide = createDevice({id: 'front-dual', position: 'front', lensTypes: ['ultra-wide-angle', 'wide-angle']});

        // When the back camera is chosen
        // Then the default back camera is used, and a front device is never picked for the back
        expect(selectWideCameraDevice([singleLens, frontDualWide], 'back', fallback)?.id).toBe('default');
    });
});
