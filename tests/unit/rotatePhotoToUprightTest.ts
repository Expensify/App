import {getUprightRotation} from '@pages/iou/request/step/IOURequestStepScan/utils/rotatePhotoToUpright';

describe('getUprightRotation', () => {
    it('only re-encodes a photo whose metadata already describes it upright, because the decoder applied that rotation', () => {
        // Measured on a Galaxy S20 FE. 1920x1440 on disk with metadata asking for 90, so it decodes as
        // 1440x1920 and turning it again would put it back on its side.
        expect(getUprightRotation({width: 1920, height: 1440, rotation: 90})).toBe(0);
        expect(getUprightRotation({width: 1920, height: 1440, rotation: 270})).toBe(0);
    });

    it('turns a landscape sensor buffer that carries no rotation of its own', () => {
        expect(getUprightRotation({width: 1920, height: 1440, rotation: 0})).toBe(90);
        expect(getUprightRotation({width: 1920, height: 1440, rotation: 180})).toBe(90);
    });

    it('turns the opposite hold the other way, rather than leaving it 180 out', () => {
        // `PhotoFile.orientation` is counter-clockwise, so `landscape-left` (270 CCW) is the 90 clockwise
        // the Galaxy S20 FE needs, and `landscape-right` (90 CCW) has to go the other way.
        expect(getUprightRotation({width: 1920, height: 1440, rotation: 0}, 'landscape-left')).toBe(90);
        expect(getUprightRotation({width: 1920, height: 1440, rotation: 0}, 'landscape-right')).toBe(270);
    });

    it('keeps the verified quarter-turn for a hold that cannot make a landscape frame upright', () => {
        // Only a quarter-turn makes a landscape frame portrait, so these fall back rather than turning 0 or
        // 180 and leaving the receipt on its side.
        expect(getUprightRotation({width: 1920, height: 1440, rotation: 0}, 'portrait')).toBe(90);
        expect(getUprightRotation({width: 1920, height: 1440, rotation: 0}, 'portrait-upside-down')).toBe(90);
    });

    it('ignores the hold for a frame that already decodes upright, since only the decoded frame matters', () => {
        expect(getUprightRotation({width: 1440, height: 1920, rotation: 0}, 'landscape-right')).toBeUndefined();
    });

    it('leaves a photo that is already upright with no metadata alone, rather than re-encoding it', () => {
        // iOS, where react-native-image-size reports the displayed size and no rotation.
        expect(getUprightRotation({width: 2160, height: 2880})).toBeUndefined();
        expect(getUprightRotation({width: 1440, height: 1920, rotation: 0})).toBeUndefined();
    });

    it('re-encodes an upright photo that still carries metadata, so consumers that ignore it see it upright too', () => {
        expect(getUprightRotation({width: 1440, height: 1920, rotation: 180})).toBe(0);
        expect(getUprightRotation({width: 1440, height: 1920, rotation: 90})).toBe(90);
    });

    it('leaves a square photo with no metadata alone', () => {
        expect(getUprightRotation({width: 1440, height: 1440, rotation: 0})).toBeUndefined();
    });
});
