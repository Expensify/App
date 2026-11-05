import {act, renderHook} from '@testing-library/react-native';

import useReceiptPhotoOutput from '@hooks/useReceiptPhotoOutput';

import type {CameraPhotoOutput, Size} from 'react-native-vision-camera';

import {usePhotoOutput} from 'react-native-vision-camera';

function mockOutput(currentResolution: Size | undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    jest.mocked(usePhotoOutput).mockReturnValue({currentResolution} as CameraPhotoOutput);
}

describe('useReceiptPhotoOutput', () => {
    it('requests a 4:3 JPEG so iOS does not save HEIC', () => {
        // Given a receipt camera
        mockOutput(undefined);

        // When the output is created
        renderHook(() => useReceiptPhotoOutput('quality', false));

        // Then it asks for the receipt size in a JPEG container, since v5 defaults to HEIC on iOS
        expect(usePhotoOutput).toHaveBeenLastCalledWith({targetResolution: {width: 2880, height: 2160}, containerFormat: 'jpeg', qualityPrioritization: 'quality'});
    });

    it('frames the requested 4:3 size until the session reports the real one', () => {
        // Given a session that has not configured yet
        mockOutput(undefined);
        const {result} = renderHook(() => useReceiptPhotoOutput('quality', false));

        // When nothing has been reported
        // Then the portrait viewfinder uses the requested 4:3 size
        expect(result.current.cameraAspectRatio).toBeCloseTo(3 / 4);
    });

    it('switches to the size the camera actually saves once configured', () => {
        // Given an Android device whose closest supported size is 16:9
        mockOutput({width: 1920, height: 1080});
        const {result} = renderHook(() => useReceiptPhotoOutput('quality', false));

        // When the session reports its configuration
        act(() => result.current.updatePhotoResolution());

        // Then the viewfinder frames the 16:9 photo it will save
        expect(result.current.cameraAspectRatio).toBeCloseTo(9 / 16);
    });

    it('ignores the 0x0 size iOS reports before the output is configured', () => {
        // Given an output that still reports 0x0
        mockOutput({width: 0, height: 0});
        const {result} = renderHook(() => useReceiptPhotoOutput('quality', false));

        // When the size is read
        act(() => result.current.updatePhotoResolution());

        // Then the viewfinder keeps the requested size instead of a broken ratio
        expect(result.current.cameraAspectRatio).toBeCloseTo(3 / 4);
    });
});
