import {act, renderHook} from '@testing-library/react-native';

import useCameraPhotoAspectRatio from '@hooks/useCameraPhotoAspectRatio';

import type {CameraPhotoOutput, Size} from 'react-native-vision-camera';

const TARGET = {width: 2880, height: 2160};

function createOutput(currentResolution: Size | undefined): CameraPhotoOutput {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {currentResolution} as CameraPhotoOutput;
}

describe('useCameraPhotoAspectRatio', () => {
    it('frames the requested 4:3 size until the session reports the real one', () => {
        // Given a session that has not configured yet
        const {result} = renderHook(() => useCameraPhotoAspectRatio(createOutput(undefined), TARGET, false));

        // When nothing has been reported
        // Then the portrait viewfinder uses the requested 4:3 size
        expect(result.current.cameraAspectRatio).toBeCloseTo(3 / 4);
    });

    it('switches to the size the camera actually saves once configured', () => {
        // Given an Android device whose closest supported size is 16:9
        const output = createOutput({width: 1920, height: 1080});
        const {result} = renderHook(() => useCameraPhotoAspectRatio(output, TARGET, false));

        // When the session reports its configuration
        act(() => result.current.updatePhotoResolution());

        // Then the viewfinder frames the 16:9 photo it will save
        expect(result.current.cameraAspectRatio).toBeCloseTo(9 / 16);
    });

    it('ignores the empty size iOS can report before the output is connected', () => {
        // Given an output that still reports 0x0
        const {result} = renderHook(() => useCameraPhotoAspectRatio(createOutput({width: 0, height: 0}), TARGET, false));

        // When the size is read
        act(() => result.current.updatePhotoResolution());

        // Then the viewfinder keeps the requested size instead of a broken ratio
        expect(result.current.cameraAspectRatio).toBeCloseTo(3 / 4);
    });
});
