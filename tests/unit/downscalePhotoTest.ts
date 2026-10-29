import {getDownscaledSize} from '@libs/cameraCapture/downscalePhoto';

describe('getDownscaledSize', () => {
    it('leaves a photo at the target resolution alone, rather than re-encoding it', () => {
        // Given photos that already match the camera's 2880x2160 target, in either orientation
        const landscape = {width: 2880, height: 2160};
        const portrait = {width: 2160, height: 2880};

        // When the downscaled size is derived
        // Then neither needs shrinking, so the capture is used as is
        expect(getDownscaledSize(landscape)).toBeUndefined();
        expect(getDownscaledSize(portrait)).toBeUndefined();
    });

    it('leaves a smaller photo alone', () => {
        // Given a photo below the target, as a low-end device may produce
        const size = {width: 1440, height: 1920};

        // When the downscaled size is derived
        // Then it is not upscaled
        expect(getDownscaledSize(size)).toBeUndefined();
    });

    it('shrinks a full-sensor photo so its long edge matches the target and keeps its aspect ratio', () => {
        // Given a 50 MP portrait photo, as VisionCamera v5 returns on some Samsung devices when it ignores the resolution hint
        const size = {width: 6120, height: 8160};

        // When the downscaled size is derived
        const result = getDownscaledSize(size);

        // Then the long edge is capped at 2880 and the 3:4 ratio is preserved, so the file fits the avatar size limit
        expect(result).toEqual({width: 2160, height: 2880});
    });

    it('caps the width of a landscape photo', () => {
        // Given a 16:9 landscape photo larger than the target
        const size = {width: 4000, height: 2250};

        // When the downscaled size is derived
        const result = getDownscaledSize(size);

        // Then the width becomes the long edge cap and the height scales with it
        expect(result).toEqual({width: 2880, height: 1620});
    });
});
