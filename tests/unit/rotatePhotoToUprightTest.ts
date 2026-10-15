import {getUprightRotation} from '@pages/iou/request/step/IOURequestStepScan/utils/rotatePhotoToUpright';

describe('getUprightRotation', () => {
    it('leaves a photo whose metadata already describes it upright as captured, rather than re-encoding it', () => {
        expect(getUprightRotation({width: 1920, height: 1440, rotation: 90})).toBeUndefined();
        expect(getUprightRotation({width: 1920, height: 1440, rotation: 270})).toBeUndefined();
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

    it('leaves an upright photo as captured even when it still carries metadata', () => {
        expect(getUprightRotation({width: 1440, height: 1920, rotation: 180})).toBeUndefined();
    });

    it('still turns a frame that decodes landscape, whatever its metadata says', () => {
        // 1440x1920 asking for 90 decodes as 1920x1440, genuinely on its side.
        expect(getUprightRotation({width: 1440, height: 1920, rotation: 90})).toBe(90);
    });

    it('leaves a square photo with no metadata alone', () => {
        expect(getUprightRotation({width: 1440, height: 1440, rotation: 0})).toBeUndefined();
    });
});
